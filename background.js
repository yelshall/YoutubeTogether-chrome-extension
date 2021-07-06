//Global Variables
const messages = [];

var currentVideoState = "noVid";
var currentTimeStamp = 0;
var connected = false;
var settings = false;
var master = false;
var inUse = false;
var socket = null;
var username = null;
var vidURL = null;
var wtId = null;
var userId = null;
var currTabId = null;

//Get wtId from url
chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    chrome.tabs.onUpdated.addListener(function(_tabId, changeInfo, tab) {
        if (changeInfo.url && changeInfo.url.includes("&wt=")) {
            wtId = getWtIdFromUrl(changeInfo.url);
            currTabId = _tabId;
        }
    });

    chrome.tabs.onRemoved.addListener(function(tabId, changeInfo, tab) {
        if (tabId == currTabId) {
            wtId = null;
        }
    });
});

chrome.webNavigation.onHistoryStateUpdated.addListener(function(details) {
    if (details.tabId == currTabId) {
        chrome.tabs.executeScript(null, { file: "contentScript.js" });
    }
});

//Set when the extension is active
chrome.runtime.onInstalled.addListener(function() {
    chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
        chrome.declarativeContent.onPageChanged.addRules([{
            conditions: [
                new chrome.declarativeContent.PageStateMatcher({
                    pageUrl: { urlContains: 'https://www.youtube.com/watch' },
                })
            ],
            actions: [new chrome.declarativeContent.ShowPageAction()]
        }]);
    });
});

//Listener from popup or content script
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.type == "usernameInput") {
        username = request.data.username;
    } else if (request.type == "connect") {
        //Initial connection to server
        inUse = true;
        if (!connected) {
            chrome.pageAction.setPopup({ popup: "./Pages/watch.html", tabId: request.id });
            connected = true;
            serverConnect(request.videoId, request.id, username);
        } else {
            chrome.pageAction.setPopup({ popup: "./Pages/watch.html", tabId: request.id });

            sendMessage("data", { username: username, wtId: wtId, url: vidURL, settings: settings });
        }
    } else if (request.type == "getMessages") {
        //Get messages
        getMessagesServer();
    } else if (request.type == "disconnect") {
        //Disconnect from server
        chrome.pageAction.setPopup({ popup: "./Pages/index.html", tabId: request.id });
        messages.length = 0;
        connected = false;
        settings = false;
        inUse = false;
        serverDisconnect();
    } else if (request.type == "addMessage") {
        sendMessageServer({
            message: {
                name: request.data.name,
                message: request.data.message,
                type: request.data.type

            },
            wtId: wtId,
            userId: userId
        });
    } else if (request.type == "getData") {
        //Get data
        sendMessage("data", { url: vidURL, username: username, wtId: wtId, settings: settings });
    } else if (request.type == "play" || request.type == "pause") {
        if (connected && master) {
            sendVidData(request.data.timeStamp, request.data.vidState, "playPause");
        }
    } else if (request.type == "durationChange") {
        if (connected && master) {
            sendVidData(request.data.timeStamp, request.data.vidState, "durationChange");
        }
    } else if (request.type == "userList") {
        getUserList();
    } else if (request.type == "settings") {
        settings = request.data.settings;
    } else if (request.type == "changeUsername") {
        changeUsernameServer(request.data.name);
    }
    return true;
});

//Connect to server
var serverConnect = function(videoId, tabId, username) {
    socket = io("https://desolate-caverns-55627.herokuapp.com/");

    //socket = io("http://192.168.0.182:3000");
    //Send videoId and wtId to server
    socket.emit("serverConnect", { videoId: videoId, wtId: wtId, username });

    //Receive inital data
    socket.on("data", (initData) => {
        console.log(initData);
        username = initData.username;
        vidURL = initData.url;
        wtId = initData.wtId;
        currTabId = tabId;
        userId = initData.userId;
        master = initData.master;


        //Send Initial data to popup script
        sendMessage("data", { username: username, wtId: wtId, url: vidURL, settings: settings });
    });

    //Receive messages from other clients
    socket.on("message", (response) => {
        console.log(response);
        //messages.push(response.message);
        sendMessage("message", { message: response.message });
    });

    socket.on("messages", (response) => {
        sendMessage("messages", { messages: response.message });
    });

    if (!master) {
        socket.on("vidData", (response) => {
            sendMessage('changeVid', { timeStamp: response.timeStamp, vidState: response.vidState, type: response.type }, null, true);
        });
    }

    socket.on("userList", (response) => {
        sendMessage("userList", { users: response.userList });
    });

    socket.on("newUserList", (response) => {
        sendMessage("newUserList", { users: response.userList });
    });

    socket.on("newUser", (response) => {
        sendMessage("newUser", { user: response.user });
    });

    socket.on("newName", (response) => {
        username = response.name;
        sendMessage("newName", { name: response.name });
    });

    socket.on("setMaster", (response) => {
        master = true;
        sendMessage("setMaster", {});
    });
};

//Send message to server
var sendMessageServer = function(message) {
    socket.emit("message", message);
};

var sendVidData = function(timeStamp, vidState, type) {
    socket.emit("vidData", { timeStamp: timeStamp, vidState: vidState, wtId: wtId, userId: userId, username: username, type: type });
};

var getMessagesServer = function() {
    socket.emit("getMessages", { wtId: wtId, userId: userId });
};

var getUserList = function() {
    socket.emit("userList", { wtId: wtId, userId: userId });
};

var changeUsernameServer = function(name) {
    socket.emit("changeUsername", { name: name, userId: userId, wtId: wtId });
}

//Disconnect from server
var serverDisconnect = function() {
    try {
        socket.emit("sendDisconnect", { wtId: wtId, userId: userId });
        socket.disconnect();
        wtId = null;
        username = null;
    } catch (err) {
        console.log("Failed to disconnect to server");
    }
};

//Send message function
var sendMessage = function(type, data, callback, toCS = false) {
    if (callback) {
        if (toCS) {
            chrome.tabs.sendMessage(currTabId, { type: type, data: data }, function(response) {
                callback(response);
            });
        } else {
            chrome.runtime.sendMessage({ type: type, data: data }, function(response) {
                callback(response);
            });
        }
    } else {
        if (toCS) {
            chrome.tabs.sendMessage(currTabId, { type: type, data: data });
        } else {
            chrome.runtime.sendMessage({ type: type, data: data });
        }
    }
};

//Get wtId from URL
function getWtIdFromUrl(url) {
    let segments = url.split('&');

    for (var i = 0; i < segments.length; i++) {

        let segment = segments[i].split('=');

        if (segment.length == 2 && segment[0] == 'wt') {
            return segment[1];
        }
    }

    return '';
}
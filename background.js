//Global Variables
const messages = [];

var currentVideoState = "noVid";
var currentTimeStamp = 0;
var connected = false;
var socket = null;
var username = null;
var vidURL = null;
var wtId = null;
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
    if (request.type == "connect") {
        //Initial connection to server
        if (!connected) {
            chrome.pageAction.setPopup({ popup: "./Pages/watch.html", tabId: request.id });
            connected = true;
            serverConnect(request.videoId, request.id);
        } else {
            sendMessage("data", { username: username, wtId: wtId, url: vidURL });
        }
    } else if (request.type == "getMessages") {
        //Get messages
        //sendResponse({ messages: messages });
        getMessagesServer();
    } else if (request.type == "disconnect") {
        //Disconnect from server
        chrome.pageAction.setPopup({ popup: "./Pages/index.html", tabId: request.id });
        messages.length = 0;
        connected = false;
        serverDisconnect();
    } else if (request.type == "addMessage") {
        sendMessageServer({
            message: {
                name: request.data.name,
                message: request.data.message,
                type: request.data.type

            },
            wtId: wtId
        });
    } else if (request.type == "getData") {
        //Get data
        sendMessage("data", { url: vidURL, username: username, wtId: wtId });
    } else if (request.type == "play" && connected) {
        //Todo: Add controlling video functionality
        currentVideoState = "play";
        sendVidData(currentTimeStamp, currentVideoState);
    } else if (request.type == "pause" && connected) {
        currentVideoState = "pause";
        sendVidData(currentTimeStamp, currentVideoState);
    } else if (request.type == "durationChange" && connected) {
        if (request.data.timeStamp < 0.1 && currentVideoState != "pause") {
            currentVideoState = "play";
        }
        currentTimeStamp = request.data.timeStamp;
        sendVidData(currentTimeStamp, currentVideoState);
    }
    return true;
});

//Connect to server
var serverConnect = function(videoId, tabId) {
    socket = io("http://192.168.0.182:3000");

    //Send videoId and wtId to server
    socket.emit("serverConnect", { videoId: videoId, wtId: wtId });

    //Receive inital data
    socket.on("data", (initData) => {
        username = initData.username;
        vidURL = initData.url;
        wtId = initData.wtId;
        currTabId = tabId;

        //Send Initial data to popup script
        sendMessage("data", { username: username, wtId: wtId, url: vidURL });
    });

    //Receive messages from other clients
    socket.on("message", (response) => {
        //messages.push(response.message);
        sendMessage("message", { message: response.message });
    });

    socket.on("messages", (response) => {
        sendMessage("messages", { messages: response.message });
    });

    socket.on("vidData", (response) => {
        if (response.vidState != currentVideoState) {
            //send message to content script to pause/play vid
            sendMessage('changeVid', { timeStamp: response.timeStamp, vidState: response.vidState }, null, true);
        }

        if (Math.abs(response.timeStamp - currentTimeStamp) > 2.0) {
            //Send message to content script to change timestamp
            sendMessage('changeVid', { timeStamp: response.timeStamp, currentVideoState: response.vidState }, null, true);
        }
    });
};

//Send message to server
var sendMessageServer = function(message) {
    socket.emit("message", message);
};

var sendVidData = function(timeStamp, vidState) {
    socket.emit("vidData", { timeStamp: timeStamp, vidState: vidState, wtId: wtId, username: username });
};

var getMessagesServer = function() {
    socket.emit("getMessages", { wtId: wtId });
};

//Disconnect from server
var serverDisconnect = function() {
    try {
        socket.emit("sendDisconnect", { wtId: wtId });
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
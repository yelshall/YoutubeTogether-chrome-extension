const messages = [];

var currentVideoState = "noVid";
var connected = false;
var socket = null;
var username = null;
var roomId = null;
var vidURL = null;

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
    //Initial connection to server
    if (request.type == "connect" && !connected) {
        chrome.pageAction.setPopup({ popup: "./Pages/watch.html", tabId: request.id });
        connected = true;
        serverConnect(request.url);
    } else if (request.type == "getMessages") {
        console.log("here", messages);
        sendResponse({ messages: messages });
    } else if (request.type == "disconnect") {
        chrome.pageAction.setPopup({ popup: "./Pages/index.html", tabId: request.id });
        messages.length = 0;
        connected = false;
        serverDisconnect();
    } else if (request.type == "addMessage") {
        //Fix messages being shared by all
        messages.push({
            name: request.data.name,
            message: request.data.message,
            type: request.data.type
        });

        sendMessageServer({
            message: {
                name: request.data.name,
                message: request.data.message,
                type: request.data.type
            },
            roomId: roomId
        });
    } else if (request.type == "getData") {
        console.log("here", vidURL, username);
        sendMessage("data", { url: vidURL, username: username });
    } else if (request.type == "play" && connected) {
        //Adding changing timestamp functionality
        currentVideoState = "play";
    } else if (request.type == "pause" && connected) {
        currentVideoState = "pause";
    } else if (request.type == "durationChange" && connected) {
        currentTimeStamp = request.data.timeStamp;
    }
    return true;
});

var serverConnect = function(url) {
    socket = io("http://192.168.0.182:3000");

    socket.emit("serverConnect", { url: url });

    socket.on("initData", (initData) => {
        username = initData.username;
        vidURL = initData.url;
        roomId = initData.roomId;

        sendMessage("initData", { username: username, url: vidURL });
    });

    socket.on("message", (response) => {
        messages.push(response.message);
        sendMessage("message", { message: response.message });
    });
}

var sendMessageServer = function(message) {
    socket.emit("message", message);
}

var serverDisconnect = function() {
    try {
        socket.disconnect();
    } catch (err) {
        console.log("Failed to disconnect to server");
    }
}

var sendMessage = function(type, data, callback) {
    if (callback) {
        chrome.runtime.sendMessage({ type: type, data: data }, function(response) {
            callback(response);
        });
    } else {
        chrome.runtime.sendMessage({ type: type, data: data });
    }
}
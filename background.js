const messages = [];

var currentVideoState = "noVid";
var connected = false;
var socket = null;
var username = null;
var vidURL = null;
var wtId = null;
var videoId = null;
var currTabId = null;

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
    //Initial connection to server
    if (request.type == "connect" && !connected) {
        chrome.pageAction.setPopup({ popup: "./Pages/watch.html", tabId: request.id });
        connected = true;
        serverConnect(request.videoId, wtId);
    } else if (request.type == "getMessages") {
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
            wtId: wtId
        });
    } else if (request.type == "getData") {
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

var serverConnect = function(videoId, wtId) {
    socket = io("http://192.168.1.210:3000");
    console.log(videoId, wtId);
    socket.emit("serverConnect", { videoId: videoId, wtId: wtId });

    socket.on("initData", (initData) => {
        username = initData.username;
        vidURL = initData.url;
        wtId = initData.wtId;

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
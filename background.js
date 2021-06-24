const messages = [];
var currentVideoState = "noVid";
var connected = false;
var socket = null;
var username = null;
var url = null;

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

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.type == "connect") {
        chrome.pageAction.setPopup({ popup: "./Pages/watch.html", tabId: request.id });
        sendResponse({ messages: messages });
        connected = true;
        url = "https://www.youtube.com/watch?v=usbJwJEr9cI";
        connect();
    } else if (request.type == "disconnect") {
        chrome.pageAction.setPopup({ popup: "./Pages/index.html", tabId: request.id });
        messages.length = 0;
        connected = false;
        disconnect();
    } else if (request.type == "addMessage") {
        //Fix messages being shared by all
        messages.push({
            name: request.data.name,
            message: request.data.message,
            messageType: request.data.messageType
        });
        sendMessage(message);
    } else if (request.type == "play" && connected) {
        //Adding changing timestamp functionality
        currentVideoState = "play";
        console.log("Video Played");
    } else if (request.type == "pause" && connected) {
        currentVideoState = "pause";
        console.log("Video Paused");
    } else if (request.type == "durationChange" && connected) {
        currentTimeStamp = request.data.timeStamp;
        console.log(currentTimeStamp);
    }
    return true;
});

var connect = function() {
    try {
        socket = io("http://192.168.0.182:3000");

        socket.emit("connect", { url: url });

        socket.on("initData", (initData) => {
            username = initData.username;
            url = initData.url;
        });

        socket.on("message", (message) => {
            console.log("yo");
            messages.push(message);
            chrome.runtime.sendMessage({ type: "message", data: message, id: -1 });
        });
    } catch (err) {
        console.log("Failed to connect to server");
    }
}

var sendMessage = function(message) {
    socket.emit("message", message);
}

var disconnect = function() {
    try {
        socket.disconnect();
    } catch (err) {
        console.log("Failed to disconnect to server");
    }
}
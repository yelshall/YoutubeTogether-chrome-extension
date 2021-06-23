const messages = [];
const currentVideoState = "noVid";
const connected = false;

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
    } else if (request.type == "disconnect") {
        chrome.pageAction.setPopup({ popup: "./Pages/index.html", tabId: request.id });
        messages.length = 0;
        connected = false;
    } else if (request.type == "addMessage") {
        //Fix messages being shared by all
        messages.push({
            name: request.data.name,
            message: request.data.message,
            messageType: request.data.messageType
        });
    } else if (request.type == "play") {
        //Adding changing timestamp functionality
        if (connected) {
            currentVideoState = "play";
        }
    } else if (request.type == "pause") {
        if (connected) {
            currentVideoState = "pause";
        }
    } else if (request.type == "durationChange") {
        if (connected) {
            currentTimeStamp = request.data.timeStamp;
        }
    }
    return true;
});

try {
    const socket = io("http://localhost:3000");
} catch (err) {
    console.log("Failed to connect to server");
}
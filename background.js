const messages = [];

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
        return true;
    } else if (request.type == "disconnect") {
        chrome.pageAction.setPopup({ popup: "./Pages/index.html", tabId: request.id });
        messages.length = 0;
        return true;
    } else if (request.type == "addMessage") {
        //Fix messages being shared by all
        messages.push({
            name: request.data.name,
            message: request.data.message,
            messageType: request.data.messageType
        });
        return true;
    }
    return true;
});

//const socket = io("http://localhost:3000");
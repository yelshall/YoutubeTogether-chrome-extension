//Global Variables
const chatcontainer = document.getElementById('chat');
const inputChat = document.getElementById('submit-button');
const copyBtn = document.getElementById('copy-btn');
const linkBox = document.getElementById('share-url');
const quitBtn = document.getElementById('leave-session');

var tabId = null;
var username = null;
var url = null;

//Get tabId, videoURL
chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    tabId = tabs[0].id;
    url = tabs[0].url;
});

//Connect to server

//Send message function to background script
var sendMessage = function(type, data, callback) {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        chrome.runtime.sendMessage({ type: type, data: data, id: tabs[0].id }, function(response) {
            if (callback) {
                callback(response);
            }
        });
    });
}

//Append Message to chat container
var addMessage = function(name, type, message) {
    if (type == "createjoinleave") {
        let chatMessage = '<p id="message"><i><b>' + name + '<b> ' + message + '</i></p>';
        chatcontainer.innerHTML += chatMessage;
    } else if (type == "message") {
        let chatMessage = '<p><b>' + name + '</b>: ' + message + '</p>';
        chatcontainer.innerHTML += chatMessage;
    }

    chatcontainer.scrollTop = chatcontainer.scrollHeight;
};

//Set URL in linkBox
var changeLink = function(urlLink) {
    linkBox.value = urlLink;
};

//Add button functionality for messaging
//Todo: Implement all types after doing all the server stuff
inputChat.addEventListener('click', (event) => {
    event.preventDefault();
    let message = document.getElementById('message-input');

    if (message.value != "") {
        addMessage("placeHolderName", "message", message.value);

        sendMessage("addMessage", {
            name: "PlaceHolderName",
            message: message.value,
            messageType: "message"
        });

        message.value = ""
    }
});

//Add button functionality for copying the URL
copyBtn.addEventListener('click', () => {
    linkBox.select();
    document.execCommand('copy');
});

//Add button functionality for quitting to main page
quitBtn.addEventListener('click', () => {
    sendMessage("disconnect", {});
});

//Placeholder code
changeLink("PlaceHolder URL");

sendMessage("connect", { url: url }, function(response) {
    for (let i = 0; i < response.messages.length; i++) {
        addMessage(
            response.messages[i].name,
            response.messages[i].messageType,
            response.messages[i].message
        );
    }
});

chrome.runtime.onMessage(function(request, sender, sendResponse) {
    if (request.type == "message") {
        message = request.data.message;
        addMessage(message.name, message.type, message.message);
    }
});
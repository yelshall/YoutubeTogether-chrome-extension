'use strict';

//Global Variables
const chatcontainer = document.getElementById('chat');
const inputChat = document.getElementById('submit-button');
const copyBtn = document.getElementById('copy-btn');
const linkBox = document.getElementById('share-url');
const quitBtn = document.getElementById('leave-session');

var username = null;

//Send message function to background script
var sendMessage = function(type, data, callback) {
    if (callback) {
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            chrome.runtime.sendMessage({ type: type, data: data, id: tabs[0].id, url: tabs[0].url }, function(response) {
                callback(response);
            });
        });
    } else {
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            chrome.runtime.sendMessage({ type: type, data: data, id: tabs[0].id, url: tabs[0].url });
        });
    }
}

//Append Message to chat container
var addMessage = function(name, type, message) {
    if (type == "createjoinleave") {
        let chatMessage = '<p id="message"><i><b>' + name + '<b> ' + message + '</i></p>';
        chatcontainer.innerHTML += chatMessage;
        console.log("here");
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
        addMessage(username, "message", message.value);

        sendMessage("addMessage", {
            name: username,
            message: message.value,
            type: "message"
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

sendMessage("connect", {});

sendMessage("getData", {});

sendMessage("getMessages", {}, function(response) {
    for (let i = 0; i < response.messages.length; i++) {
        addMessage(
            response.messages[i].name,
            response.messages[i].type,
            response.messages[i].message
        );
    }
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.type == "message") {
        let message = request.data.message;
        addMessage(message.name, message.type, message.message);
    } else if (request.type == "initData") {
        username = request.data.username;
        changeLink(request.data.url);
    } else if (request.type == "data") {
        username = request.data.username;
        changeLink(request.data.url);
    }
    return true;
});
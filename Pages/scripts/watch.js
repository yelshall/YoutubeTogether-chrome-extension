'use strict';

//Global Variables
const chatcontainer = document.getElementById('chat');
const inputChat = document.getElementById('submit-button');
const copyBtn = document.getElementById('copy-btn');
const linkBox = document.getElementById('share-url');
const quitBtn = document.getElementById('leave-session');

var username = null;

//Send message function
var sendMessage = function(type, data, callback) {
    if (callback) {
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            chrome.runtime.sendMessage({
                type: type,
                data: data,
                id: tabs[0].id,
                videoId: getVideoIdFromUrl(tabs[0].url)
            }, function(response) {
                callback(response);
            });
        });
    } else {
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            chrome.runtime.sendMessage({
                type: type,
                data: data,
                id: tabs[0].id,
                videoId: getVideoIdFromUrl(tabs[0].url)
            });
        });
    }
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
    username = null;
});

//Initial connection to the server
sendMessage("connect", {});

//Get messages from background script
/*, function(response) {
    for (let i = 0; i < response.messages.length; i++) {
        addMessage(
            response.messages[i].name,
            response.messages[i].type,
            response.messages[i].message
        );
    }   
});*/

//Message listener
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.type == "message") {
        let message = request.data.message;
        addMessage(message.name, message.type, message.message);
    } else if (request.type == "messages") {
        for (let i = 0; i < request.data.messages.length; i++) {
            addMessage(
                request.data.messages[i].name,
                request.data.messages[i].type,
                request.data.messages[i].message
            );
        }
    } else if (request.type == "data") {
        username = request.data.username;
        changeLink(request.data.url);
        sendMessage("getMessages", {});
    } else if (request.type == "changeVid") {
        console.log("it's working here wtf");
    }
    return true;
});

//Get video id from url
var getVideoIdFromUrl = function(url) {
    let videoId = url.split('=')[1]
    videoId = videoId.split('&')[0]
    return videoId
}
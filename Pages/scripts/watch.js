'use strict';

//Global Variables
const chatcontainer = document.getElementById('chat');
const inputChat = document.getElementById('submit-button');
const copyBtn = document.getElementById('copy-btn');
const linkBox = document.getElementById('share-url');
const quitBtn = document.getElementById('leave-session');
const settingsBtn1 = document.getElementById('settings-button-1');
const settingsBtn2 = document.getElementById('settings-button-2')
const settingsList = document.getElementById('settings-list');

const chatContainer = document.getElementsByClassName("container")[0];
const form = document.getElementsByClassName('send-message')[0];
const settingsContainer = document.getElementsByClassName("settings")[0];

var username = null;
var settings = false;

chatcontainer.style.display = "none";
form.style.display = "none";
settingsContainer.style.display = "none";

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
};

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

var appendUsers = function(userList) {
    for (let i = 0; i < userList.length; i++) {
        if (userList[i].master) {
            let user = '<p id="userSettings"><i><b>' + userList[i].username + '<b> (Master)</i></p>';
            settingsList.innerHTML += user;
        } else {
            let user = '<p id="userSettings"><i><b>' + userList[i].username + '<b></i></p>';
            settingsList.innerHTML += user;
        }
    }
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

settingsBtn1.addEventListener('click', (event) => {
    event.preventDefault();

    chatcontainer.style.display = "none";
    form.style.display = "none";
    settingsContainer.style.display = "block";
    settings = true;
    sendMessage("settings", { settings: settings });
});

settingsBtn2.addEventListener('click', (event) => {
    event.preventDefault();

    chatcontainer.style.display = "block";
    form.style.display = "block";
    settingsContainer.style.display = "none";
    settings = false;
    sendMessage("settings", { settings: settings });
});

//Initial connection to the server
sendMessage("connect", {});

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

        if (!request.data.settings) {
            chatcontainer.style.display = "block";
            form.style.display = "block";
            settingsContainer.style.display = "none";

            settings = false;
        } else {
            chatcontainer.style.display = "none";
            form.style.display = "none";
            settingsContainer.style.display = "block";
            settings = true;
        }

        sendMessage("userList", {});
        sendMessage("getMessages", {});
    } else if (request.type == "userList") {
        appendUsers(request.data.users);
    }
    return true;
});

//Get video id from url
var getVideoIdFromUrl = function(url) {
    let videoId = url.split('=')[1]
    videoId = videoId.split('&')[0]
    return videoId
}
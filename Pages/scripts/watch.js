'use strict';

//Global Variables
const chatcontainer = document.getElementById('chat');
const inputChat = document.getElementById('submit-button');
const copyBtn = document.getElementById('copy-btn');
const linkBox = document.getElementById('share-url');
const quitBtn = document.getElementById('leave-session');
const settingsBtn = document.getElementById('settings-button');
const settingsList = document.getElementById('settings-list');
const supportTxt = document.getElementById('support-text');
const changeUsername = document.getElementById('change-button');
const usernameDisplay = document.getElementById('settings-username-display');
const changeMaster = document.getElementById('change-master');
const labelChange = document.getElementById('list-change');

const settingsButtonDiv = document.getElementById('set-button');

const bodyContainer = document.getElementsByClassName('body')[0];
const form = document.getElementsByClassName('send-message')[0];
const settingsContainer = document.getElementsByClassName("settings")[0];

var username = null;
var master = false;
var settings = false;

bodyContainer.style.display = "none";
form.style.display = "none";
settingsContainer.style.display = "none";
supportTxt.style.display = "none";

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
        let chatMessage = '<p id="createjoinleave"><i><b>' + name + ' ' + message + '</b></i></p>';
        chatcontainer.innerHTML += chatMessage;
    } else if (type == "message") {
        let chatMessage = '<p id="message">' + name + ': ' + message + '</p>';
        chatcontainer.innerHTML += chatMessage;
    } else if (type == "changeUsername") {
        let chatMessage = '<p id="createjoinleave"><i><b>' + message + '</b></i></p>';
        chatcontainer.innerHTML += chatMessage;
    } else if (type == "newMaster") {
        let chatMessage = '<p id="createjoinleave"><i><b>' + message + '</b></i></p>';
        chatcontainer.innerHTML += chatMessage;
    }

    chatcontainer.scrollTop = chatcontainer.scrollHeight;
};

//Set URL in linkBox
var changeLink = function(urlLink) {
    linkBox.value = urlLink;
};

var appendUsers = function(userList) {
    settingsList.innerHTML = "";
    changeMaster.innerHTML = "";
    changeMaster.innerHTML += '<option value="none" Selected>-</option>';



    for (let i = 0; i < userList.length; i++) {
        if (userList[i].master) {
            let user = '<p class="userSettings"><i>' + userList[i].username + ' (Master)</i></p>';
            settingsList.innerHTML += user;
        } else {
            let user = '<p class="userSettings"><i>' + userList[i].username + '</i></p>';
            let userChange = '<option value="' + userList[i].userId + '">' + userList[i].username + "</option>";

            settingsList.innerHTML += user;
            changeMaster.innerHTML += userChange;
        }
    }
};

var appendUser = function(user) {
    let username = '<p id="userSettings"><i>' + user.username + '</i></p>';
    let userChange = '<option value="' + user.userId + '">' + user.username + "</option>";

    settingsList.innerHTML += username;
    changeMaster.innerHTML += userChange;
};

var settingsUsernameDisplay = function() {
    usernameDisplay.innerHTML = "";
    usernameDisplay.innerHTML += "Username: " + username;
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

        message.value = "";
    }
});

changeUsername.addEventListener('click', (event) => {
    event.preventDefault();

    let name = document.getElementById('change-username');

    if (name.value != "") {
        sendMessage("changeUsername", { name: name.value });
        name.value = "";
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

settingsBtn.addEventListener('click', (event) => {
    event.preventDefault();

    if (!settings) {
        bodyContainer.style.display = "none";
        form.style.display = "none";
        settingsContainer.style.display = "block";
        supportTxt.style.display = "block";

        settingsButtonDiv.style.backgroundColor = '#ff4e00';
        settingsBtn.src = '../images/64gear1.png';

        settings = true;
        sendMessage("settings", { settings: settings });
    } else {
        bodyContainer.style.display = "block";
        form.style.display = "block";
        settingsContainer.style.display = "none";
        supportTxt.style.display = "none";


        settingsButtonDiv.style.backgroundColor = '#171717';
        settingsBtn.src = '../images/64gear2.png';

        settings = false;
        sendMessage("settings", { settings: settings });
    }
});

changeMaster.addEventListener('change', (event) => {
    event.preventDefault();

    if (changeMaster.value != "none") {
        let userId = changeMaster.value;

        changeMaster.value = "none";

        sendMessage("changeMaster", { userId: userId });
        changeMaster.style.display = "none";
    }
});

//Initial connection to the server
sendMessage("connect", {});

//Message listener
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.type == "message") {
        let message = request.data.message;
        addMessage(message.name, message.type, message.message);
    } else if (request.type == "messages") {
        chatcontainer.innerHTML = "";

        for (let i = 0; i < request.data.messages.length; i++) {
            addMessage(
                request.data.messages[i].name,
                request.data.messages[i].type,
                request.data.messages[i].message
            );
        }
    } else if (request.type == "data") {
        username = request.data.username;
        master = request.data.master;
        changeLink(request.data.url);

        if (!request.data.settings) {
            bodyContainer.style.display = "block";
            form.style.display = "block";
            settingsContainer.style.display = "none";
            supportTxt.style.display = "none";

            settingsButtonDiv.style.backgroundColor = '#171717';
            settingsBtn.src = '../images/64gear2.png';

            settings = false;
        } else {
            bodyContainer.style.display = "none";
            form.style.display = "none";
            settingsContainer.style.display = "block";
            supportTxt.style.display = "block";

            settingsButtonDiv.style.backgroundColor = '#ff4e00';
            settingsBtn.src = '../images/64gear1.png';

            settings = true;
        }

        if (master) {
            labelChange.style.display = "block";
            changeMaster.style.display = "block";
        } else {
            labelChange.style.display = "none";
            changeMaster.style.display = "none";
        }

        sendMessage("userList", {});
        sendMessage("getMessages", {});
    } else if (request.type == "userList") {
        appendUsers(request.data.users);
        settingsUsernameDisplay();
    } else if (request.type == "newUser") {
        appendUser(request.data.user);
    } else if (request.type == "newName") {
        username = request.data.name;

        usernameDisplay.innerHTML = "";
        settingsUsernameDisplay();
    } else if (request.type == "newUserList") {
        if (master) {
            labelChange.style.display = "block";
            changeMaster.style.display = "block";
        } else {
            labelChange.style.display = "none";
            changeMaster.style.display = "none";
        }

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
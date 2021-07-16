const startWatchingBtn = document.getElementById('start-watching-button');
const usernameBtn = document.getElementById('username-button');
const usernameDiv = document.getElementById('username');
const startDiv = document.getElementById('disconnected');

usernameDiv.style.display = "none";

startWatchingBtn.addEventListener('click', (event) => {
    event.preventDefault();

    startDiv.style.display = "none";
    usernameDiv.style.display = "block";
});

usernameBtn.addEventListener('click', (event) => {
    event.preventDefault();
    let input = document.getElementById('username-input');
    sendMessage('usernameInput', { username: input.value }, (response) => {
        if (response.connect) {
            window.location.href = './watch.html';
        } else {
            startDiv.style.display = "block";
            usernameDiv.style.display = "none";
            document.getElementById('username-input').value = "";
            alert("YoutubeTogether is already in use in another tab!")
        }
    });
});

var sendMessage = function(type, data, callback) {
    if (callback) {
        chrome.runtime.sendMessage({ type: type, data: data }, function(response) {
            callback(response);
        });
    } else {
        chrome.runtime.sendMessage({ type: type, data: data });
    }
};
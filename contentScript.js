const ytVideo = document.querySelector("video");
var pastTimeStamp = 0;
var currentVidState = "play";
var changeVidState = true;

ytVideo.addEventListener('play', () => {
    currentVidState = "play";
    if (changeVidState) {
        chrome.runtime.sendMessage({ type: "play", data: { timeStamp: ytVideo.currentTime, vidState: currentVidState }, id: -1 });
    }

    changeVidState = true;
});

ytVideo.addEventListener('pause', () => {
    currentVidState = "pause";
    if (changeVidState) {
        chrome.runtime.sendMessage({ type: "pause", data: { timeStamp: ytVideo.currentTime, vidState: currentVidState }, id: -1 });
    }
    changeVidState = true;
});

ytVideo.addEventListener('timeupdate', () => {
    chrome.runtime.sendMessage({ type: "currentTime", data: { timeStamp: ytVideo.currentTime, vidState: currentVidState }, id: -1 });

    if (Math.abs(ytVideo.currentTime - pastTimeStamp) > 3.0 && changeVidState) {
        chrome.runtime.sendMessage({ type: "durationChange", data: { timeStamp: ytVideo.currentTime, vidState: currentVidState }, id: -1 });
    }
    pastTimeStamp = ytVideo.currentTime;
    changeVidState = true;
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.log(request);
    if (request.type == "changeVid") {
        if (request.data.type == "playPause" && request.data.vidState != currentVidState) {
            if (request.data.vidState == "play") {
                changeVidState = false;
                ytVideo.play();
            } else {
                changeVidState = false;
                ytVideo.pause();
            }
        } else {
            changeVidState = false;
            ytVideo.currentTime = request.data.timeStamp;
        }
    }
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
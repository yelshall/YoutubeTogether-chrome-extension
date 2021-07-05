const ytVideo = document.querySelector("video");

var vidState = "play";
var master = false;

ytVideo.addEventListener('play', () => {
    chrome.runtime.sendMessage("play", { timeStamp: ytVideo.currentTime, vidState: vidState });
});

ytVideo.addEventListener('pause', () => {
    sendMessage("pause", { timeStamp: ytVideo.currentTime, vidState: vidState });
});

ytVideo.addEventListener('timeupdate', () => {
    sendMessage("durationChange", { timeStamp: ytVideo.currentTime, vidState: vidState });
});

chrome.runtime.addEventListener(function(request, sender, sendResponse) {
    if (request.type == "changeVid") {
        if (request.data.type == "playPause") {
            if (request.data.vidState != vidState) {
                if (request.data.vidState == "play") {
                    ytVideo.play();
                } else {
                    ytVideo.pause();
                }
            }
        } else {
            if (Math.abs(request.data.timeStamp - ytVideo) > 2.0) {
                ytVideo.currentTime = request.data.timeStamp;
            }
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
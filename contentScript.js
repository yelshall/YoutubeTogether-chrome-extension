const ytVideo = document.querySelector("video");

var vidState = "play";
var master = false;

ytVideo.addEventListener('play', () => {
    vidState = "play";
    sendMessage("play", { timeStamp: ytVideo.currentTime, vidState: vidState });
    console.log(vidState);
});

ytVideo.addEventListener('pause', () => {
    vidState = "pause";
    sendMessage("pause", { timeStamp: ytVideo.currentTime, vidState: vidState });
    console.log(vidState);
});

ytVideo.addEventListener('timeupdate', () => {
    sendMessage("durationChange", { timeStamp: ytVideo.currentTime, vidState: vidState });
    console.log(ytVideo.currentTime);
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.log(request);
    if (request.type == "changeVid") {
        if (request.data.type == "playPause") {
            console.log("playPause")
            if (request.data.vidState != vidState) {
                if (request.data.vidState == "play") {
                    ytVideo.play();
                } else {
                    ytVideo.pause();
                }
            }
        } else {
            console.log("durationchange");
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
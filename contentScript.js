const ytVideo = document.querySelector("video");
var pastTimeStamp = 0;
var changeVidState = true;;

ytVideo.addEventListener('play', () => {
    if (changeVidState) {
        chrome.runtime.sendMessage({ type: "play", data: { timeStamp: ytVideo.currentTime }, id: -1 });
    }
});

ytVideo.addEventListener('pause', () => {
    if (changeVidState) {
        chrome.runtime.sendMessage({ type: "pause", data: { timeStamp: ytVideo.currentTime }, id: -1 });
    }
});

ytVideo.addEventListener('timeupdate', () => {
    if (ytVideo.currentTime < 0.1) {
        chrome.runtime.sendMessage({ type: "durationChange", data: { timeStamp: ytVideo.currentTime }, id: -1 });
    }

    if (Math.abs(ytVideo.currentTime - pastTimeStamp) > 2) {
        chrome.runtime.sendMessage({ type: "durationChange", data: { timeStamp: ytVideo.currentTime }, id: -1 });
    }
    pastTimeStamp = ytVideo.currentTime;
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.log(request);
    if (request.type == "changeVid") {
        if (request.data.type == "playPause") {
            if (request.data.vidState == "play") {
                console.log("Play");
                changeVidState = false;
                ytVideo.play();
                changeVidState = true;
            } else {
                console.log("Pause");
                changeVidState = false;
                ytVideo.pause();
                changeVidState = true;
            }

            if (Math.abs(request.data.timeStamp - ytVideo.currentTime) > 2) {
                pastTimeStamp = request.data.timeStamp;
                ytVideo.currentTime = request.data.timeStamp;
            }
        } else {
            pastTimeStamp = request.data.timeStamp;
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
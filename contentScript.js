const ytVideo = document.querySelector("video");
var pastTimeStamp = 0;
var currentVidState = "play";
var changeVidState = true;

ytVideo.addEventListener('play', () => {
    currentVidState = "play";
    chrome.runtime.sendMessage({ type: "play", data: { timeStamp: ytVideo.currentTime, vidState: currentVidState }, id: -1 });
});

ytVideo.addEventListener('pause', () => {
    currentVidState = "pause";
    chrome.runtime.sendMessage({ type: "pause", data: { timeStamp: ytVideo.currentTime, vidState: currentVidState }, id: -1 });

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
                ytVideo.play();
            } else {
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
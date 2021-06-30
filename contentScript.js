const ytVideo = document.querySelector("video");

ytVideo.addEventListener('play', () => {
    chrome.runtime.sendMessage({ type: "play", data: { timeStamp: ytVideo.currentTime }, id: -1 });
});

ytVideo.addEventListener('pause', () => {
    chrome.runtime.sendMessage({ type: "pause", data: { timeStamp: ytVideo.currentTime }, id: -1 });
});

ytVideo.addEventListener('timeupdate', () => {
    chrome.runtime.sendMessage({ type: "durationChange", data: { timeStamp: ytVideo.currentTime }, id: -1 });
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.log("in content script listener");
    if (request.type == "changeVid") {
        if (request.data.vidState == "pause") {
            ytVideo.pause();
            ytVideo.currentTime = request.data.timeStamp;
        } else {
            ytVideo.play();
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

console.log("in content script");
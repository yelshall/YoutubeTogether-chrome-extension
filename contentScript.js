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

/*var sendMessage = function(type, data, callback) {
    if (callback) {
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            chrome.runtime.sendMessage({ type: type, data: data, id: tabs[0].id, url: tabs[0].url }, function(response) {
                callback(response);
            });
        });
    } else {
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            chrome.runtime.sendMessage({ type: type, data: data, id: tabs[0].id, url: tabs[0].url });
        });
    }
}

//sendMessage("connect", {});

console.log("whyyyy");*/
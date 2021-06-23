var startScript = function() {
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
};

startScript();
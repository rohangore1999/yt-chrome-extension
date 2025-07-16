// Function to extract and save video ID
const saveVideoId = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const videoId = urlParams.get("v");
  console.log("URL changed, new videoId:", videoId);

  if (videoId) {
    chrome.storage.sync.set({ videoId: videoId }, () => {
      console.log("Video ID saved to storage:", videoId);
    });
  }
};


// Initial load
document.addEventListener("DOMContentLoaded", saveVideoId);

// Watch for URL changes
let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    saveVideoId();
  }
}).observe(document, { subtree: true, childList: true });

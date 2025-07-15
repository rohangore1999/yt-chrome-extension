const urlParams = new URLSearchParams(window.location.search);
const videoId = urlParams.get("v");
console.log({ videoId });

chrome.storage.sync.set({ videoId: videoId }, () => {
  console.log("Video ID saved to storage");
  
  
});

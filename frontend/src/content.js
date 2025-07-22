// Function to extract and save video ID
const saveVideoId = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const videoId = urlParams.get("v");

  if (videoId) {
    // Store in both chrome storage and localStorage
    chrome.storage.sync.set({ videoId: videoId }, () => {
      console.log("Video ID saved to chrome storage:", videoId);
    });

    // Also update localStorage for comparison when popup opens
    localStorage.setItem("lastVideoId", videoId);
    console.log("Video ID saved to localStorage:", videoId);
  }
};

// Function to seek to timestamp in YouTube video
const seekToTimestamp = (seconds) => {
  try {
    // Find the YouTube video element
    const video = document.querySelector("video");
    if (video) {
      video.currentTime = seconds;
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error("Error seeking to timestamp:", error);
    return false;
  }
};

// Popup overlay functionality
let popupOverlay = null;

const createPopupOverlay = () => {
  if (popupOverlay) return popupOverlay;

  // Create overlay container
  const overlay = document.createElement("div");
  overlay.id = "youtube-chatbot-overlay";
  overlay.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    width: 420px;
    height: auto;
    max-height: 600px;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
    z-index: 10000;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    display: none;
  `;

  // Create iframe to load the popup content
  const iframe = document.createElement("iframe");
  iframe.style.cssText = `
    width: 100%;
    height: 640px;
    border: none;
    border-radius: 12px;
  `;

  // Get extension URL for the popup
  iframe.src = chrome.runtime.getURL("index.html");

  overlay.appendChild(iframe);
  document.body.appendChild(overlay);

  // Prevent clicks inside overlay from closing it
  overlay.addEventListener("click", (e) => {
    e.stopPropagation();
  });

  return overlay;
};

const togglePopup = async () => {
  if (!popupOverlay) {
    popupOverlay = createPopupOverlay();
  }

  if (popupOverlay.style.display === "none" || !popupOverlay.style.display) {
    // Get current video ID
    const urlParams = new URLSearchParams(window.location.search);
    const currentVideoId = urlParams.get("v");

    if (currentVideoId) {
      // Get stored video ID from localStorage
      const storedVideoId = localStorage.getItem("lastVideoId");

      // Check if video ID has changed
      if (currentVideoId !== storedVideoId) {
        // Store new video ID in localStorage
        localStorage.setItem("lastVideoId", currentVideoId);

        // Also update chrome storage (this will trigger the popup to load transcript)
        chrome.storage.sync.set({ videoId: currentVideoId }, () => {
          // New video ID saved to chrome storage
        });
      } else {
        // Video ID is the same, ensure chrome storage is up to date
        chrome.storage.sync.set({ videoId: currentVideoId }, () => {
          // Video ID confirmed in chrome storage
        });
      }
    }

    popupOverlay.style.display = "block";
    // Focus the iframe for better UX
    const iframe = popupOverlay.querySelector("iframe");
    if (iframe) iframe.focus();
  } else {
    popupOverlay.style.display = "none";
  }
};

const closePopup = () => {
  if (popupOverlay) {
    popupOverlay.style.display = "none";
    // Notify background script
    chrome.runtime.sendMessage({ action: "popupClosed" });
  }
};

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "togglePopup") {
    togglePopup();
    sendResponse({ success: true });
  } else if (request.action === "closePopup") {
    closePopup();
    sendResponse({ success: true });
  } else if (request.action === "seekToTimestamp") {
    const success = seekToTimestamp(request.seconds);
    sendResponse({ success: success });
  }
});

// Dont close popup when clicking outside
document.addEventListener("click", (e) => {
  if (
    popupOverlay &&
    popupOverlay.style.display === "block" &&
    !popupOverlay.contains(e.target)
  ) {
    // Don't auto-close on outside clicks - this was the main issue!
    // Users wanted control over when it closes
    // closePopup();
  }
});

// Close popup on Escape key
document.addEventListener("keydown", (e) => {
  if (
    e.key === "Escape" &&
    popupOverlay &&
    popupOverlay.style.display === "block"
  ) {
    closePopup();
  }
});

// Listen for messages from iframe
window.addEventListener("message", (event) => {
  // Only accept messages from our extension
  if (event.data && event.data.action === "closePopup") {
    closePopup();
  }
});

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

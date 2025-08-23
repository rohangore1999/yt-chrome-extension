// Background script to handle extension icon clicks
// This fires when user clicks the extension icon
const isYouTubeWatchUrl = (urlString) => {
  try {
    const url = new URL(urlString || "");
    return url.hostname.endsWith("youtube.com") && url.pathname === "/watch";
  } catch (_e) {
    return false;
  }
};

chrome.action.onClicked.addListener(async (tab) => {
  try {
    // Only operate on YouTube watch pages
    if (!isYouTubeWatchUrl(tab?.url)) {
      console.warn(
        "Extension action ignored: not a YouTube watch page",
        tab?.url
      );
      return;
    }

    // First, try to send a message to check if content script is already injected
    try {
      await chrome.tabs.sendMessage(tab.id, { action: "ping" });
      console.log("Content script already present, sending toggle message");

      // Content script exists, just toggle the popup
      chrome.tabs.sendMessage(tab.id, { action: "togglePopup" });
    } catch (pingError) {
      // Content script not present, inject it first
      console.log("Content script not found, injecting...");

      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["src/content.js"],
      });

      // Give content script a moment to initialize, then toggle popup
      setTimeout(() => {
        chrome.tabs.sendMessage(tab.id, { action: "togglePopup" });
      }, 100);
    }
  } catch (error) {
    console.error("Error in extension click handler:", error);
  }
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "popupClosed") {
    // Handle popup closed event if needed
  }

  // Send response to keep the message channel open
  sendResponse({ success: true });
});

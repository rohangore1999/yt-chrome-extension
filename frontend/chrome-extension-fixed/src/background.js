// Background script to handle extension icon clicks
// This fires when user clicks the extension icon
chrome.action.onClicked.addListener(async (tab) => {
  try {
    // Inject the content script if not already injected
    await chrome.scripting.executeScript({
      // Specifies WHERE to inject the script
      target: { tabId: tab.id }, // tabId is the ID of the tab where the script will be injected
      files: ["src/content.js"], // Specifies WHAT to inject
    });

    // Send message to toggle the popup overlay
    chrome.tabs.sendMessage(tab.id, { action: "togglePopup" });
  } catch (error) {
    console.error("Error injecting content script:", error);
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

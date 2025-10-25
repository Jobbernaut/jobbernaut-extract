// Simple background script to forward icon clicks to content script
if (chrome.action && chrome.action.onClicked) {
  chrome.action.onClicked.addListener(async (tab) => {
    try {
      // Check if we're on a LinkedIn jobs page
      if (!tab.url || !tab.url.includes("linkedin.com/jobs")) {
        chrome.notifications.create({
          type: "basic",
          iconUrl: "icons/icon48.png",
          title: "Jobbernaut Extract",
          message: "Please navigate to a LinkedIn job posting",
        });
        return;
      }

      // Send message to content script to extract job data
      chrome.tabs.sendMessage(tab.id, { action: "extractJob" });
    } catch (error) {
      console.error("Error:", error);
    }
  });
}

// Create context menu for settings
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "openSettings",
    title: "Settings",
    contexts: ["action"],
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "openSettings") {
    chrome.runtime.openOptionsPage();
  }
});

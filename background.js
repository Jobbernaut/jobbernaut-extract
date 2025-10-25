// Simple background script to forward icon clicks to content script
if (chrome.action && chrome.action.onClicked) {
  chrome.action.onClicked.addListener(async (tab) => {
    try {
      // Check if we're on a supported job site
      if (!tab.url) {
        chrome.notifications.create({
          type: "basic",
          iconUrl: "icons/icon48.png",
          title: "Jobbernaut Extract",
          message: "Please navigate to a LinkedIn or Indeed job posting",
        });
        return;
      }

      // Check for LinkedIn jobs page
      if (tab.url.includes("linkedin.com/jobs")) {
        chrome.tabs.sendMessage(tab.id, { action: "extractJob" });
        return;
      }

      // Check for Indeed job page
      if (tab.url.includes("indeed.com")) {
        chrome.tabs.sendMessage(tab.id, { action: "extractJob" });
        return;
      }

      // Not on a supported job site
      chrome.notifications.create({
        type: "basic",
        iconUrl: "icons/icon48.png",
        title: "Jobbernaut Extract",
        message: "Please navigate to a LinkedIn or Indeed job posting",
      });
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

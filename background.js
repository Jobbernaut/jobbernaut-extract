/**
 * Jobbernaut Extract - Background Service Worker
 * Handles clipboard operations and message passing between content scripts and extension
 */

(function () {
  "use strict";

  console.log("[Jobbernaut] Background service worker initialized");

  /**
   * Handles keyboard command for job extraction
   */
  chrome.commands.onCommand.addListener((command) => {
    if (command === "extract-job") {
      // Send message to the active tab's content script
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
          chrome.tabs.sendMessage(tabs[0].id, { action: "extractJob" });
        }
      });
    }
  });

  /**
   * Handles messages from content scripts
   * @param {Object} request - Message request object
   * @param {Object} sender - Message sender information
   * @param {Function} sendResponse - Callback to send response
   * @returns {boolean} True if response will be sent asynchronously
   */
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "copyToClipboard") {
      handleCopyToClipboard(request.text)
        .then(() => {
          sendResponse({ success: true });
        })
        .catch((error) => {
          console.error("[Jobbernaut] Clipboard copy failed:", error);
          sendResponse({ success: false, error: error.message });
        });
      return true; // Indicates async response
    }
  });

  /**
   * Copies text to clipboard using the Clipboard API
   * @param {string} text - Text to copy to clipboard
   * @returns {Promise<void>}
   */
  async function handleCopyToClipboard(text) {
    if (!text || typeof text !== "string") {
      throw new Error("Invalid text provided for clipboard operation");
    }

    try {
      // Use the modern Clipboard API
      await navigator.clipboard.writeText(text);
      console.log("[Jobbernaut] Successfully copied to clipboard");
    } catch (error) {
      console.error("[Jobbernaut] Clipboard API failed:", error);
      throw new Error(`Failed to copy to clipboard: ${error.message}`);
    }
  }
})();

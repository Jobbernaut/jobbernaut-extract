/**
 * Jobbernaut Extract - Shared Utilities
 * Common functions used by all job board scrapers
 *
 * This module provides reusable utilities for:
 * - Job ID generation
 * - YAML formatting and escaping
 * - Template processing
 * - User notifications
 * - Event handling
 */

(function () {
  "use strict";

  // Constants
  const JOB_ID_LENGTH = 10;
  const JOB_ID_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const DEFAULT_STATUS = "pending";
  const NOTIFICATION_DURATION = 3000;
  const NOTIFICATION_FADE_DURATION = 300;

  /**
   * Generates a unique job ID
   * @returns {string} A 10-character alphanumeric ID (e.g., "K7M9N2P4Q1")
   * @example
   * const id = generateJobId(); // "ABC123XYZ0"
   */
  function generateJobId() {
    let id = "";
    for (let i = 0; i < JOB_ID_LENGTH; i++) {
      id += JOB_ID_CHARS.charAt(
        Math.floor(Math.random() * JOB_ID_CHARS.length)
      );
    }
    return id;
  }

  /**
   * Formats job description with YAML pipe syntax and proper indentation
   * @param {string} description - The job description text
   * @returns {string} Formatted description with pipe syntax or empty string
   * @example
   * formatJobDescription("Line 1\nLine 2")
   * // Returns: "|\n    Line 1\n    Line 2"
   */
  function formatJobDescription(description) {
    if (!description) return '""';

    // Split into lines and indent each line with 4 spaces
    const lines = description.split("\n");
    const indentedLines = lines.map((line) => "    " + line);
    return "|\n" + indentedLines.join("\n");
  }

  /**
   * Escapes special YAML characters in a string
   * @param {string} str - The string to escape
   * @returns {string} Escaped string safe for YAML or empty string
   * @example
   * escapeYAML("Company: Inc.") // Returns: '"Company: Inc."'
   */
  function escapeYAML(str) {
    if (!str) return '""';

    // Check if string needs to be quoted
    const needsQuotes = /[:\{\}\[\],&*#?|\-<>=!%@`]|^\s|^\d/.test(str);

    if (needsQuotes && !str.includes("\n")) {
      return '"' + str.replace(/"/g, '\\"') + '"';
    }
    return str;
  }

  /**
   * Returns the default YAML template
   * @returns {string} Default template string with placeholders
   */
  function getDefaultTemplate() {
    return `- job_id: {job_id}
  job_title: {job_title}
  company_name: {company_name}
  location: {location}
  status: {status}
  posting_link: {posting_link}
  job_description: {job_description}`;
  }

  /**
   * Formats job data using a template
   * @param {Object} data - Job data object with template variables
   * @param {string} template - Template string with {variable} placeholders
   * @returns {string} Formatted output with variables replaced
   */
  function formatData(data, template) {
    // Replace template variables
    let output = template
      .replace(/{job_id}/g, data.job_id)
      .replace(/{job_title}/g, data.job_title)
      .replace(/{company_name}/g, data.company_name)
      .replace(/{location}/g, data.location)
      .replace(/{status}/g, data.status)
      .replace(/{posting_link}/g, data.posting_link)
      .replace(/{job_description}/g, data.job_description);

    return output;
  }

  /**
   * Validates extracted job data
   * @param {Object} data - Job data to validate
   * @returns {Object} Validation result with success flag and error message
   */
  function validateJobData(data) {
    if (!data) {
      return { valid: false, error: "No data provided" };
    }

    if (!data.jobTitle || data.jobTitle.trim() === "") {
      return { valid: false, error: "Job title is required" };
    }

    if (!data.companyName || data.companyName.trim() === "") {
      return { valid: false, error: "Company name is required" };
    }

    return { valid: true };
  }

  /**
   * Cleans and normalizes text by removing extra whitespace
   * @param {string} text - Text to clean
   * @returns {string} Cleaned text
   */
  function cleanText(text) {
    if (!text) return "";
    return text
      .replace(/\s+/g, " ") // Normalize whitespace
      .replace(/\n\s*\n/g, "\n\n") // Clean up multiple newlines
      .trim();
  }

  /**
   * Shows a notification on the page
   * @param {string} message - Message to display
   * @param {string} color - Background color (default: LinkedIn blue)
   */
  function showNotification(message, color = "#0a66c2") {
    // Remove any existing notification
    const existing = document.getElementById("jobbernaut-notification");
    if (existing) {
      existing.remove();
    }

    // Create notification element
    const notification = document.createElement("div");
    notification.id = "jobbernaut-notification";
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${color};
      color: white;
      padding: 16px 24px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 10000;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 14px;
      font-weight: 500;
      animation: slideIn 0.3s ease-out;
    `;

    // Add animation
    const style = document.createElement("style");
    style.textContent = `
      @keyframes slideIn {
        from {
          transform: translateX(400px);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
    `;
    document.head.appendChild(style);

    document.body.appendChild(notification);

    // Remove after configured duration
    setTimeout(() => {
      notification.style.animation = `slideIn ${NOTIFICATION_FADE_DURATION}ms ease-out reverse`;
      setTimeout(() => notification.remove(), NOTIFICATION_FADE_DURATION);
    }, NOTIFICATION_DURATION);
  }

  /**
   * Generic extraction function that works with any scraper
   * @param {Function} scraperFunction - Site-specific scraper function
   * @param {string} siteName - Name of the job site (for logging)
   */
  async function extractAndCopyJobData(scraperFunction, siteName = "job") {
    try {
      console.log(`[Jobbernaut] Extracting ${siteName} data...`);

      // Scrape the job data using the provided scraper function
      const result = scraperFunction();

      if (!result.success) {
        console.error(`[Jobbernaut] Scraping failed:`, result.error);
        alert(
          `Failed to extract job data: ${result.error}\n\nPlease ensure you're on a valid ${siteName} job posting page.`
        );
        return;
      }

      // Validate extracted data
      const validation = validateJobData(result.data);
      if (!validation.valid) {
        console.error(`[Jobbernaut] Validation failed:`, validation.error);
        alert(
          `Failed to extract job data: ${validation.error}\n\nThe page may not contain complete job information.`
        );
        return;
      }

      console.log(`[Jobbernaut] Job data scraped:`, result.data);

      // Get user's custom template or use default
      const storageResult = await chrome.storage.sync.get(["customTemplate"]);
      const template = storageResult.customTemplate || getDefaultTemplate();

      // Prepare data with proper formatting and cleaning
      const jobData = {
        job_id: escapeYAML(generateJobId()),
        job_title: escapeYAML(cleanText(result.data.jobTitle) || ""),
        company_name: escapeYAML(cleanText(result.data.companyName) || ""),
        location: escapeYAML(cleanText(result.data.location) || ""),
        status: DEFAULT_STATUS,
        posting_link: escapeYAML(
          result.data.postingLink || window.location.href
        ),
        job_description: formatJobDescription(
          cleanText(result.data.jobDescription) || ""
        ),
      };

      // Format using template
      const formattedOutput = formatData(jobData, template);

      // Copy to clipboard
      await navigator.clipboard.writeText(formattedOutput);

      console.log(`[Jobbernaut] Copied to clipboard!`);

      // Show success message
      showNotification("✓ Copied to clipboard!");
    } catch (error) {
      console.error(`[Jobbernaut] Error extracting job data:`, error);
      alert(
        `Failed to extract job data: ${error.message}\n\nPlease try again or report this issue if it persists.`
      );
    }
  }

  /**
   * Sets up common event listeners for a scraper
   * @param {Function} scraperFunction - Site-specific scraper function
   * @param {string} siteName - Name of the job site
   */
  function setupEventListeners(scraperFunction, siteName) {
    // Listen for keyboard shortcut (Ctrl+Shift+E or Cmd+Shift+E)
    document.addEventListener("keydown", (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "E") {
        e.preventDefault();
        extractAndCopyJobData(scraperFunction, siteName);
      }
    });

    console.log(
      `[Jobbernaut] ${siteName} scraper loaded - Press Ctrl+Shift+E to extract job data`
    );
  }

  // Export utilities to global scope for use by scrapers
  window.JobbernautUtils = {
    generateJobId,
    formatJobDescription,
    escapeYAML,
    getDefaultTemplate,
    formatData,
    showNotification,
    extractAndCopyJobData,
    setupEventListeners,
    validateJobData,
    cleanText,
  };
})();

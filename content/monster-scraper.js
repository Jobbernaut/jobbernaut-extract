/**
 * Jobbernaut Extract - Monster Scraper
 * Extracts job data from Monster job postings
 *
 * Supports Monster's job board at monster.com
 */

(function () {
  "use strict";

  console.log("[Jobbernaut] Monster scraper initializing...");

  // Check if shared utilities are available
  if (!window.JobbernautUtils) {
    console.error(
      "[Jobbernaut] JobbernautUtils not loaded! Make sure shared-utils.js is loaded first."
    );
    return;
  }

  const { setupEventListeners } = window.JobbernautUtils;

  /**
   * Scrapes job data from Monster job posting page
   * @returns {Object} Result object with success flag and data/error
   */
  function scrapeMonsterJob() {
    try {
      let jobTitle = "";
      let companyName = "";
      let location = "";
      let jobDescription = "";
      const postingLink = window.location.href;

      // Job Title - Try multiple selectors for different Monster layouts
      jobTitle =
        document.querySelector("h1")?.textContent?.trim() ||
        document
          .querySelector('[data-test-id="svx-job-title"]')
          ?.textContent?.trim() ||
        document.querySelector('[class*="JobTitle"]')?.textContent?.trim() ||
        document.querySelector('[class*="job-title"]')?.textContent?.trim() ||
        "";

      // Company Name - Try multiple selectors
      companyName =
        document
          .querySelector('[data-test-id="svx-company-name"]')
          ?.textContent?.trim() ||
        document.querySelector('[class*="company"]')?.textContent?.trim() ||
        document.querySelector('[class*="CompanyName"]')?.textContent?.trim() ||
        "";

      // Location - Try multiple selectors
      location =
        document
          .querySelector('[data-test-id="svx-job-location"]')
          ?.textContent?.trim() ||
        document.querySelector('[class*="location"]')?.textContent?.trim() ||
        document.querySelector('[class*="Location"]')?.textContent?.trim() ||
        "";

      // Job Description - Try multiple selectors
      const descriptionElement =
        document.querySelector('[data-test-id="svx-job-description"]') ||
        document.querySelector('[class*="JobDescription"]') ||
        document.querySelector('[class*="job-description"]') ||
        document.querySelector('[class*="description"]') ||
        document.querySelector("main") ||
        document.querySelector("article");

      if (descriptionElement) {
        jobDescription = descriptionElement.innerText?.trim() || "";
      }

      return {
        success: true,
        data: {
          jobTitle,
          companyName,
          location,
          jobDescription,
          postingLink,
        },
      };
    } catch (error) {
      console.error("[Jobbernaut] Monster scraping error:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Initialize the scraper with shared utilities
  setupEventListeners(scrapeMonsterJob, "Monster");
})();

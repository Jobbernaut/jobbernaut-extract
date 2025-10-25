/**
 * Jobbernaut Extract - YCombinator Scraper
 * Extracts job data from YCombinator (Work at a Startup) job postings
 *
 * Supports YCombinator's job board at workatastartup.com
 */

(function () {
  "use strict";

  console.log("[Jobbernaut] YCombinator scraper initializing...");

  // Check if shared utilities are available
  if (!window.JobbernautUtils) {
    console.error(
      "[Jobbernaut] JobbernautUtils not loaded! Make sure shared-utils.js is loaded first."
    );
    return;
  }

  const { setupEventListeners } = window.JobbernautUtils;

  /**
   * Scrapes job data from YCombinator job posting page
   * @returns {Object} Result object with success flag and data/error
   */
  function scrapeYCombinatorJob() {
    try {
      let jobTitle = "";
      let companyName = "";
      let location = "";
      let jobDescription = "";
      const postingLink = window.location.href;

      // Job Title - Try multiple selectors
      jobTitle =
        document.querySelector("h1")?.textContent?.trim() ||
        document.querySelector('[class*="title"]')?.textContent?.trim() ||
        document.querySelector('[class*="job-title"]')?.textContent?.trim() ||
        "";

      // Company Name - Try multiple selectors
      companyName =
        document.querySelector('a[href*="/companies/"]')?.textContent?.trim() ||
        document.querySelector('[class*="company"]')?.textContent?.trim() ||
        document
          .querySelector('[class*="company-name"]')
          ?.textContent?.trim() ||
        "";

      // Location - Try multiple selectors
      location =
        document.querySelector('[class*="location"]')?.textContent?.trim() ||
        document
          .querySelector('[class*="job-location"]')
          ?.textContent?.trim() ||
        "";

      // Job Description - Try multiple selectors
      const descriptionElement =
        document.querySelector('[class*="description"]') ||
        document.querySelector('[class*="job-description"]') ||
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
      console.error("[Jobbernaut] YCombinator scraping error:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Initialize the scraper with shared utilities
  setupEventListeners(scrapeYCombinatorJob, "YCombinator");
})();

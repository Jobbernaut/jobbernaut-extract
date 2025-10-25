/**
 * Jobbernaut Extract - Glassdoor Scraper
 * Extracts job data from Glassdoor job postings
 *
 * Supports Glassdoor's job board at glassdoor.com
 */

(function () {
  "use strict";

  console.log("[Jobbernaut] Glassdoor scraper initializing...");

  // Check if shared utilities are available
  if (!window.JobbernautUtils) {
    console.error(
      "[Jobbernaut] JobbernautUtils not loaded! Make sure shared-utils.js is loaded first."
    );
    return;
  }

  const { setupEventListeners } = window.JobbernautUtils;

  /**
   * Scrapes job data from Glassdoor job posting page
   * @returns {Object} Result object with success flag and data/error
   */
  function scrapeGlassdoorJob() {
    try {
      let jobTitle = "";
      let companyName = "";
      let location = "";
      let jobDescription = "";
      const postingLink = window.location.href;

      // Job Title - Try multiple selectors for different Glassdoor layouts
      jobTitle =
        document
          .querySelector('[data-test="job-title"]')
          ?.textContent?.trim() ||
        document.querySelector("h1")?.textContent?.trim() ||
        document.querySelector('[class*="JobTitle"]')?.textContent?.trim() ||
        document.querySelector('[class*="job-title"]')?.textContent?.trim() ||
        "";

      // Company Name - Try multiple selectors
      companyName =
        document
          .querySelector('[data-test="employer-name"]')
          ?.textContent?.trim() ||
        document
          .querySelector('[class*="EmployerProfile"]')
          ?.textContent?.trim() ||
        document.querySelector('[class*="employer"]')?.textContent?.trim() ||
        document.querySelector('[class*="company"]')?.textContent?.trim() ||
        "";

      // Location - Try multiple selectors
      location =
        document.querySelector('[data-test="location"]')?.textContent?.trim() ||
        document.querySelector('[class*="Location"]')?.textContent?.trim() ||
        document.querySelector('[class*="location"]')?.textContent?.trim() ||
        "";

      // Job Description - Try multiple selectors
      const descriptionElement =
        document.querySelector('[data-test="job-description"]') ||
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
      console.error("[Jobbernaut] Glassdoor scraping error:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Initialize the scraper with shared utilities
  setupEventListeners(scrapeGlassdoorJob, "Glassdoor");
})();

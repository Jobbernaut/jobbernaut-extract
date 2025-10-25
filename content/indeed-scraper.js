/**
 * Jobbernaut Extract - Indeed Scraper
 * Extracts job data from Indeed job postings
 *
 * Supports both:
 * - Individual job posting pages
 * - Job search results pages with detail panel
 */

(function () {
  "use strict";

  console.log("[Jobbernaut] Indeed scraper initializing...");

  // Check if shared utilities are available
  if (!window.JobbernautUtils) {
    console.error(
      "[Jobbernaut] JobbernautUtils not loaded! Make sure shared-utils.js is loaded first."
    );
    return;
  }

  const { setupEventListeners } = window.JobbernautUtils;

  /**
   * Scrapes job data from Indeed job posting page
   * @returns {Object} Result object with success flag and data/error
   */
  function scrapeIndeedJob() {
    try {
      let jobTitle = "";
      let companyName = "";
      let location = "";
      let jobDescription = "";
      const postingLink = window.location.href;

      // Job Title - Try multiple selectors for different Indeed layouts
      jobTitle =
        document.querySelector('h1[class*="jobTitle"]')?.textContent?.trim() ||
        document
          .querySelector('[data-testid="jobsearch-JobInfoHeader-title"]')
          ?.textContent?.trim() ||
        document
          .querySelector(".jobsearch-JobInfoHeader-title")
          ?.textContent?.trim() ||
        document.querySelector("h1.icl-u-xs-mb--xs")?.textContent?.trim() ||
        "";

      // Company Name - Try multiple selectors
      companyName =
        document
          .querySelector('[data-testid="inlineHeader-companyName"]')
          ?.textContent?.trim() ||
        document
          .querySelector('[data-company-name="true"]')
          ?.textContent?.trim() ||
        document.querySelector('[class*="companyName"]')?.textContent?.trim() ||
        document.querySelector(".icl-u-lg-mr--sm")?.textContent?.trim() ||
        "";

      // Location - Try multiple selectors
      location =
        document
          .querySelector('[data-testid="inlineHeader-companyLocation"]')
          ?.textContent?.trim() ||
        document
          .querySelector('[data-testid="job-location"]')
          ?.textContent?.trim() ||
        document
          .querySelector('[class*="companyLocation"]')
          ?.textContent?.trim() ||
        document
          .querySelector(".icl-u-xs-mt--xs.icl-u-textColor--secondary")
          ?.textContent?.trim() ||
        "";

      // Job Description - Try multiple selectors
      const descriptionElement =
        document.querySelector("#jobDescriptionText") ||
        document.querySelector('[id*="jobDescriptionText"]') ||
        document.querySelector(".jobsearch-jobDescriptionText") ||
        document.querySelector('[class*="jobDescriptionText"]') ||
        document.querySelector(".jobsearch-JobComponent-description");

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
      console.error("[Jobbernaut] Indeed scraping error:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Initialize the scraper with shared utilities
  setupEventListeners(scrapeIndeedJob, "Indeed");
})();

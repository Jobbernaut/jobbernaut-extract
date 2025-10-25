// Jobbernaut Extract - Wellfound Scraper
// Extracts job data from Wellfound job postings

(function () {
  "use strict";

  console.log("Wellfound scraper initializing...");

  // Check if shared utilities are available
  if (!window.JobbernautUtils) {
    console.error(
      "JobbernautUtils not loaded! Make sure shared-utils.js is loaded first."
    );
    return;
  }

  const { setupEventListeners } = window.JobbernautUtils;

  // Wellfound-specific scraping function
  function scrapeWellfoundJob() {
    try {
      // Extract job title
      let jobTitle = "";
      const titleElement = document.querySelector(
        "h1.styles-module_component__3ZI84"
      );
      if (titleElement) {
        jobTitle = titleElement.textContent.trim();
      }

      // Extract company name
      let companyName = "";
      const companyElement = document.querySelector(
        "span.inline.text-md.font-semibold"
      );
      if (companyElement) {
        companyName = companyElement.textContent.trim();
      }

      // Extract location from Company Location field
      let location = "";
      const dtElements = document.querySelectorAll("dt");
      for (const dt of dtElements) {
        if (dt.textContent.trim() === "Company Location") {
          const dd = dt.nextElementSibling;
          if (dd && dd.tagName === "DD") {
            location = dd.textContent.trim();
            break;
          }
        }
      }

      // Extract job description
      let jobDescription = "";
      const descElement = document.querySelector(
        'div[class*="styles_description"]'
      );
      if (descElement) {
        jobDescription = descElement.textContent.trim();
      }

      // Validate required fields
      if (!jobTitle) {
        return {
          success: false,
          error: "Could not find job title on page",
        };
      }

      if (!companyName) {
        return {
          success: false,
          error: "Could not find company name on page",
        };
      }

      return {
        success: true,
        data: {
          jobTitle: jobTitle,
          companyName: companyName,
          location: location || "Location not specified",
          jobDescription: jobDescription,
          postingLink: window.location.href,
        },
      };
    } catch (error) {
      console.error("Error scraping Wellfound job:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Setup event listeners using shared utilities
  setupEventListeners(scrapeWellfoundJob, "Wellfound");
})();

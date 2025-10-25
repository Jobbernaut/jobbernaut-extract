/**
 * Jobbernaut Extract - LinkedIn Scraper
 * Extracts job data from LinkedIn job postings
 *
 * Supports both:
 * - Individual job posting pages (/jobs/view/*)
 * - Job search results pages (/jobs/search*)
 */

(function () {
  "use strict";

  console.log("[Jobbernaut] LinkedIn scraper initializing...");

  // Check if shared utilities are available
  if (!window.JobbernautUtils) {
    console.error(
      "[Jobbernaut] JobbernautUtils not loaded! Make sure shared-utils.js is loaded first."
    );
    return;
  }

  const { setupEventListeners } = window.JobbernautUtils;

  /**
   * Extracts external apply link if available (not Easy Apply)
   * @returns {string|null} External apply URL or null if not found
   */
  function extractApplyLink() {
    // Try to find external apply button/link (not Easy Apply)
    const applySelectors = [
      'a.jobs-apply-button[href]:not([href*="easy-apply"])',
      'a[data-tracking-control-name="public_jobs_apply-link"][href]:not([href*="easy-apply"])',
      '.jobs-apply-button a[href]:not([href*="easy-apply"])',
      'a[href*="/apply"]:not([href*="easy-apply"])',
      '.apply-button[href]:not([href*="easy-apply"])',
    ];

    for (const selector of applySelectors) {
      const applyLink = document.querySelector(selector);
      if (applyLink && applyLink.href) {
        // Validate it's an external link (not LinkedIn internal)
        const url = applyLink.href;
        if (
          url.startsWith("http") &&
          !url.includes("/easy-apply/") &&
          !url.includes("linkedin.com/login")
        ) {
          console.log("[Jobbernaut] Found external apply link:", url);
          return url;
        }
      }
    }

    return null;
  }

  /**
   * Scrapes job data from LinkedIn job posting page
   * @returns {Object} Result object with success flag and data/error
   */
  function scrapeLinkedInJob() {
    try {
      // Check if we're on a search results page or individual job page
      const isSearchResultsPage = window.location.href.includes("/jobs/search");

      let jobTitle = "";
      let companyName = "";
      let location = "";
      let jobDescription = "";
      let postingLink = "";

      if (isSearchResultsPage) {
        // Search results page - extract from the right-side detail panel

        // Get job title from detail panel
        jobTitle =
          document
            .querySelector(".job-details-jobs-unified-top-card__job-title h1")
            ?.textContent?.trim() ||
          document
            .querySelector(".jobs-unified-top-card__job-title")
            ?.textContent?.trim() ||
          document
            .querySelector(".job-details-jobs-unified-top-card__job-title")
            ?.textContent?.trim() ||
          "";

        // Get company name from detail panel
        companyName =
          document
            .querySelector(".job-details-jobs-unified-top-card__company-name a")
            ?.textContent?.trim() ||
          document
            .querySelector(".jobs-unified-top-card__company-name a")
            ?.textContent?.trim() ||
          document
            .querySelector(".job-details-jobs-unified-top-card__company-name")
            ?.textContent?.trim() ||
          "";

        // Get location from detail panel
        location =
          document
            .querySelector(
              ".job-details-jobs-unified-top-card__primary-description-container .tvm__text"
            )
            ?.textContent?.trim() ||
          document
            .querySelector(".jobs-unified-top-card__bullet")
            ?.textContent?.trim() ||
          document
            .querySelector(".job-details-jobs-unified-top-card__bullet")
            ?.textContent?.trim() ||
          "";

        // Get job description from detail panel
        const descriptionElement =
          document.querySelector(".jobs-description-content__text") ||
          document.querySelector(".jobs-description__content") ||
          document.querySelector(".show-more-less-html__markup") ||
          document.querySelector("#job-details");

        if (descriptionElement) {
          jobDescription = descriptionElement.innerText?.trim() || "";
        }

        // Get posting link - extract job ID from the selected job card
        const selectedJobCard =
          document.querySelector(".jobs-search-results__list-item--active") ||
          document.querySelector(
            '.job-card-container--clickable[aria-current="true"]'
          );

        if (selectedJobCard) {
          const jobId =
            selectedJobCard.getAttribute("data-job-id") ||
            selectedJobCard
              .querySelector("[data-job-id]")
              ?.getAttribute("data-job-id");
          if (jobId) {
            postingLink = `https://www.linkedin.com/jobs/view/${jobId}`;
          }
        }

        // Fallback: try to get from the "View job" link or current URL
        if (!postingLink) {
          const viewJobLink = document.querySelector('a[href*="/jobs/view/"]');
          if (viewJobLink) {
            postingLink = viewJobLink.href;
          } else {
            postingLink = window.location.href;
          }
        }
      } else {
        // Individual job page - use original selectors

        jobTitle =
          document
            .querySelector(".top-card-layout__title")
            ?.textContent?.trim() ||
          document.querySelector("h1.t-24")?.textContent?.trim() ||
          document
            .querySelector(
              '[class*="job-details-jobs-unified-top-card__job-title"]'
            )
            ?.textContent?.trim() ||
          "";

        companyName =
          document
            .querySelector(".topcard__org-name-link")
            ?.textContent?.trim() ||
          document
            .querySelector(
              '.top-card-layout__card a[data-tracking-control-name*="company"]'
            )
            ?.textContent?.trim() ||
          document
            .querySelector(
              '[class*="job-details-jobs-unified-top-card__company-name"]'
            )
            ?.textContent?.trim() ||
          "";

        location =
          document
            .querySelector(".topcard__flavor--bullet")
            ?.textContent?.trim() ||
          document
            .querySelector(
              ".top-card-layout__card .topcard__flavor-row span:first-child"
            )
            ?.textContent?.trim() ||
          document
            .querySelector(
              '[class*="job-details-jobs-unified-top-card__bullet"]'
            )
            ?.textContent?.trim() ||
          "";

        const descriptionElement =
          document.querySelector(".show-more-less-html__markup") ||
          document.querySelector(".description__text") ||
          document.querySelector(
            '[class*="job-details-jobs-unified-top-card__job-description"]'
          ) ||
          document.querySelector(".jobs-description__content");

        if (descriptionElement) {
          jobDescription = descriptionElement.innerText?.trim() || "";
        }

        postingLink = window.location.href;
      }

      // Try to get external apply link, fallback to posting link
      const applyLink = extractApplyLink();
      const finalLink = applyLink || postingLink || window.location.href;

      return {
        success: true,
        data: {
          jobTitle,
          companyName,
          location,
          jobDescription,
          postingLink: finalLink,
        },
      };
    } catch (error) {
      console.error("[Jobbernaut] LinkedIn scraping error:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Initialize the scraper with shared utilities
  setupEventListeners(scrapeLinkedInJob, "LinkedIn");
})();

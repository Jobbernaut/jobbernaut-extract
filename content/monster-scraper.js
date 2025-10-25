// Monster-specific job scraper
// Uses shared utilities from shared-utils.js

// Monster job scraper
function scrapeMonsterJob() {
  try {
    let jobTitle = "";
    let companyName = "";
    let location = "";
    let jobDescription = "";

    // Find the job view wrapper to scope our selectors to the detail panel only
    // This prevents selecting elements from the search results list
    const jobViewWrapper = document.querySelector(
      '[data-testid="svx-job-view-wrapper"]'
    );

    if (!jobViewWrapper) {
      console.error("Job view wrapper not found");
      return {
        success: false,
        error:
          "Job detail panel not found. Please make sure a job is selected.",
      };
    }

    // Job Title - Search within the wrapper only
    jobTitle =
      jobViewWrapper
        .querySelector('[data-testid="jobTitle"]')
        ?.textContent?.trim() ||
      jobViewWrapper.querySelector("h1")?.textContent?.trim() ||
      "";

    // Company Name - Search within the wrapper only
    companyName =
      jobViewWrapper
        .querySelector('[data-testid="company"]')
        ?.textContent?.trim() ||
      jobViewWrapper
        .querySelector('[data-testid="companyName"]')
        ?.textContent?.trim() ||
      "";

    // Location - Search within the wrapper only
    location =
      jobViewWrapper
        .querySelector('[data-testid="jobDetailLocation"]')
        ?.textContent?.trim() ||
      jobViewWrapper
        .querySelector('[data-testid="location"]')
        ?.textContent?.trim() ||
      "";

    // Job Description - Search within the wrapper only
    const descriptionElement =
      jobViewWrapper.querySelector(
        '[data-testid="svx-description-container-inner"]'
      ) ||
      jobViewWrapper.querySelector('[data-testid="jobDescription"]') ||
      jobViewWrapper.querySelector('[class*="description"]');

    if (descriptionElement) {
      jobDescription = descriptionElement.innerText?.trim() || "";
    }

    // Use current URL as posting link
    const postingLink = window.location.href;

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
    console.error("Scraping error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

// Initialize the scraper with shared utilities
if (window.JobbernautUtils) {
  window.JobbernautUtils.setupEventListeners(scrapeMonsterJob, "Monster");
} else {
  console.error(
    "JobbernautUtils not loaded! Make sure shared-utils.js is loaded first."
  );
}

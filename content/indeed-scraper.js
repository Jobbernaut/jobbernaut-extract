// Indeed-specific job scraper
// Uses shared utilities from shared-utils.js

// Indeed job scraper
function scrapeIndeedJob() {
  try {
    let jobTitle = "";
    let companyName = "";
    let location = "";
    let jobDescription = "";

    // Job Title - Indeed uses h1 or specific class for job title
    jobTitle =
      document
        .querySelector(".jobsearch-JobInfoHeader-title")
        ?.textContent?.trim() ||
      document.querySelector('h1[class*="jobTitle"]')?.textContent?.trim() ||
      document.querySelector("h1.icl-u-xs-mb--xs")?.textContent?.trim() ||
      document
        .querySelector("h2.jobsearch-JobInfoHeader-title")
        ?.textContent?.trim() ||
      "";

    // Company Name - Look for company name in various locations
    companyName =
      document
        .querySelector('[data-company-name="true"]')
        ?.textContent?.trim() ||
      document
        .querySelector('div[data-testid="inlineHeader-companyName"]')
        ?.textContent?.trim() ||
      document
        .querySelector(".jobsearch-InlineCompanyRating-companyHeader a")
        ?.textContent?.trim() ||
      document
        .querySelector(".jobsearch-CompanyInfoContainer a")
        ?.textContent?.trim() ||
      document.querySelector('[class*="companyName"]')?.textContent?.trim() ||
      "";

    // Location - Indeed shows location near company info
    location =
      document
        .querySelector('[data-testid="job-location"]')
        ?.textContent?.trim() ||
      document
        .querySelector(".jobsearch-JobInfoHeader-subtitle div")
        ?.textContent?.trim() ||
      document
        .querySelector('[class*="companyLocation"]')
        ?.textContent?.trim() ||
      document
        .querySelector(".jobsearch-InlineCompanyRating + div")
        ?.textContent?.trim() ||
      "";

    // Job Description - Indeed has the full description in a specific div
    const descriptionElement =
      document.querySelector("#jobDescriptionText") ||
      document.querySelector('[id*="jobDescriptionText"]') ||
      document.querySelector(".jobsearch-jobDescriptionText") ||
      document.querySelector('[class*="jobDescription"]') ||
      document.querySelector(".jobsearch-JobComponent-description");

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
  window.JobbernautUtils.setupEventListeners(scrapeIndeedJob, "Indeed");
} else {
  console.error(
    "JobbernautUtils not loaded! Make sure shared-utils.js is loaded first."
  );
}

// Glassdoor-specific job scraper
// Uses shared utilities from shared-utils.js

// Extract job details from Glassdoor
function scrapeGlassdoorJob() {
  try {
    // Check if we're on a search results page or individual job page
    const isSearchResultsPage = window.location.href.includes("/Job/");
    const isJobListingPage = window.location.href.includes("/job-listing/");

    let jobTitle = "";
    let companyName = "";
    let location = "";
    let jobDescription = "";
    let postingLink = "";

    if (isSearchResultsPage && !isJobListingPage) {
      // Search results page - extract from the job detail panel on the right

      // Job title from detail panel
      jobTitle =
        document
          .querySelector('[data-test="job-title"]')
          ?.textContent?.trim() ||
        document
          .querySelector(".JobDetails_jobTitle__Rw_gn")
          ?.textContent?.trim() ||
        document.querySelector('h1[class*="jobTitle"]')?.textContent?.trim() ||
        document.querySelector(".e1tk4kwz4")?.textContent?.trim() ||
        "";

      // Company name from detail panel
      companyName =
        document
          .querySelector('[data-test="employer-name"]')
          ?.textContent?.trim() ||
        document
          .querySelector(".JobDetails_employerName__mMFcC")
          ?.textContent?.trim() ||
        document
          .querySelector('[class*="employerName"]')
          ?.textContent?.trim() ||
        document.querySelector(".e1tk4kwz5")?.textContent?.trim() ||
        "";

      // Location from detail panel
      location =
        document.querySelector('[data-test="location"]')?.textContent?.trim() ||
        document
          .querySelector(".JobDetails_location__mSg5h")
          ?.textContent?.trim() ||
        document.querySelector('[class*="location"]')?.textContent?.trim() ||
        document.querySelector(".e1tk4kwz6")?.textContent?.trim() ||
        "";

      // Job description from detail panel
      const descriptionElement =
        document.querySelector('[data-test="job-description"]') ||
        document.querySelector(".JobDetails_jobDescription__uW_fK") ||
        document.querySelector('[class*="jobDescription"]') ||
        document.querySelector(".desc") ||
        document.querySelector("#JobDescriptionContainer");

      if (descriptionElement) {
        jobDescription = descriptionElement.innerText?.trim() || "";
      }

      // Get posting link from the selected job card or "View job" link
      const selectedJobCard =
        document.querySelector('[data-test="job-listing"].selected') ||
        document.querySelector(".JobCard.selected") ||
        document.querySelector('[class*="JobCard"][class*="selected"]');

      if (selectedJobCard) {
        const jobLink = selectedJobCard.querySelector(
          'a[href*="/job-listing/"]'
        );
        if (jobLink) {
          postingLink = new URL(jobLink.href, window.location.origin).href;
        }
      }

      // Fallback: try to get from any visible job listing link
      if (!postingLink) {
        const jobListingLink = document.querySelector(
          'a[href*="/job-listing/"]'
        );
        if (jobListingLink) {
          postingLink = new URL(jobListingLink.href, window.location.origin)
            .href;
        }
      }

      // Last fallback: use current URL
      if (!postingLink) {
        postingLink = window.location.href;
      }
    } else {
      // Individual job listing page

      // Job title
      jobTitle =
        document
          .querySelector('[data-test="job-title"]')
          ?.textContent?.trim() ||
        document.querySelector('h1[class*="jobTitle"]')?.textContent?.trim() ||
        document.querySelector(".e1tk4kwz4")?.textContent?.trim() ||
        document.querySelector("h1")?.textContent?.trim() ||
        "";

      // Company name
      companyName =
        document
          .querySelector('[data-test="employer-name"]')
          ?.textContent?.trim() ||
        document
          .querySelector('[class*="employerName"]')
          ?.textContent?.trim() ||
        document.querySelector(".e1tk4kwz5")?.textContent?.trim() ||
        document.querySelector('a[href*="/Overview/"]')?.textContent?.trim() ||
        "";

      // Location
      location =
        document.querySelector('[data-test="location"]')?.textContent?.trim() ||
        document.querySelector('[class*="location"]')?.textContent?.trim() ||
        document.querySelector(".e1tk4kwz6")?.textContent?.trim() ||
        "";

      // Job description
      const descriptionElement =
        document.querySelector('[data-test="job-description"]') ||
        document.querySelector('[class*="jobDescription"]') ||
        document.querySelector(".desc") ||
        document.querySelector("#JobDescriptionContainer") ||
        document.querySelector('[class*="JobDetails"]');

      if (descriptionElement) {
        jobDescription = descriptionElement.innerText?.trim() || "";
      }

      // Posting link is current URL
      postingLink = window.location.href;
    }

    // Clean up the data
    jobTitle = jobTitle.replace(/\n/g, " ").trim();
    // Remove trailing rating numbers like "3.5", "4.2", etc. from company name
    companyName = companyName
      .replace(/\n/g, " ")
      .replace(/\d+\.\d+\s*$/, "")
      .trim();
    location = location.replace(/\n/g, " ").trim();

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
    console.error("Glassdoor scraping error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

// Initialize the scraper with shared utilities
if (window.JobbernautUtils) {
  window.JobbernautUtils.setupEventListeners(scrapeGlassdoorJob, "Glassdoor");
} else {
  console.error(
    "JobbernautUtils not loaded! Make sure shared-utils.js is loaded first."
  );
}

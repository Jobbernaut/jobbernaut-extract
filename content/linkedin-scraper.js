// Generate unique job ID
function generateJobId() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let id = "";
  for (let i = 0; i < 10; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

// Format job description with pipe syntax and proper indentation
function formatJobDescription(description) {
  if (!description) return '""';

  // Split into lines and indent each line with 4 spaces
  const lines = description.split("\n");
  const indentedLines = lines.map((line) => "    " + line);
  return "|\n" + indentedLines.join("\n");
}

// Escape YAML string if needed
function escapeYAML(str) {
  if (!str) return '""';

  // Check if string needs to be quoted
  const needsQuotes = /[:\{\}\[\],&*#?|\-<>=!%@`]|^\s|^\d/.test(str);

  if (needsQuotes && !str.includes("\n")) {
    return '"' + str.replace(/"/g, '\\"') + '"';
  }
  return str;
}

// Get default template
function getDefaultTemplate() {
  return `- job_id: {job_id}
  job_title: {job_title}
  company_name: {company_name}
  location: {location}
  status: {status}
  posting_link: {posting_link}
  job_description: {job_description}`;
}

// Format data using template
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

// Extract external apply link if available
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
        console.log("Found external apply link:", url);
        return url;
      }
    }
  }

  return null;
}

// LinkedIn job scraper
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
          .querySelector('[class*="job-details-jobs-unified-top-card__bullet"]')
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

// Main extraction function
async function extractAndCopyJobData() {
  try {
    console.log("Extracting job data...");

    // Scrape the job data
    const result = scrapeLinkedInJob();

    if (!result.success) {
      console.error("Scraping failed:", result.error);
      alert("Failed to extract job data: " + result.error);
      return;
    }

    console.log("Job data scraped:", result.data);

    // Get user's custom template or use default
    const storageResult = await chrome.storage.sync.get(["customTemplate"]);
    const template = storageResult.customTemplate || getDefaultTemplate();

    // Try to get external apply link, fallback to posting link
    const applyLink = extractApplyLink();
    const finalLink =
      applyLink || result.data.postingLink || window.location.href;

    console.log("Apply link:", applyLink);
    console.log("Final posting link:", finalLink);

    // Prepare data with proper formatting
    const jobData = {
      job_id: escapeYAML(generateJobId()),
      job_title: escapeYAML(result.data.jobTitle || ""),
      company_name: escapeYAML(result.data.companyName || ""),
      location: escapeYAML(result.data.location || ""),
      status: "pending",
      posting_link: escapeYAML(finalLink),
      job_description: formatJobDescription(result.data.jobDescription || ""),
    };

    // Format using template
    const formattedOutput = formatData(jobData, template);

    // Copy to clipboard
    await navigator.clipboard.writeText(formattedOutput);

    console.log("Copied to clipboard!");

    // Show success message
    showNotification("✓ Copied to clipboard!");
  } catch (error) {
    console.error("Error extracting job data:", error);
    alert("Failed to extract job data: " + error.message);
  }
}

// Show notification on page
function showNotification(message) {
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
    background: #0a66c2;
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

  // Remove after 3 seconds
  setTimeout(() => {
    notification.style.animation = "slideIn 0.3s ease-out reverse";
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Listen for extension icon clicks
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Content script received message:", request);
  if (request.action === "extractJob") {
    extractAndCopyJobData();
    sendResponse({ success: true });
  }
  return true;
});

// Listen for keyboard shortcut (Ctrl+Shift+E or Cmd+Shift+E)
document.addEventListener("keydown", (e) => {
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "E") {
    e.preventDefault();
    extractAndCopyJobData();
  }
});

console.log(
  "LinkedIn scraper content script loaded - Press Ctrl+Shift+E to extract job data"
);

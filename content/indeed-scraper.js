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

// Main extraction function
async function extractAndCopyJobData() {
  try {
    console.log("Extracting Indeed job data...");

    // Scrape the job data
    const result = scrapeIndeedJob();

    if (!result.success) {
      console.error("Scraping failed:", result.error);
      alert("Failed to extract job data: " + result.error);
      return;
    }

    console.log("Job data scraped:", result.data);

    // Get user's custom template or use default
    const storageResult = await chrome.storage.sync.get(["customTemplate"]);
    const template = storageResult.customTemplate || getDefaultTemplate();

    // Prepare data with proper formatting
    const jobData = {
      job_id: escapeYAML(generateJobId()),
      job_title: escapeYAML(result.data.jobTitle || ""),
      company_name: escapeYAML(result.data.companyName || ""),
      location: escapeYAML(result.data.location || ""),
      status: "pending",
      posting_link: escapeYAML(result.data.postingLink || window.location.href),
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
    background: #2557a7;
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
  console.log("Indeed scraper received message:", request);
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
  "Indeed scraper content script loaded - Press Ctrl+Shift+E to extract job data"
);

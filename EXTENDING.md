# Extending Jobbernaut Extract

This guide explains how to add support for additional job boards beyond LinkedIn.

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Adding a New Job Board](#adding-a-new-job-board)
- [Step-by-Step Guide](#step-by-step-guide)
- [Testing Your Scraper](#testing-your-scraper)
- [Best Practices](#best-practices)

## Architecture Overview

The extension uses a modular architecture that makes it easy to add new job board scrapers:

```
Extension Architecture
├── manifest.json          # Defines which sites to inject scripts into
├── background.js          # Routes icon clicks to appropriate content scripts
└── content/               # Content scripts for each job board
    ├── linkedin-scraper.js
    ├── indeed-scraper.js     (example)
    └── glassdoor-scraper.js  (example)
```

### How It Works

1. **User clicks extension icon** → Background script receives the click
2. **Background script checks URL** → Determines which job board the user is on
3. **Sends message to content script** → Tells the appropriate scraper to extract data
4. **Content script scrapes page** → Extracts job data from the DOM
5. **Formats and copies** → Applies template and copies to clipboard

## Adding a New Job Board

To add support for a new job board (e.g., Indeed, Glassdoor, Monster), you need to:

1. Create a new content script file
2. Update the manifest.json
3. Update the background.js
4. Test the scraper

## Step-by-Step Guide

### Step 1: Create a Content Script

Create a new file in the `content/` directory, e.g., `content/indeed-scraper.js`:

```javascript
// Generate unique job ID
function generateJobId() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let id = "";
  for (let i = 0; i < 10; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

// Format job description with pipe syntax
function formatJobDescription(description) {
  if (!description) return '""';
  const lines = description.split("\n");
  const indentedLines = lines.map((line) => "    " + line);
  return "|\n" + indentedLines.join("\n");
}

// Escape YAML string if needed
function escapeYAML(str) {
  if (!str) return '""';
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

// Indeed-specific scraper function
function scrapeIndeedJob() {
  try {
    // TODO: Update these selectors to match Indeed's HTML structure
    const jobTitle = document.querySelector(".jobsearch-JobInfoHeader-title")?.textContent?.trim() || "";
    const companyName = document.querySelector('[data-company-name="true"]')?.textContent?.trim() || "";
    const location = document.querySelector('[data-testid="job-location"]')?.textContent?.trim() || "";
    const jobDescription = document.querySelector("#jobDescriptionText")?.innerText?.trim() || "";
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

    const result = scrapeIndeedJob();

    if (!result.success) {
      console.error("Scraping failed:", result.error);
      alert("Failed to extract job data: " + result.error);
      return;
    }

    const storageResult = await chrome.storage.sync.get(["customTemplate"]);
    const template = storageResult.customTemplate || getDefaultTemplate();

    const jobData = {
      job_id: escapeYAML(generateJobId()),
      job_title: escapeYAML(result.data.jobTitle || ""),
      company_name: escapeYAML(result.data.companyName || ""),
      location: escapeYAML(result.data.location || ""),
      status: "pending",
      posting_link: escapeYAML(result.data.postingLink || window.location.href),
      job_description: formatJobDescription(result.data.jobDescription || ""),
    };

    const formattedOutput = formatData(jobData, template);
    await navigator.clipboard.writeText(formattedOutput);

    console.log("Copied to clipboard!");
    showNotification("✓ Copied to clipboard!");
  } catch (error) {
    console.error("Error extracting job data:", error);
    alert("Failed to extract job data: " + error.message);
  }
}

// Show notification
function showNotification(message) {
  const existing = document.getElementById("jobbernaut-notification");
  if (existing) existing.remove();

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
  `;

  document.body.appendChild(notification);
  setTimeout(() => notification.remove(), 3000);
}

// Listen for messages
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Indeed scraper received message:", request);
  if (request.action === "extractJob") {
    extractAndCopyJobData();
    sendResponse({ success: true });
  }
  return true;
});

// Keyboard shortcut
document.addEventListener("keydown", (e) => {
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "E") {
    e.preventDefault();
    extractAndCopyJobData();
  }
});

console.log("Indeed scraper loaded - Press Ctrl+Shift+E to extract job data");
```

### Step 2: Update manifest.json

Add the new job board to the `content_scripts` section:

```json
{
  "content_scripts": [
    {
      "matches": ["https://www.linkedin.com/jobs/*"],
      "js": ["content/linkedin-scraper.js"]
    },
    {
      "matches": ["https://www.indeed.com/viewjob*", "https://www.indeed.com/jobs*"],
      "js": ["content/indeed-scraper.js"]
    }
  ]
}
```

Also update the `host_permissions`:

```json
{
  "host_permissions": [
    "https://www.linkedin.com/*",
    "https://www.indeed.com/*"
  ]
}
```

### Step 3: Update background.js

Add URL detection for the new job board:

```javascript
chrome.action.onClicked.addListener(async (tab) => {
  try {
    // Check which job board we're on
    if (tab.url.includes("linkedin.com/jobs")) {
      chrome.tabs.sendMessage(tab.id, { action: "extractJob" });
    } else if (tab.url.includes("indeed.com")) {
      chrome.tabs.sendMessage(tab.id, { action: "extractJob" });
    } else if (tab.url.includes("glassdoor.com")) {
      chrome.tabs.sendMessage(tab.id, { action: "extractJob" });
    } else {
      chrome.notifications.create({
        type: "basic",
        iconUrl: "icons/icon48.png",
        title: "Jobbernaut Extract",
        message: "Please navigate to a supported job board",
      });
    }
  } catch (error) {
    console.error("Error:", error);
  }
});
```

### Step 4: Find the Right Selectors

This is the most important step! You need to inspect the job board's HTML to find the correct CSS selectors.

#### How to Find Selectors:

1. **Open the job board** (e.g., Indeed.com)
2. **Navigate to a job posting**
3. **Open DevTools** (F12 or right-click → Inspect)
4. **Use the element picker** (click the arrow icon in DevTools)
5. **Click on elements** you want to extract (title, company, description, etc.)
6. **Note the CSS selectors** in the DevTools

#### Example Selector Discovery:

```javascript
// Job Title - Look for:
// - <h1> tags with specific classes
// - Elements with data-testid attributes
// - Unique class names
document.querySelector(".jobsearch-JobInfoHeader-title")

// Company Name - Look for:
// - Links or spans near the title
// - Elements with data attributes
document.querySelector('[data-company-name="true"]')

// Location - Look for:
// - Icons followed by text
// - Specific data-testid attributes
document.querySelector('[data-testid="job-location"]')

// Job Description - Look for:
// - Main content divs
// - Elements with IDs like "jobDescription"
document.querySelector("#jobDescriptionText")
```

#### Tips for Finding Selectors:

- **Use specific selectors** - Avoid generic classes like `.text` or `.content`
- **Prefer IDs and data attributes** - They're more stable than classes
- **Test in console** - Type `document.querySelector("your-selector")` in the browser console
- **Have fallbacks** - Use multiple selectors with `||` operator
- **Check different job postings** - Make sure selectors work across different pages

### Step 5: Test Your Scraper

1. **Reload the extension** in `chrome://extensions/`
2. **Navigate to a job posting** on the new job board
3. **Open the browser console** (F12)
4. **Click the extension icon** or press Ctrl+Shift+E
5. **Check the console** for any errors
6. **Verify the output** - Paste the clipboard content to check formatting

## Testing Your Scraper

### Manual Testing Checklist

- [ ] Extension icon works on job board
- [ ] Keyboard shortcut (Ctrl+Shift+E) works
- [ ] Job title is extracted correctly
- [ ] Company name is extracted correctly
- [ ] Location is extracted correctly
- [ ] Job description is complete (not truncated)
- [ ] Posting link is correct
- [ ] YAML formatting is valid
- [ ] Special characters are escaped properly
- [ ] Works on multiple different job postings
- [ ] Works on both search results and individual job pages (if applicable)

### Common Issues

**Issue: Selectors don't work**
- Solution: Job board may have changed their HTML. Inspect the page again and update selectors.

**Issue: Description is truncated**
- Solution: Look for "Show more" buttons that need to be clicked, or find the full description in a different element.

**Issue: Special characters break YAML**
- Solution: Make sure you're using the `escapeYAML()` function on all string fields.

**Issue: Extension doesn't inject on the page**
- Solution: Check that the URL pattern in manifest.json matches the actual job board URLs.

## Best Practices

### 1. Use Multiple Selector Fallbacks

```javascript
const jobTitle = 
  document.querySelector(".primary-selector")?.textContent?.trim() ||
  document.querySelector(".fallback-selector")?.textContent?.trim() ||
  document.querySelector("h1")?.textContent?.trim() ||
  "";
```

### 2. Handle Dynamic Content

Some job boards load content dynamically. You may need to wait for elements:

```javascript
function waitForElement(selector, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const element = document.querySelector(selector);
    if (element) return resolve(element);

    const observer = new MutationObserver(() => {
      const element = document.querySelector(selector);
      if (element) {
        observer.disconnect();
        resolve(element);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    setTimeout(() => {
      observer.disconnect();
      reject(new Error(`Timeout waiting for ${selector}`));
    }, timeout);
  });
}

// Usage
async function scrapeJob() {
  const titleElement = await waitForElement(".job-title");
  const jobTitle = titleElement.textContent.trim();
  // ...
}
```

### 3. Clean Up Text Content

```javascript
function cleanText(text) {
  return text
    .replace(/\s+/g, ' ')  // Replace multiple spaces with single space
    .replace(/\n+/g, '\n') // Replace multiple newlines with single newline
    .trim();               // Remove leading/trailing whitespace
}

const jobTitle = cleanText(element.textContent);
```

### 4. Add Logging for Debugging

```javascript
function scrapeJob() {
  console.log("Starting job scrape...");
  
  const jobTitle = document.querySelector(".title")?.textContent?.trim() || "";
  console.log("Job title:", jobTitle);
  
  const companyName = document.querySelector(".company")?.textContent?.trim() || "";
  console.log("Company name:", companyName);
  
  // ... more extraction
  
  console.log("Scrape complete:", { jobTitle, companyName, /* ... */ });
}
```

### 5. Handle Errors Gracefully

```javascript
function scrapeJob() {
  try {
    // Extraction logic
    return { success: true, data: { /* ... */ } };
  } catch (error) {
    console.error("Scraping error:", error);
    return { success: false, error: error.message };
  }
}
```

## Supported Job Boards (Examples)

Here are URL patterns for common job boards you might want to add:

### Indeed
- Search: `https://www.indeed.com/jobs*`
- Job view: `https://www.indeed.com/viewjob*`

### Glassdoor
- Search: `https://www.glassdoor.com/Job/*`
- Job view: `https://www.glassdoor.com/job-listing/*`

### Monster
- Job view: `https://www.monster.com/job-openings/*`

### ZipRecruiter
- Job view: `https://www.ziprecruiter.com/c/*`

### Dice (Tech jobs)
- Job view: `https://www.dice.com/jobs/detail/*`

### AngelList (Startups)
- Job view: `https://angel.co/company/*/jobs/*`

## Contributing Your Scraper

If you've created a scraper for a new job board:

1. Test it thoroughly on multiple job postings
2. Document any quirks or limitations
3. Add it to the repository
4. Update this guide with any new patterns or techniques you discovered

## Need Help?

If you're stuck:
1. Check the browser console for errors
2. Inspect the page HTML carefully
3. Test your selectors in the browser console
4. Look at the existing LinkedIn scraper for reference
5. Open an issue on GitHub with details about what you're trying to scrape

Happy scraping! 🚀

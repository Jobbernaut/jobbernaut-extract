// Jobbernaut Extract - YCombinator Scraper
// Extracts job data from YCombinator job postings

(function () {
  "use strict";

  console.log("YCombinator scraper initializing...");

  // Check if shared utilities are available
  if (!window.JobbernautUtils) {
    console.error(
      "JobbernautUtils not loaded! Make sure shared-utils.js is loaded first."
    );
    return;
  }

  const { setupEventListeners } = window.JobbernautUtils;

  // YCombinator-specific scraping function
  function scrapeYCombinatorJob() {
    try {
      // Extract job title - typically in an h1 or h2 near the top
      let jobTitle = "";
      const titleSelectors = [
        "h1",
        "h2",
        '[class*="title"]',
        '[class*="job-title"]',
      ];

      for (const selector of titleSelectors) {
        const element = document.querySelector(selector);
        if (element && element.textContent.trim()) {
          const text = element.textContent.trim();
          // Skip if it's just the company name or too short
          if (text.length > 5 && !text.includes("Y Combinator")) {
            jobTitle = text;
            break;
          }
        }
      }

      // Extract company name from the page URL and find the matching link
      let companyName = "";

      // YCombinator job URLs follow the pattern: /companies/[company-name]/jobs/[job-id]
      // Extract the company slug from the current URL
      const urlMatch = window.location.pathname.match(/\/companies\/([^\/]+)/);

      if (urlMatch) {
        const companySlug = urlMatch[1]; // e.g., "numero"

        // Find the link with this specific company href
        const companyLink = document.querySelector(
          `a[href="/companies/${companySlug}"], a[href="/companies/${companySlug}/"]`
        );

        if (companyLink) {
          companyName = companyLink.textContent.trim();
        }
      }

      // Extract location - often near salary/equity info
      let location = "";
      const locationPatterns = [
        /([A-Z]{2}\s*\/\s*Remote)/i,
        /(Remote\s*\([^)]+\))/i,
        /(US\s*\/\s*[^•\n]+)/i,
        /([A-Z][a-z]+,\s*[A-Z]{2})/,
        /(Remote)/i,
      ];

      const bodyText = document.body.textContent;
      for (const pattern of locationPatterns) {
        const match = bodyText.match(pattern);
        if (match) {
          location = match[1].trim();
          break;
        }
      }

      // Extract job description - everything from "About the role" onwards
      let jobDescription = "";

      // Try to find the main content area
      const contentSelectors = [
        '[class*="description"]',
        '[class*="content"]',
        "main",
        "article",
        '[role="main"]',
      ];

      let contentElement = null;
      for (const selector of contentSelectors) {
        const element = document.querySelector(selector);
        if (element) {
          contentElement = element;
          break;
        }
      }

      if (contentElement) {
        // Get all text content, preserving structure
        const walker = document.createTreeWalker(
          contentElement,
          NodeFilter.SHOW_TEXT,
          null,
          false
        );

        let textParts = [];
        let node;
        while ((node = walker.nextNode())) {
          const text = node.textContent.trim();
          if (text.length > 0) {
            textParts.push(text);
          }
        }

        jobDescription = textParts.join("\n");
      } else {
        // Fallback: get all paragraph text
        const paragraphs = document.querySelectorAll("p");
        const descParts = [];
        paragraphs.forEach((p) => {
          const text = p.textContent.trim();
          if (text.length > 20) {
            descParts.push(text);
          }
        });
        jobDescription = descParts.join("\n\n");
      }

      // Clean up the description
      jobDescription = jobDescription
        .replace(/\s+/g, " ") // Normalize whitespace
        .replace(/\n\s*\n/g, "\n\n") // Clean up multiple newlines
        .trim();

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
      console.error("Error scraping YCombinator job:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Setup event listeners using shared utilities
  setupEventListeners(scrapeYCombinatorJob, "YCombinator");
})();

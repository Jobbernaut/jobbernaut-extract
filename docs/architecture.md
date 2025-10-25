# Architecture Documentation

This document provides a detailed overview of the Jobbernaut Extract extension architecture.

## Table of Contents

- [Overview](#overview)
- [Component Architecture](#component-architecture)
- [Data Flow](#data-flow)
- [File Structure](#file-structure)
- [Key Components](#key-components)
- [Extension Lifecycle](#extension-lifecycle)
- [Security Considerations](#security-considerations)

## Overview

Jobbernaut Extract is a Chrome extension built using Manifest V3 that extracts job posting data from job boards and formats it into YAML for easy storage and tracking.

### Core Technologies

- **Manifest V3** - Latest Chrome extension API
- **Service Worker** - Background script for event handling
- **Content Scripts** - Injected scripts for DOM manipulation
- **Chrome Storage API** - For persisting user settings
- **Chrome Notifications API** - For user feedback

## Component Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        User Interface                        │
├─────────────────────────────────────────────────────────────┤
│  Extension Icon  │  Keyboard Shortcut  │  Settings Page     │
│  (Click Action)  │  (Ctrl+Shift+E)     │  (Options Page)    │
└────────┬─────────┴──────────┬──────────┴──────────┬─────────┘
         │                    │                      │
         ▼                    ▼                      ▼
┌─────────────────────────────────────────────────────────────┐
│                     Background Script                        │
│                    (Service Worker)                          │
│  • Handles icon clicks                                       │
│  • Routes messages to content scripts                        │
│  • Manages context menus                                     │
└────────┬────────────────────────────────────────────────────┘
         │
         │ Message Passing
         ▼
┌─────────────────────────────────────────────────────────────┐
│                    Content Scripts                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   LinkedIn   │  │    Indeed    │  │  Glassdoor   │      │
│  │   Scraper    │  │   Scraper    │  │   Scraper    │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                  │                  │              │
│         └──────────────────┴──────────────────┘              │
│                            │                                 │
│                            ▼                                 │
│                  ┌──────────────────┐                        │
│                  │  Data Extraction │                        │
│                  │  & Formatting    │                        │
│                  └────────┬─────────┘                        │
└───────────────────────────┼──────────────────────────────────┘
                            │
                            ▼
                   ┌─────────────────┐
                   │  Clipboard API  │
                   └─────────────────┘
```

## Data Flow

### 1. User Initiates Extraction

```
User Action (Icon Click or Keyboard Shortcut)
    ↓
Background Script Receives Event
    ↓
Checks Current Tab URL
    ↓
Determines Which Job Board
    ↓
Sends Message to Appropriate Content Script
```

### 2. Content Script Processes Request

```
Content Script Receives Message
    ↓
Scrapes DOM for Job Data
    ↓
Extracts:
  • Job Title
  • Company Name
  • Location
  • Job Description
  • Posting Link
    ↓
Validates Extracted Data
```

### 3. Data Formatting

```
Raw Extracted Data
    ↓
Generate Unique Job ID
    ↓
Escape YAML Special Characters
    ↓
Format Job Description (Pipe Syntax)
    ↓
Retrieve User's Custom Template
    ↓
Apply Template Variables
    ↓
Generate Final YAML Output
```

### 4. Output to User

```
Formatted YAML
    ↓
Copy to Clipboard
    ↓
Show Success Notification
    ↓
User Pastes into applications.yaml
```

## File Structure

```
jobbernaut-extract/
├── manifest.json              # Extension configuration
│   ├── Defines permissions
│   ├── Specifies content scripts
│   ├── Declares background service worker
│   └── Sets extension metadata
│
├── background.js              # Service worker
│   ├── Handles extension icon clicks
│   ├── Routes messages to content scripts
│   ├── Creates context menus
│   └── Manages extension lifecycle
│
├── content/                   # Content scripts (injected into pages)
│   └── linkedin-scraper.js
│       ├── DOM scraping logic
│       ├── Data extraction functions
│       ├── YAML formatting
│       ├── Clipboard operations
│       └── Message listeners
│
├── options/                   # Settings page
│   ├── options.html          # Settings UI
│   ├── options.css           # Settings styles
│   └── options.js            # Settings logic
│       ├── Template management
│       ├── Storage operations
│       └── Preview generation
│
├── icons/                     # Extension icons
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
│
└── docs/                      # Documentation
    ├── architecture.md
    ├── scraper-guide.md
    └── template-customization.md
```

## Key Components

### 1. Manifest (manifest.json)

**Purpose:** Defines extension configuration and permissions

**Key Sections:**
```json
{
  "manifest_version": 3,
  "permissions": [
    "activeTab",      // Access current tab
    "storage",        // Store settings
    "clipboardWrite", // Copy to clipboard
    "notifications",  // Show notifications
    "scripting"       // Inject scripts
  ],
  "host_permissions": [
    "https://www.linkedin.com/*"  // Access LinkedIn
  ],
  "content_scripts": [
    {
      "matches": ["https://www.linkedin.com/jobs/*"],
      "js": ["content/linkedin-scraper.js"]
    }
  ],
  "background": {
    "service_worker": "background.js"
  }
}
```

### 2. Background Script (background.js)

**Purpose:** Handles extension-level events and routing

**Key Functions:**
- `chrome.action.onClicked` - Handles icon clicks
- `chrome.contextMenus` - Creates right-click menu
- `chrome.tabs.sendMessage` - Sends messages to content scripts

**Message Flow:**
```javascript
Icon Click → Check URL → Send Message to Content Script
```

### 3. Content Scripts (content/linkedin-scraper.js)

**Purpose:** Interacts with job board pages to extract data

**Key Functions:**

#### Data Extraction
```javascript
scrapeLinkedInJob()
  ├── Selects DOM elements
  ├── Extracts text content
  ├── Handles search results vs individual pages
  └── Returns structured data
```

#### Data Formatting
```javascript
formatJobDescription()
  ├── Splits into lines
  ├── Indents each line
  └── Returns YAML pipe format

escapeYAML()
  ├── Checks for special characters
  ├── Adds quotes if needed
  └── Escapes existing quotes
```

#### Template Processing
```javascript
formatData()
  ├── Retrieves custom template
  ├── Replaces placeholders
  └── Returns formatted output
```

### 4. Options Page (options/)

**Purpose:** Allows users to customize the YAML template

**Components:**
- **HTML** - Template editor UI
- **CSS** - Styling for settings page
- **JavaScript** - Template management logic

**Storage:**
```javascript
chrome.storage.sync.set({ customTemplate: template })
chrome.storage.sync.get(['customTemplate'])
```

## Extension Lifecycle

### Installation

```
User Installs Extension
    ↓
chrome.runtime.onInstalled fires
    ↓
Create context menu items
    ↓
Initialize default settings (if needed)
    ↓
Extension ready
```

### Normal Operation

```
User Navigates to LinkedIn Job Page
    ↓
Content Script Injected Automatically
    ↓
Script Waits for User Action
    ↓
User Clicks Icon or Presses Shortcut
    ↓
Background Script Routes Message
    ↓
Content Script Extracts Data
    ↓
Data Copied to Clipboard
    ↓
Notification Shown
```

### Settings Update

```
User Opens Settings
    ↓
Loads Current Template from Storage
    ↓
User Edits Template
    ↓
Clicks Save
    ↓
Validates Template
    ↓
Saves to Chrome Storage
    ↓
Updates Preview
```

## Security Considerations

### 1. Permissions

The extension uses minimal permissions:
- **activeTab** - Only accesses the current tab when user clicks icon
- **storage** - Only stores user's template preference
- **clipboardWrite** - Only writes to clipboard, never reads
- **notifications** - Only shows notifications, no sensitive data

### 2. Content Script Isolation

Content scripts run in an isolated environment:
- Cannot access page's JavaScript variables
- Cannot access page's localStorage
- Can only read/modify DOM
- Cannot make arbitrary network requests

### 3. Data Privacy

- **No data collection** - Extension doesn't send data anywhere
- **Local storage only** - Settings stored locally in Chrome
- **No analytics** - No tracking or telemetry
- **No external requests** - All processing happens locally

### 4. XSS Prevention

```javascript
// Safe: Using textContent (not innerHTML)
element.textContent.trim()

// Safe: Escaping YAML special characters
escapeYAML(userInput)

// Safe: Template replacement (no eval)
template.replace(/{variable}/g, value)
```

### 5. Input Validation

```javascript
// Validate extracted data
if (!jobTitle || !companyName) {
  return { success: false, error: "Missing required fields" };
}

// Sanitize before YAML formatting
const cleanTitle = escapeYAML(jobTitle);
```

## Performance Considerations

### 1. Lazy Loading

Content scripts only load on matching pages:
```json
"content_scripts": [{
  "matches": ["https://www.linkedin.com/jobs/*"],
  "js": ["content/linkedin-scraper.js"]
}]
```

### 2. Efficient DOM Queries

```javascript
// Good: Specific selectors
document.querySelector(".job-title")

// Bad: Broad queries
document.querySelectorAll("*")
```

### 3. Minimal Storage

Only stores user's template (< 1KB):
```javascript
chrome.storage.sync.set({ customTemplate: template })
```

### 4. No Background Polling

Service worker only activates on events:
- Icon clicks
- Context menu clicks
- No continuous background processing

## Extension Updates

### Version Management

```javascript
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "update") {
    // Handle extension update
    console.log("Updated to version:", chrome.runtime.getManifest().version);
  }
});
```

### Backward Compatibility

When updating scrapers:
1. Keep old selectors as fallbacks
2. Test on multiple job postings
3. Maintain template variable names
4. Don't break existing user templates

## Debugging

### Console Logging

Each component logs its actions:
```javascript
console.log("LinkedIn scraper loaded");
console.log("Extracting job data...");
console.log("Job data scraped:", result.data);
console.log("Copied to clipboard!");
```

### Error Handling

```javascript
try {
  // Extraction logic
} catch (error) {
  console.error("Scraping error:", error);
  alert("Failed to extract job data: " + error.message);
}
```

### Chrome DevTools

- **Console** - View logs and errors
- **Network** - Monitor API calls (if any)
- **Application** - Inspect storage
- **Sources** - Debug content scripts

## Future Enhancements

Potential architectural improvements:

1. **Multi-board Support** - Add Indeed, Glassdoor scrapers
2. **Background Sync** - Auto-save to cloud storage
3. **Batch Processing** - Extract multiple jobs at once
4. **AI Integration** - Auto-categorize or summarize jobs
5. **Export Formats** - Support JSON, CSV in addition to YAML

## Conclusion

The extension follows a clean, modular architecture that:
- Separates concerns (background, content, options)
- Uses Chrome APIs appropriately
- Maintains security and privacy
- Allows easy extension for new job boards
- Provides a smooth user experience

# Jobbernaut Extract

A Chrome extension that extracts job application data from LinkedIn, Indeed, YCombinator, Wellfound, Glassdoor, and Monster job postings and copies it to your clipboard in a customizable YAML format.

## 🚀 Quick Start

1. **Install the extension** (see [Installation](#installation))
2. **Navigate to a LinkedIn, Indeed, YCombinator, Wellfound, Glassdoor, or Monster job posting**
3. **Press Ctrl+Shift+E** (Windows/Linux) or **Cmd+Shift+E** (Mac)
4. **Paste** the extracted data into your `applications.yaml` file

That's it! The job data is now in your clipboard, ready to track.

## ✨ Features

- **Keyboard Shortcut** - Fast extraction with Ctrl+Shift+E (Cmd+Shift+E on Mac)
- **Customizable Templates** - Configure your own YAML output format
- **Auto-Generated Job IDs** - Unique 10-character alphanumeric IDs
- **Complete Job Descriptions** - Full job description text with proper YAML formatting
- **Clipboard Copy** - Automatically copies formatted data to clipboard
- **Visual Feedback** - Chrome notifications confirm successful extraction

## ⚠️ Usage & Disclaimer

**This extension is provided for personal productivity use only.**

### Important Notes

- **Respect Terms of Service**: Users are responsible for complying with each job site's Terms of Service when using this extension
- **No Warranty**: This software is provided "as is" under the MIT License, without warranty of any kind, express or implied
- **Site Changes**: Job sites may update their HTML structure at any time, which may temporarily break scrapers until updated
- **Personal Use**: This tool is designed for individual job seekers to organize their applications, not for bulk data collection or commercial scraping
- **Rate Limits**: Use responsibly and respect site rate limits and automated access policies
- **Your Responsibility**: By using this extension, you accept full responsibility for your usage and compliance with applicable terms and laws

### What This Extension Does

✅ Extracts publicly visible job posting data from pages you're already viewing  
✅ Formats the data for your personal job tracking workflow  
✅ Copies the formatted data to your clipboard for manual pasting  

### What This Extension Does NOT Do

❌ Scrape data in bulk or at scale  
❌ Bypass authentication or paywalls  
❌ Store or transmit your data to external servers  
❌ Violate site terms of service (when used as intended for personal job tracking)  

**If you have concerns about using this tool, please review the Terms of Service for each job site you use it with.**

## Installation

1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked"
5. Select the `jobbernaut-extract` folder
6. The extension icon should appear in your Chrome toolbar

## Usage

### Extracting Job Data

The extension works on both LinkedIn job search results pages and individual job posting pages.

**Keyboard Shortcut:**
1. Navigate to a job page (search results or individual posting)
2. Press **Ctrl+Shift+E** (Windows/Linux) or **Cmd+Shift+E** (Mac)
3. The job data will be instantly extracted and copied to your clipboard
4. You'll see a notification: "✓ Copied to clipboard!"
5. Paste the data into your `applications.yaml` file

**Tips:**
- Works on both search results pages and individual job postings
- On search results pages, click a job in the left sidebar first to load its details

### Accessing Settings

1. Navigate to `chrome://extensions/`
2. Find "Jobbernaut Extract" in the list
3. Click "Details"
4. Click "Extension options"
5. The settings page will open in a new tab

### Configuring the Template

In the settings page, you'll find:

#### Available Fields

These placeholders will be replaced with actual job data:

- `{job_id}` - Auto-generated unique ID (e.g., "ABC123XYZ0")
- `{job_title}` - Job title from the posting
- `{company_name}` - Company name
- `{location}` - Job location
- `{status}` - Always set to "pending"
- `{posting_link}` - URL of the job posting
- `{job_description}` - Full job description (formatted with YAML pipe syntax)

#### Default Template

```yaml
- job_id: {job_id}
  job_title: {job_title}
  company_name: {company_name}
  location: {location}
  status: {status}
  posting_link: {posting_link}
  job_description: {job_description}
```

#### Customizing Your Template

1. Edit the template in the text area
2. Use any of the available field placeholders
3. Click "Save Template" to save your changes
4. The preview section shows how your output will look with sample data
5. Click "Reset to Default" to restore the original template

### Example Output

When you extract a job posting, the output will look like this:

```yaml
- job_id: K7M9N2P4Q1
  job_title: Senior Software Engineer
  company_name: Tech Company Inc.
  location: San Francisco, CA (Remote)
  status: pending
  posting_link: https://www.linkedin.com/jobs/view/1234567890
  job_description: |
    We are seeking a talented Senior Software Engineer to join our team.
    
    Responsibilities:
    - Design and develop scalable applications
    - Collaborate with cross-functional teams
    - Mentor junior developers
    
    Requirements:
    - 5+ years of experience
    - Strong knowledge of JavaScript/TypeScript
    - Experience with React and Node.js
```

## How It Works

1. **Content Script**: When you visit a job page, the extension injects a content script that can read the page content
2. **Data Extraction**: When you press Ctrl+Shift+E, it extracts:
   - Job title
   - Company name
   - Location
   - Full job description
   - Posting URL
3. **Data Formatting**: The extension:
   - Generates a unique job ID
   - Formats the job description with YAML pipe syntax for multi-line content
   - Applies your custom template
   - Escapes special YAML characters as needed
4. **Clipboard Copy**: The formatted data is copied to your clipboard
5. **Notification**: A Chrome notification confirms the successful extraction

## File Structure

```
jobbernaut-extract/
├── manifest.json           # Extension configuration
├── background.js           # Background service worker
├── content/
│   ├── shared-utils.js        # Shared utilities for all scrapers
│   ├── linkedin-scraper.js    # LinkedIn-specific scraper
│   ├── indeed-scraper.js      # Indeed-specific scraper
│   ├── ycombinator-scraper.js # YCombinator-specific scraper
│   ├── wellfound-scraper.js   # Wellfound-specific scraper
│   ├── glassdoor-scraper.js   # Glassdoor-specific scraper
│   └── monster-scraper.js     # Monster-specific scraper
├── options/
│   ├── options.html        # Settings page
│   ├── options.css         # Settings page styles
│   └── options.js          # Settings page logic
├── icons/
│   ├── icon16.png          # 16x16 icon
│   ├── icon48.png          # 48x48 icon
│   └── icon128.png         # 128x128 icon
├── docs/
│   ├── architecture.md     # Technical architecture guide
│   └── template-customization.md # Template customization guide
├── EXTENDING.md            # Guide for adding new job boards
└── README.md               # This file
```

## Code Architecture

The extension uses a **modular architecture** with shared utilities to minimize code duplication:

### Shared Utilities (`content/shared-utils.js`)

All common functionality is centralized in a shared utilities module:
- **`generateJobId()`** - Generates unique 10-character alphanumeric IDs
- **`formatJobDescription()`** - Formats job descriptions with YAML pipe syntax
- **`escapeYAML()`** - Escapes special YAML characters
- **`getDefaultTemplate()`** - Returns the default YAML template
- **`formatData()`** - Replaces template variables with actual data
- **`showNotification()`** - Displays on-page success notifications
- **`extractAndCopyJobData()`** - Generic extraction logic that works with any scraper
- **`setupEventListeners()`** - Sets up message listeners and keyboard shortcuts

### Site-Specific Scrapers

Each job board has a lightweight scraper that focuses only on extracting data:
- **`linkedin-scraper.js`** (~100 lines) - LinkedIn-specific CSS selectors and logic
- **`indeed-scraper.js`** (~100 lines) - Indeed-specific CSS selectors and logic
- **`ycombinator-scraper.js`** (~100 lines) - YCombinator-specific CSS selectors and logic
- **`wellfound-scraper.js`** (~100 lines) - Wellfound-specific CSS selectors and logic

### Benefits of This Architecture

✅ **DRY (Don't Repeat Yourself)** - No code duplication across scrapers
✅ **Easy Maintenance** - Bug fixes in one place benefit all scrapers
✅ **Consistency** - Same behavior across all job boards
✅ **Extensibility** - Adding new job boards requires minimal code (~100 lines)
✅ **Testability** - Shared utilities can be tested independently

### Data Flow

```
Keyboard Shortcut (Ctrl+Shift+E)
    ↓
Content Script (extracts job data from page)
    ↓
Shared Utilities (formats data using template)
    ↓
Clipboard (copies YAML output)
    ↓
Notification (confirms success)
```

For detailed architecture information, see [docs/architecture.md](docs/architecture.md).

## File Structure

## Permissions

The extension requires the following permissions:

- `activeTab` - To access the current LinkedIn job page
- `storage` - To save your custom template
- `clipboardWrite` - To copy data to clipboard
- `notifications` - To show success/error notifications
- `scripting` - To inject the content script
- `https://www.linkedin.com/*` - To access LinkedIn job pages

## Troubleshooting

### No data is extracted
- Ensure you're on a valid job posting page
- The job board may have changed their page structure - the extension may need updates

### Template not saving
- Make sure you have a valid template with at least one field
- Try resetting to default and customizing from there

### Clipboard copy not working
- Make sure you've granted clipboard permissions to the extension
- Try pressing Ctrl+Shift+E again

## 📚 Documentation

Comprehensive documentation is available in the `docs/` directory:

- **[Architecture Guide](docs/architecture.md)** - Detailed technical architecture and component overview
- **[Extending Guide](EXTENDING.md)** - How to add support for other job boards (Indeed, Glassdoor, etc.)
- **[Template Customization](docs/template-customization.md)** - Complete guide to customizing YAML output templates

### Quick Links

- [How to add a new job board](EXTENDING.md#step-by-step-guide)
- [Template examples](docs/template-customization.md#examples)
- [Architecture overview](docs/architecture.md#component-architecture)
- [Security considerations](docs/architecture.md#security-considerations)

## 🔧 Extending to Other Job Boards

The extension is designed to be easily extended to support additional job boards beyond LinkedIn. See the [EXTENDING.md](EXTENDING.md) guide for:

- Step-by-step instructions for adding new job boards
- How to find the right CSS selectors
- Example scraper implementations
- Testing and debugging tips

**Supported Job Boards:**
- ✅ LinkedIn (built-in)
- ✅ Indeed (built-in)
- ✅ YCombinator (built-in)
- ✅ Wellfound (built-in)
- ✅ Glassdoor (built-in)
- ✅ Monster (built-in)
- 📝 Any other job board (see guide to add)

## 🎨 Customizing Templates

The extension allows you to fully customize the YAML output format. See the [Template Customization Guide](docs/template-customization.md) for:

- Available template variables
- Example templates for different workflows
- Best practices for YAML formatting
- Troubleshooting common issues

**Example Custom Template:**
```yaml
- job_info:
    id: {job_id}
    title: {job_title}
    company: {company_name}
  application:
    status: {status}
    applied_date: ""
  links:
    posting: {posting_link}
  description: {job_description}
```

## 🏗️ Architecture

The extension uses a modular architecture:

```
Keyboard Shortcut
    ↓
Content Script (extracts job data from page)
    ↓
Template Engine (formats data)
    ↓
Clipboard (copies YAML output)
```

For detailed architecture information, see [docs/architecture.md](docs/architecture.md).

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Add support for new job boards** - Follow the [EXTENDING.md](EXTENDING.md) guide
2. **Improve existing scrapers** - LinkedIn's HTML changes frequently
3. **Enhance documentation** - Help others understand and use the extension
4. **Report bugs** - Open an issue with details about the problem
5. **Suggest features** - Share ideas for improvements

### Development Setup

1. Clone the repository
2. Make your changes
3. Test in Chrome:
   - Go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the extension directory
4. Submit a pull request

## 📝 Changelog

### Version 1.0.0
- Initial release
- LinkedIn job extraction
- Customizable YAML templates
- Keyboard shortcut support
- Settings page

## 🐛 Troubleshooting

### Common Issues

**Extension doesn't work on LinkedIn**
- Make sure you're on a job posting page (URL contains `/jobs/`)
- Try refreshing the page
- Check that the extension is enabled in `chrome://extensions/`

**Job description is incomplete**
- LinkedIn may have changed their HTML structure
- Open an issue on GitHub with the job posting URL

**Template not saving**
- Ensure your template includes at least one variable
- Check browser console (F12) for errors
- Try resetting to default template

For more troubleshooting help, see the [documentation](docs/).

## 📄 License

This project is open source. Feel free to use, modify, and distribute as needed.

## 🙏 Acknowledgments

Built for job seekers who want to efficiently track their applications in YAML format.

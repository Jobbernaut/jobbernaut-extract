# Jobbernaut Extract - Chrome Extension

A Chrome extension that extracts job application data from LinkedIn job postings and copies it to your clipboard in a customizable YAML format.

## Features

- **One-Click Extraction**: Click the extension icon while viewing a LinkedIn job posting to extract job data
- **Customizable Template**: Configure your own YAML output format in the settings
- **Auto-Generated Job IDs**: Unique 10-character alphanumeric job IDs are automatically generated
- **YAML Formatting**: Job descriptions are properly formatted with pipe syntax for multi-line content
- **Clipboard Copy**: Extracted data is automatically copied to your clipboard
- **Visual Feedback**: Chrome notifications confirm successful extraction

## Installation

1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked"
5. Select the `jobbernaut-extract` folder
6. The extension icon should appear in your Chrome toolbar

## Usage

### Extracting Job Data

The extension works on both LinkedIn job search results pages and individual job posting pages. You have **two ways** to extract job data:

**Method 1: Extension Icon (Click)**
1. Navigate to a LinkedIn job page (search results or individual posting)
2. Click the Jobbernaut Extract extension icon in your Chrome toolbar
3. The job data will be extracted and copied to your clipboard
4. You'll see a notification: "✓ Copied to clipboard!"
5. Paste the data into your `applications.yaml` file

**Method 2: Keyboard Shortcut (Faster!)**
1. Navigate to a LinkedIn job page (search results or individual posting)
2. Press **Ctrl+Shift+E** (Windows/Linux) or **Cmd+Shift+E** (Mac)
3. The job data will be instantly extracted and copied to your clipboard
4. You'll see a notification: "✓ Copied to clipboard!"
5. Paste the data into your `applications.yaml` file

**Tips:**
- The keyboard shortcut is faster for extracting multiple jobs quickly
- Works on both search results pages and individual job postings
- On search results pages, click a job in the left sidebar first to load its details

### Accessing Settings

1. Right-click the extension icon in your Chrome toolbar
2. Select "Settings" from the context menu
3. The settings page will open in a new tab

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

1. **Content Script**: When you visit a LinkedIn job page, the extension injects a content script that can read the page content
2. **Data Extraction**: When you click the extension icon, it extracts:
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
│   └── linkedin-scraper.js # LinkedIn page scraper
├── options/
│   ├── options.html        # Settings page
│   ├── options.css         # Settings page styles
│   └── options.js          # Settings page logic
├── icons/
│   ├── icon16.png          # 16x16 icon
│   ├── icon48.png          # 48x48 icon
│   └── icon128.png         # 128x128 icon
└── README.md               # This file
```

## Permissions

The extension requires the following permissions:

- `activeTab` - To access the current LinkedIn job page
- `storage` - To save your custom template
- `clipboardWrite` - To copy data to clipboard
- `notifications` - To show success/error notifications
- `scripting` - To inject the content script
- `https://www.linkedin.com/*` - To access LinkedIn job pages

## Troubleshooting

### Extension icon doesn't work
- Make sure you're on a LinkedIn job posting page (URL should contain `linkedin.com/jobs`)
- Try refreshing the page and clicking the icon again

### No data is extracted
- Ensure you're on a valid LinkedIn job posting page
- LinkedIn may have changed their page structure - the extension may need updates

### Template not saving
- Check that you have a valid template with at least one field
- Try resetting to default and customizing from there

### Clipboard copy not working
- Make sure you've granted clipboard permissions to the extension
- Try clicking the extension icon again

## Support

For issues, questions, or feature requests, please visit the GitHub repository.

## License

This project is open source and available under the MIT License.

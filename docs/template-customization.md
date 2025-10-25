# Template Customization Guide

This guide explains how to customize the YAML output template in Jobbernaut Extract.

## Table of Contents

- [Overview](#overview)
- [Available Variables](#available-variables)
- [Template Syntax](#template-syntax)
- [Examples](#examples)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## Overview

The template system allows you to customize how job data is formatted when copied to your clipboard. You can:

- Rearrange fields in any order
- Add custom labels or formatting
- Include only the fields you need
- Add additional static text or metadata

## Available Variables

These placeholders will be replaced with actual job data when you extract a job posting:

| Variable | Description | Example Output |
|----------|-------------|----------------|
| `{job_id}` | Auto-generated unique ID | `K7M9N2P4Q1` |
| `{job_title}` | Job title from posting | `Senior Software Engineer` |
| `{company_name}` | Company name | `Tech Company Inc.` |
| `{location}` | Job location | `San Francisco, CA (Remote)` |
| `{status}` | Application status (always "pending") | `pending` |
| `{posting_link}` | URL of the job posting | `https://www.linkedin.com/jobs/view/123...` |
| `{job_description}` | Full job description | Multi-line formatted text |

### Variable Details

#### `{job_id}`
- **Type:** String (10 characters)
- **Format:** Alphanumeric (A-Z, 0-9)
- **Example:** `ABC123XYZ0`
- **Auto-generated:** Yes, unique for each extraction

#### `{job_title}`
- **Type:** String
- **Source:** Extracted from job posting
- **YAML Escaped:** Yes (special characters are handled)
- **Example:** `"Senior Software Engineer - Full Stack"`

#### `{company_name}`
- **Type:** String
- **Source:** Extracted from job posting
- **YAML Escaped:** Yes
- **Example:** `"Tech Innovations, Inc."`

#### `{location}`
- **Type:** String
- **Source:** Extracted from job posting
- **YAML Escaped:** Yes
- **Example:** `"San Francisco, CA (Hybrid)"`

#### `{status}`
- **Type:** String
- **Value:** Always `"pending"`
- **Purpose:** Track application status in your workflow

#### `{posting_link}`
- **Type:** URL String
- **Source:** Current page URL
- **Example:** `"https://www.linkedin.com/jobs/view/1234567890"`

#### `{job_description}`
- **Type:** Multi-line String
- **Format:** YAML pipe syntax (`|`)
- **Indentation:** 4 spaces per line
- **Example:**
  ```yaml
  job_description: |
      We are seeking a talented engineer...
      
      Responsibilities:
      - Design and develop applications
      - Collaborate with teams
  ```

## Template Syntax

### Basic YAML Structure

The default template uses YAML list format:

```yaml
- job_id: {job_id}
  job_title: {job_title}
  company_name: {company_name}
  location: {location}
  status: {status}
  posting_link: {posting_link}
  job_description: {job_description}
```

### YAML Rules

1. **Indentation matters** - Use 2 spaces for each level
2. **Colons require spaces** - `key: value` not `key:value`
3. **Lists start with dash** - `- item` for list items
4. **Quotes for special chars** - Handled automatically by the extension

## Examples

### Example 1: Minimal Template

Only include essential fields:

```yaml
- id: {job_id}
  title: {job_title}
  company: {company_name}
  link: {posting_link}
```

**Output:**
```yaml
- id: K7M9N2P4Q1
  title: Senior Software Engineer
  company: Tech Company Inc.
  link: https://www.linkedin.com/jobs/view/1234567890
```

### Example 2: Detailed Template

Include all fields with custom labels:

```yaml
- application_id: {job_id}
  position: {job_title}
  employer: {company_name}
  work_location: {location}
  application_status: {status}
  source_url: {posting_link}
  full_description: {job_description}
```

### Example 3: Grouped Template

Organize fields into logical groups:

```yaml
- job_info:
    id: {job_id}
    title: {job_title}
    company: {company_name}
    location: {location}
  application:
    status: {status}
    applied_date: ""
    follow_up_date: ""
  links:
    posting: {posting_link}
  notes: {job_description}
```

**Output:**
```yaml
- job_info:
    id: K7M9N2P4Q1
    title: Senior Software Engineer
    company: Tech Company Inc.
    location: San Francisco, CA
  application:
    status: pending
    applied_date: ""
    follow_up_date: ""
  links:
    posting: https://www.linkedin.com/jobs/view/1234567890
  notes: |
      We are seeking...
```

### Example 4: With Additional Metadata

Add custom fields for your workflow:

```yaml
- job_id: {job_id}
  job_title: {job_title}
  company_name: {company_name}
  location: {location}
  status: {status}
  posting_link: {posting_link}
  date_found: ""
  priority: ""
  salary_range: ""
  job_description: {job_description}
```

### Example 5: Flat Structure (No List)

If you prefer not to use YAML lists:

```yaml
job_id: {job_id}
job_title: {job_title}
company_name: {company_name}
location: {location}
status: {status}
posting_link: {posting_link}
job_description: {job_description}
---
```

**Note:** The `---` separator helps when appending multiple jobs.

### Example 6: JSON-like Format

While the extension outputs YAML, you can structure it JSON-style:

```yaml
- {
    "id": "{job_id}",
    "title": "{job_title}",
    "company": "{company_name}",
    "location": "{location}",
    "status": "{status}",
    "url": "{posting_link}"
  }
```

**Note:** This is still valid YAML but looks like JSON.

### Example 7: Markdown-Friendly

For pasting into Markdown documents:

```yaml
## {job_title}

**Company:** {company_name}
**Location:** {location}
**Status:** {status}
**Link:** {posting_link}

### Description
{job_description}

---
```

## Best Practices

### 1. Keep It Consistent

Use the same template for all job applications to maintain consistency in your `applications.yaml` file.

### 2. Include Essential Fields

At minimum, include:
- `{job_id}` - For unique identification
- `{job_title}` - To know what job it is
- `{company_name}` - To know where
- `{posting_link}` - To return to the posting

### 3. Plan for Future Fields

Leave placeholder fields you might fill in later:

```yaml
- job_id: {job_id}
  job_title: {job_title}
  company_name: {company_name}
  status: {status}
  applied_date: ""        # Fill in manually
  interview_date: ""      # Fill in manually
  salary_offered: ""      # Fill in manually
  job_description: {job_description}
```

### 4. Use Proper YAML Indentation

```yaml
# Good
- job_id: {job_id}
  job_title: {job_title}

# Bad (inconsistent indentation)
- job_id: {job_id}
    job_title: {job_title}
```

### 5. Test Your Template

After customizing:
1. Save the template
2. Check the preview in settings
3. Extract a real job posting
4. Verify the YAML is valid

### 6. Don't Remove Required Variables

While you can rearrange variables, avoid removing critical ones like `{job_description}` unless you truly don't need them.

## Troubleshooting

### Issue: YAML Syntax Errors

**Symptom:** Your YAML file won't parse or shows errors

**Solutions:**
- Check indentation (use 2 spaces, not tabs)
- Ensure colons have spaces after them: `key: value`
- Validate your YAML at [yamllint.com](http://www.yamllint.com/)

### Issue: Variables Not Replaced

**Symptom:** Output shows `{job_title}` instead of actual title

**Solutions:**
- Ensure variable names are spelled correctly
- Use exact variable names from the list above
- Check for extra spaces: `{job_title}` not `{ job_title }`

### Issue: Job Description Formatting Issues

**Symptom:** Description appears on one line or has weird formatting

**Solutions:**
- The extension automatically formats `{job_description}` with pipe syntax
- Don't try to manually format it in the template
- Just use `{job_description}` as-is

### Issue: Special Characters Breaking YAML

**Symptom:** Quotes or colons in job titles break the YAML

**Solutions:**
- The extension automatically escapes special characters
- If issues persist, the job posting may have unusual characters
- Try extracting a different job to verify

### Issue: Template Won't Save

**Symptom:** Clicking "Save Template" doesn't work

**Solutions:**
- Ensure you have at least one variable in the template
- Check browser console for errors (F12)
- Try resetting to default and customizing from there

## Advanced Customization

### Multi-Line Static Text

You can add multi-line static text:

```yaml
- job_id: {job_id}
  job_title: {job_title}
  notes: |
    Remember to:
    - Research the company
    - Prepare questions
    - Follow up in 1 week
  job_description: {job_description}
```

### Conditional Fields (Manual)

While the extension doesn't support conditional logic, you can add fields you'll fill conditionally:

```yaml
- job_id: {job_id}
  job_title: {job_title}
  remote: ""              # Fill with "yes" or "no"
  requires_relocation: "" # Fill with "yes" or "no"
  job_description: {job_description}
```

### Integration with Other Tools

If you're using the YAML with other tools:

**For Python scripts:**
```yaml
- job_id: {job_id}
  job_title: {job_title}
  company_name: {company_name}
  metadata:
    extracted_date: ""
    source: "linkedin"
    automated: true
```

**For spreadsheet import:**
```yaml
job_id,job_title,company_name,location,status
{job_id},{job_title},{company_name},{location},{status}
```

## Template Storage

Templates are stored in Chrome's sync storage, which means:
- They sync across your Chrome browsers (if signed in)
- Maximum size: ~8KB (plenty for templates)
- Persists even if you uninstall/reinstall the extension

## Resetting Your Template

To restore the default template:
1. Open extension settings
2. Click "Reset to Default"
3. Click "Save Template"

Default template:
```yaml
- job_id: {job_id}
  job_title: {job_title}
  company_name: {company_name}
  location: {location}
  status: {status}
  posting_link: {posting_link}
  job_description: {job_description}
```

## Tips for Workflow Integration

### Tip 1: Add Tracking Fields

```yaml
- job_id: {job_id}
  job_title: {job_title}
  company_name: {company_name}
  status: {status}
  priority: ""           # high/medium/low
  match_score: ""        # 1-10
  posting_link: {posting_link}
  job_description: {job_description}
```

### Tip 2: Add Contact Information

```yaml
- job_id: {job_id}
  job_title: {job_title}
  company_name: {company_name}
  recruiter_name: ""
  recruiter_email: ""
  recruiter_phone: ""
  job_description: {job_description}
```

### Tip 3: Add Timeline Fields

```yaml
- job_id: {job_id}
  job_title: {job_title}
  company_name: {company_name}
  status: {status}
  timeline:
    found_date: ""
    applied_date: ""
    first_contact: ""
    interview_date: ""
    offer_date: ""
  job_description: {job_description}
```

## Need Help?

If you're having trouble with template customization:
1. Check the preview in settings to see how it will look
2. Validate your YAML syntax
3. Try the default template first
4. Open an issue on GitHub with your template and the error

Happy customizing! 🎨

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

// Format job description with pipe syntax for preview
function formatJobDescriptionPreview(description) {
  const lines = description.split("\n");
  const indentedLines = lines.map((line) => "    " + line);
  return "|\n" + indentedLines.join("\n");
}

// Generate preview with sample data
function generatePreview(template) {
  const sampleData = {
    job_id: "ABC123XYZ0",
    job_title: "Senior Software Engineer",
    company_name: "Tech Company Inc.",
    location: "San Francisco, CA (Remote)",
    status: "pending",
    posting_link: "https://www.linkedin.com/jobs/view/1234567890",
    job_description: formatJobDescriptionPreview(
      "We are seeking a talented Senior Software Engineer to join our team.\n\nResponsibilities:\n- Design and develop scalable applications\n- Collaborate with cross-functional teams\n- Mentor junior developers\n\nRequirements:\n- 5+ years of experience\n- Strong knowledge of JavaScript/TypeScript\n- Experience with React and Node.js"
    ),
  };

  let preview = template
    .replace(/{job_id}/g, sampleData.job_id)
    .replace(/{job_title}/g, sampleData.job_title)
    .replace(/{company_name}/g, sampleData.company_name)
    .replace(/{location}/g, sampleData.location)
    .replace(/{status}/g, sampleData.status)
    .replace(/{posting_link}/g, sampleData.posting_link)
    .replace(/{job_description}/g, sampleData.job_description);

  return preview;
}

// Show notification
function showNotification(message, type = "success") {
  const notification = document.getElementById("notification");
  notification.textContent = message;
  notification.className = `notification ${type} show`;

  setTimeout(() => {
    notification.classList.remove("show");
  }, 3000);
}

// Update preview
function updatePreview() {
  const template = document.getElementById("templateInput").value;
  const preview = generatePreview(template);
  document.getElementById("previewOutput").textContent = preview;
}

// Load saved template
async function loadTemplate() {
  const result = await chrome.storage.sync.get(["customTemplate"]);
  const template = result.customTemplate || getDefaultTemplate();
  document.getElementById("templateInput").value = template;
  updatePreview();
}

// Save template
async function saveTemplate() {
  const template = document.getElementById("templateInput").value;

  if (!template.trim()) {
    showNotification("Template cannot be empty", "error");
    return;
  }

  try {
    await chrome.storage.sync.set({ customTemplate: template });
    showNotification("✓ Template saved successfully!", "success");
    updatePreview();
  } catch (error) {
    console.error("Save error:", error);
    showNotification("Failed to save template", "error");
  }
}

// Reset to default template
async function resetTemplate() {
  if (
    confirm(
      "Are you sure you want to reset to the default template? This will overwrite your current template."
    )
  ) {
    const defaultTemplate = getDefaultTemplate();
    document.getElementById("templateInput").value = defaultTemplate;

    try {
      await chrome.storage.sync.set({ customTemplate: defaultTemplate });
      showNotification("✓ Reset to default template", "info");
      updatePreview();
    } catch (error) {
      console.error("Reset error:", error);
      showNotification("Failed to reset template", "error");
    }
  }
}

// Event listeners
document.getElementById("saveBtn").addEventListener("click", saveTemplate);
document.getElementById("resetBtn").addEventListener("click", resetTemplate);
document
  .getElementById("templateInput")
  .addEventListener("input", updatePreview);

// Initialize on load
document.addEventListener("DOMContentLoaded", loadTemplate);

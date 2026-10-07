function render(data) {
  const container = document.getElementById("content");

  if (!data) {
    container.innerHTML =
      '<div class="empty-state">No accepted submissions yet.</div>';
    return;
  }

  container.innerHTML = `
    <div class="submission-card">
      <div class="submission-header">
        <div class="submission-title">
          <p class="eyebrow">ACCEPTED SUBMISSION</p>
          <p class="submission-id">ID ${data.submission_id}</p>
        </div>
        <span class="difficulty-badge">${data.difficulty ?? "Unknown"}</span>
      </div>

      <div class="metrics">
        <div class="metric">
          <span class="metric-label">Language</span>
          <span class="metric-value">${data.language ?? "N/A"}</span>
        </div>
        <div class="metric">
          <span class="metric-label">Runtime</span>
          <span class="metric-value">${data.runtime ?? "N/A"}</span>
        </div>
        <div class="metric">
          <span class="metric-label">Memory</span>
          <span class="metric-value">${data.memory ?? "N/A"}</span>
        </div>
        <div class="metric">
          <span class="metric-label">Runtime percentile</span>
          <span class="metric-value">${data.runtime_percentile?.toFixed?.(2) ?? "N/A"}${data.runtime_percentile == null ? "" : "%"}</span>
        </div>
        <div class="metric">
          <span class="metric-label">Memory percentile</span>
          <span class="metric-value">${data.memory_percentile?.toFixed?.(2) ?? "N/A"}${data.memory_percentile == null ? "" : "%"}</span>
        </div>
      </div>

      <details class="code-details">
        <summary>View submitted code</summary>
        <pre>${data.code ?? "No code available."}</pre>
      </details>
    </div>
  `;
}

document.addEventListener("DOMContentLoaded", () => {
  const tokenInput = document.getElementById("tokenInput");
  const saveTokenBtn = document.getElementById("saveTokenBtn");
  const tokenStatus = document.getElementById("tokenStatus");

  // ==========================
  // Load Existing Token
  // ==========================
  chrome.storage.local.get(["anamnesisExtensionToken"], (result) => {
    if (result.anamnesisExtensionToken) {
      tokenInput.value = result.anamnesisExtensionToken;
    }
  });

  // ==========================
  // Save Token
  // ==========================
  saveTokenBtn.addEventListener("click", () => {
    const token = tokenInput.value.trim();

    chrome.storage.local.set(
      {
        anamnesisExtensionToken: token,
      },
      () => {
        tokenStatus.textContent = "Token saved successfully.";

        setTimeout(() => {
          tokenStatus.textContent = "";
        }, 2000);
      },
    );
  });

  // ==========================
  // Load Submission
  // ==========================
  chrome.storage.local.get(["latestSubmission"], (result) => {
    render(result.latestSubmission);
  });

  // ==========================
  // Live Updates
  // ==========================
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "local" && changes.latestSubmission) {
      render(changes.latestSubmission.newValue);
    }
  });
});

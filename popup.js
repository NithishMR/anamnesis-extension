function render(data) {
  const container = document.getElementById("content");

  if (!data) {
    container.innerHTML = "No Accepted submission yet.";
    return;
  }

  container.innerHTML = `
    <div class="card">
      <p><strong>Submission ID:</strong> ${data.submission_id}</p>

      <p><strong>Language:</strong> ${data.language}</p>

      <p><strong>Runtime:</strong> ${data.runtime}</p>

      <p><strong>Memory:</strong> ${data.memory}</p>

      <p><strong>Runtime %:</strong>
        ${data.runtime_percentile?.toFixed?.(2) ?? "N/A"}
      </p>

      <p><strong>Memory %:</strong>
        ${data.memory_percentile?.toFixed?.(2) ?? "N/A"}
      </p>

      <hr />

      <strong>Code:</strong>

      <pre style="
        white-space: pre-wrap;
        max-height: 200px;
        overflow: auto;
      ">
${data.code}
      </pre>
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

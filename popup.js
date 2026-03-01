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
      <p><strong>Runtime %:</strong> ${data.runtime_percentile?.toFixed(2)}</p>
      <p><strong>Memory %:</strong> ${data.memory_percentile?.toFixed(2)}</p>
      <hr/>
      <strong>Code:</strong>
      <pre style="white-space: pre-wrap; max-height:200px; overflow:auto;">
${data.code}
      </pre>
    </div>
  `;
}

document.addEventListener("DOMContentLoaded", () => {
  // Initial load
  chrome.storage.local.get("latestSubmission", (result) => {
    render(result.latestSubmission);
  });

  // 🔥 LIVE UPDATE LISTENER
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "local" && changes.latestSubmission) {
      render(changes.latestSubmission.newValue);
    }
  });
});

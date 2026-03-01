document.addEventListener("DOMContentLoaded", () => {
  chrome.storage.local.get("latestSubmission", (result) => {
    const container = document.getElementById("content");

    if (!result.latestSubmission) {
      container.innerHTML = "No Accepted submission yet.";
      return;
    }

    const data = result.latestSubmission;

    container.innerHTML = `
      <div class="card">
       
        <p><strong>Submission ID:</strong> ${data.submission_id}</p>
        <p><strong>Question ID:</strong> ${data.question_id}</p>
        <p><strong>Total Correct:</strong> ${data.total_correct}</p>
        <p><strong>Language:</strong> ${data.language}</p>
        <p><strong>Runtime:</strong> ${data.runtime}</p>
        <p><strong>Memory:</strong> ${data.memory}</p>
        <p><strong>Testcases:</strong> ${data.total_testcases}</p>
        <p><strong>Runtime %:</strong> ${data.runtime_percentile?.toFixed(2)}</p>
        <p><strong>Memory %:</strong> ${data.memory_percentile?.toFixed(2)}</p>
        <hr/>
        <strong>Code:</strong>
        <pre style="white-space: pre-wrap; max-height:200px; overflow:auto;">
${data.code}
        </pre>
      </div>
    `;
  });
});

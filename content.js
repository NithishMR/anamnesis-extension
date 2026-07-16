// ==============================
// Content Script
// ==============================

console.log("=== CONTENT SCRIPT LOADED ===");

// ==============================
// Inject inject.js into page
// ==============================
const script = document.createElement("script");
script.src = chrome.runtime.getURL("inject.js");

script.onload = function () {
  this.remove();
};

(document.head || document.documentElement).appendChild(script);

// ==============================
// Listen for successful submission
// ==============================
window.addEventListener("message", (event) => {
  if (event.source !== window) return;

  if (event.data.type !== "LEETCODE_SUBMISSION_SUCCESS") return;

  const submission = event.data.payload;

  console.log("Received submission:", submission);

  // Save latest submission for popup
  chrome.storage.local.set({
    latestSubmission: submission,
  });

  // Ask background.js to send it to Anamnesis
  chrome.runtime.sendMessage(
    {
      type: "SEND_TO_ANAMNESIS",
      payload: submission,
    },
    (response) => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError.message);
        return;
      }

      if (!response) {
        console.error("No response from background.");
        return;
      }

      if (response.success) {
        console.log("Successfully sent to Anamnesis.", response);
      } else {
        console.error("Failed to send to Anamnesis.", response);
      }
    },
  );
});

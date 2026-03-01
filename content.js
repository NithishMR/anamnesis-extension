// content.js
console.log("Content script loaded");
console.log("chrome object:", chrome);
// Inject script into page context
const script = document.createElement("script");
script.src = chrome.runtime.getURL("inject.js");
script.onload = function () {
  this.remove();
};
(document.head || document.documentElement).appendChild(script);

// Listen for success message
window.addEventListener("message", (event) => {
  if (event.source !== window) return;

  if (event.data.type === "LEETCODE_SUBMISSION_SUCCESS") {
    console.log("Saving to storage:", event.data.payload);

    chrome.storage.local.set({
      latestSubmission: event.data.payload,
    });
  }
});

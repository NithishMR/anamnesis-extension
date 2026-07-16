const API_URL = "http://localhost:3000/api/extension/add-problem";
console.log("Background service worker started");
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type !== "SEND_TO_ANAMNESIS") {
    return;
  }

  (async () => {
    try {
      const { anamnesisExtensionToken } = await chrome.storage.local.get(
        "anamnesisExtensionToken",
      );

      if (!anamnesisExtensionToken) {
        sendResponse({
          success: false,
          error: "No extension token found.",
        });
        return;
      }

      const payload = {
        requestId: crypto.randomUUID(),
        ...message.payload,
      };

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${anamnesisExtensionToken}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      sendResponse(data);
    } catch (err) {
      console.error(err);

      sendResponse({
        success: false,
        error: err.message,
      });
    }
  })();

  return true;
});

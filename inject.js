(function () {
  // ===============================
  // 🛑 Prevent Multiple Injection
  // ===============================
  if (window.__LEETCODE_EXTENSION_HOOKED__) {
    return;
  }
  window.__LEETCODE_EXTENSION_HOOKED__ = true;

  console.log("Inject script loaded");

  const originalFetch = window.fetch;
  const alreadyProcessed = new Set();

  // ===============================
  // 🧠 Extract Code From Monaco Editor
  // ===============================
  function getCodeFromEditor() {
    try {
      if (window.monaco && window.monaco.editor) {
        const models = window.monaco.editor.getModels();
        if (models.length > 0) {
          return models[0].getValue();
        }
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  // ===============================
  // 🚀 Intercept Fetch
  // ===============================
  window.fetch = async function (...args) {
    const response = await originalFetch.apply(this, args);
    const url = args[0];
    const clone = response.clone();

    try {
      if (typeof url === "string" && url.includes("/check/")) {
        const data = await clone.json();
        console.log("Check response:", data);

        if (
          data.state === "SUCCESS" &&
          data.status_msg === "Accepted" &&
          !alreadyProcessed.has(data.submission_id)
        ) {
          alreadyProcessed.add(data.submission_id);

          const code = getCodeFromEditor();

          const usefulData = {
            code: code,
            submission_id: data.submission_id,
            question_id: data.question_id,
            language: data.pretty_lang,
            runtime: data.status_runtime,
            runtime_percentile: data.runtime_percentile,
            memory: data.status_memory,
            memory_percentile: data.memory_percentile,
            total_testcases: data.total_testcases,
            total_correct: data.total_correct,
            timestamp: data.task_finish_time,
          };

          console.log("FINAL DATA:", usefulData);

          window.postMessage(
            {
              type: "LEETCODE_SUBMISSION_SUCCESS",
              payload: usefulData,
            },
            "*",
          );
        }
      }
    } catch (err) {
      console.error("Intercept error:", err);
    }

    return response;
  };
})();

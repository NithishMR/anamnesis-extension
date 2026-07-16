(function () {
  // ===============================
  //  Prevent Multiple Injection
  // ===============================
  if (window.__LEETCODE_EXTENSION_HOOKED__) {
    return;
  }

  window.__LEETCODE_EXTENSION_HOOKED__ = true;

  console.log("Inject script loaded");

  const originalFetch = window.fetch;
  const alreadyProcessed = new Set();

  // ===============================
  // Extract Code From Monaco
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
    } catch {
      return null;
    }
  }

  // ===============================
  //  Success Panel
  // ===============================
  function showSuccessPanel(data) {
    const existing = document.getElementById("__anamnesis_panel__");

    if (existing) existing.remove();

    const panel = document.createElement("div");
    panel.id = "__anamnesis_panel__";

    panel.innerHTML = `
      <div style="
        position: fixed;
        top:20px;
        right:20px;
        width:320px;
        background:#111827;
        color:white;
        padding:18px;
        border-radius:14px;
        box-shadow:0 12px 30px rgba(0,0,0,.4);
        z-index:999999;
        font-family:system-ui,sans-serif;
      ">

        <h3 style="margin:0 0 10px;color:#22c55e;">
          Accepted 
        </h3>

        <p>Runtime: ${data.runtime}</p>
        <p>Memory: ${data.memory}</p>
        <p>Language: ${data.language}</p>

        <hr style="margin:12px 0;border:.5px solid #374151"/>

        <p>Send to Anamnesis?</p>

        <div style="display:flex;gap:10px;margin-top:12px;">
          <button
            id="__anamnesis_yes__"
            style="
              flex:1;
              padding:8px;
              background:#22c55e;
              border:none;
              border-radius:8px;
              cursor:pointer;
              font-weight:600;
            "
          >
            Yes
          </button>

          <button
            id="__anamnesis_no__"
            style="
              flex:1;
              padding:8px;
              background:#374151;
              color:white;
              border:none;
              border-radius:8px;
              cursor:pointer;
            "
          >
            No
          </button>
        </div>

      </div>
    `;

    document.body.appendChild(panel);

    // ===============================
    // YES
    // ===============================
    document
      .getElementById("__anamnesis_yes__")
      .addEventListener("click", () => {
        window.postMessage(
          {
            type: "LEETCODE_SUBMISSION_SUCCESS",
            payload: data,
          },
          "*",
        );

        panel.remove();
      });

    // ===============================
    // NO
    // ===============================
    document
      .getElementById("__anamnesis_no__")
      .addEventListener("click", () => {
        panel.remove();
      });
  }

  // ===============================
  //  Intercept Fetch
  // ===============================
  window.fetch = async function (...args) {
    const response = await originalFetch.apply(this, args);

    const url = args[0];
    const clone = response.clone();

    try {
      if (typeof url === "string" && url.includes("/check/")) {
        const data = await clone.json();

        if (
          data.state === "SUCCESS" &&
          data.status_msg === "Accepted" &&
          !alreadyProcessed.has(data.submission_id)
        ) {
          alreadyProcessed.add(data.submission_id);

          const usefulData = {
            code: getCodeFromEditor(),
            problemUrl: window.location.href,
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

          console.log("Accepted submission:", usefulData);

          showSuccessPanel(usefulData);
        }
      }
    } catch (err) {
      console.error("Intercept error:", err);
    }

    return response;
  };
})();

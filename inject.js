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
  function showSuccessPanel(data) {
    const existing = document.getElementById("__anamnesis_panel__");
    if (existing) existing.remove();

    const panel = document.createElement("div");
    panel.id = "__anamnesis_panel__";

    panel.innerHTML = `
    <div style="
      position: fixed;
      top: 20px;
      right: 20px;
      background: #111827;
      color: white;
      padding: 18px;
      border-radius: 14px;
      box-shadow: 0 12px 30px rgba(0,0,0,0.4);
      z-index: 999999;
      width: 320px;
      font-family: system-ui, sans-serif;
      animation: slideIn 0.25s ease-out;
    ">
      <h3 style="margin:0 0 10px 0; color:#22c55e;">
        Accepted ✅
      </h3>

      <p style="margin:4px 0;">Runtime: ${data.runtime}</p>
      <p style="margin:4px 0;">Memory: ${data.memory}</p>
      <p style="margin:4px 0;">Language: ${data.language}</p>

      <hr style="border: 0.5px solid #374151; margin:12px 0;" />

      <p style="margin:6px 0;">Send to Anamnesis?</p>

      <div style="display:flex; gap:10px; margin-top:10px;">
        <button id="__anamnesis_yes__" style="
          flex:1;
          padding:8px;
          background:#22c55e;
          border:none;
          border-radius:8px;
          cursor:pointer;
          font-weight:600;
        ">
          Yes
        </button>

        <button id="__anamnesis_no__" style="
          flex:1;
          padding:8px;
          background:#374151;
          color:white;
          border:none;
          border-radius:8px;
          cursor:pointer;
        ">
          No
        </button>
      </div>
    </div>

    <style>
      @keyframes slideIn {
        from { transform: translateY(-10px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
    </style>
  `;

    document.body.appendChild(panel);

    // YES button
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

    // NO button
    document
      .getElementById("__anamnesis_no__")
      .addEventListener("click", () => {
        panel.remove();
      });
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
          showSuccessPanel(usefulData);
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

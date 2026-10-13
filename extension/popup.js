const FIELDS = ["apiBase", "name", "email", "phone", "city", "linkedin", "github", "portfolio"];

const DEFAULTS = {
  apiBase: "http://localhost:8001",
  name: "",
  email: "",
  phone: "",
  city: "",
  linkedin: "",
  github: "",
  portfolio: "",
};

function setStatus(text, kind) {
  const el = document.getElementById("status");
  el.textContent = text;
  el.className = kind || "";
}

async function load() {
  const stored = await chrome.storage.local.get(DEFAULTS);
  for (const field of FIELDS) {
    document.getElementById(field).value = stored[field] || "";
  }
}

async function save() {
  const values = {};
  for (const field of FIELDS) {
    values[field] = document.getElementById(field).value.trim();
  }
  values.apiBase = values.apiBase || DEFAULTS.apiBase;
  await chrome.storage.local.set(values);
  setStatus("Saved. Reload the application tab to use the new details.", "ok");
}

function checkConnection() {
  setStatus("Checking connection…", "");
  chrome.runtime.sendMessage({ type: "dm:status" }, (response) => {
    if (chrome.runtime.lastError) {
      setStatus(chrome.runtime.lastError.message, "err");
      return;
    }
    if (!response || !response.ok) {
      setStatus((response && response.error) || "Unexpected error.", "err");
      return;
    }
    if (!response.connected) {
      setStatus(`API unreachable: ${response.error}`, "err");
      return;
    }
    if (response.hasResume) {
      setStatus(`Connected — resume loaded with ${response.skills} skills.`, "ok");
    } else {
      setStatus("Connected, but no resume is uploaded on the dashboard yet.", "err");
    }
  });
}

document.getElementById("save").addEventListener("click", save);
document.getElementById("test").addEventListener("click", checkConnection);

load().then(checkConnection);

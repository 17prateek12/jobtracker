// content/selector.js

// Helper to safely verify if the extension context is still active/valid
function isContextValid() {
  try {
    return !!(typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.id);
  } catch (e) {
    return false;
  }
}

// ─── Token Sync ───────────────────────────────────────────────────

let lastSync = 0;

function syncDashboardToken() {
  // If the extension context is invalidated, remove listeners and exit
  if (!isContextValid()) {
    window.removeEventListener("focus", syncDashboardToken);
    window.removeEventListener("click", syncDashboardToken);
    return;
  }

  const now = Date.now();
  if (now - lastSync < 5000) return;
  lastSync = now;

  const isDashboardApp =
    window.location.origin === "http://localhost:5173" ||
    document.title.includes("Job CRM") ||
    document.querySelector('meta[name="application-name"]')
      ?.getAttribute("content") === "Job Tracker";

  if (!isDashboardApp) return;

  const token = localStorage.getItem("token");
  const userStr = localStorage.getItem("user");

  try {
    chrome.storage.local.get(["token", "user"], (stored) => {
      if (!isContextValid()) return;
      if (token) {
        if (stored && stored.token !== token) {
          let userObj = null;
          try {
            if (userStr) userObj = JSON.parse(userStr);
          } catch (e) {
            console.error("[Job Tracker] Failed to parse user:", e);
          }
          chrome.storage.local.set({ token, user: userObj });
        }
      } else if (stored && stored.token) {
        chrome.storage.local.remove(["token", "user"]);
      }
    });
  } catch (e) {
    console.warn("[Job Tracker] Token sync failed due to invalidated context:", e.message);
  }
}

syncDashboardToken();
window.addEventListener("focus", syncDashboardToken);
window.addEventListener("click", syncDashboardToken);

// ─── Selection Mode ───────────────────────────────────────────────

let activeField = null;

async function handleMouseUp() {
  if (!isContextValid()) {
    document.removeEventListener("mouseup", handleMouseUp);
    return;
  }

  const selectedText = window.getSelection().toString().trim();
  if (!selectedText) return;

  try {
    await chrome.storage.local.set({ [activeField]: selectedText });
    showToast(`✓ ${activeField} captured`);
  } catch (e) {
    console.warn("[Job Tracker] Failed to save selection, context invalidated:", e.message);
  }
  stopSelectionMode();
}

function stopSelectionMode() {
  document.removeEventListener("mouseup", handleMouseUp);
  activeField = null;
}

// ─── Message Listener ─────────────────────────────────────────────

try {
  if (isContextValid()) {
    chrome.runtime.onMessage.addListener((message) => {
      if (!isContextValid()) return;
      if (message.type === "START_SELECTION") {
        activeField = message.field;
        showToast(`Select "${activeField}" text on the page`);
        document.addEventListener("mouseup", handleMouseUp);
      }
    });
  }
} catch (e) {
  console.warn("[Job Tracker] Failed to attach message listener:", e.message);
}

// ─── Toast ────────────────────────────────────────────────────────

function showToast(message) {
  const existing = document.getElementById("jt-toast");
  if (existing) existing.remove();

  const toast = document.createElement("div");
  toast.id = "jt-toast";
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    bottom: 24px;
    right: 24px;
    background: #1a1a2e;
    color: #fff;
    padding: 10px 16px;
    border-radius: 8px;
    font-size: 13px;
    font-family: sans-serif;
    z-index: 2147483647;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    opacity: 1;
    transition: opacity 0.3s ease;
  `;

  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}
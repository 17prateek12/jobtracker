// popup.js
import { captureJob, getEnums, getCurrentUser } from "../service/api.js";
import {
    JOB_ROLES,
    JOB_LEVELS,
    OPPORTUNITY_SOURCES,
    OPPORTUNITY_STATUS,
} from "./constants.js";

// DOM Elements
const authView = document.getElementById("authView");
const captureView = document.getElementById("captureView");
const loginDashboardBtn = document.getElementById("loginDashboardBtn");
const toggleManualBtn = document.getElementById("toggleManualBtn");
const manualTokenInputContainer = document.getElementById("manualTokenInputContainer");
const tokenInput = document.getElementById("tokenInput");
const saveTokenBtn = document.getElementById("saveTokenBtn");

const disconnectBtn = document.getElementById("disconnectBtn");
const userEmailText = document.getElementById("userEmailText");

const companyInput = document.getElementById("companyInput");
const selectCompanyBtn = document.getElementById("selectCompanyBtn");
const roleSelect = document.getElementById("roleSelect");
const jobLevelSelect = document.getElementById("jobLevelSelect");
const sourceSelect = document.getElementById("sourceSelect");
const statusSelect = document.getElementById("statusSelect");
const urlInput = document.getElementById("urlInput");
const captureUrlBtn = document.getElementById("captureUrlBtn");

const clearBtn = document.getElementById("clearBtn");
const saveJobBtn = document.getElementById("saveJobBtn");
const viewCompaniesBtn = document.getElementById("viewCompaniesBtn");

let isEnumsLoaded = false;

// 1. Manage Views
function showView(view) {
    if (view === "auth") {
        authView.classList.remove("hidden");
        captureView.classList.add("hidden");
    } else {
        authView.classList.add("hidden");
        captureView.classList.remove("hidden");
    }
}

// 2. Populate Dropdowns
function populateSelect(selectEl, values, defaultLabel) {
    selectEl.innerHTML = `<option value="">${defaultLabel}</option>`;
    values.forEach(val => {
        const option = document.createElement("option");
        option.value = val;
        option.textContent = val.replace(/_/g, " ");
        selectEl.appendChild(option);
    });
}

function initStaticDropdowns() {
    populateSelect(roleSelect, JOB_ROLES, "Select Role");
    populateSelect(jobLevelSelect, JOB_LEVELS, "Select Level");
    populateSelect(sourceSelect, OPPORTUNITY_SOURCES, "Select Source");
    populateSelect(statusSelect, OPPORTUNITY_STATUS, "Select Status");
}

// 3. Load stored form inputs
async function loadFormState() {
    const data = await chrome.storage.local.get([
        "company",
        "jobRole",
        "jobLevel",
        "source",
        "status",
        "jobUrl"
    ]);
    
    companyInput.value = data.company || "";
    urlInput.value = data.jobUrl || "";
    
    if (data.jobRole) roleSelect.value = data.jobRole;
    if (data.jobLevel) jobLevelSelect.value = data.jobLevel;
    if (data.source) sourceSelect.value = data.source;
    if (data.status) statusSelect.value = data.status;
}

// 4. Validate session and initialize Capture View
async function checkAuthAndLoad() {
    const data = await chrome.storage.local.get(["token", "user"]);
    if (!data.token) {
        showView("auth");
        return;
    }

    try {
        // Validate token with backend
        const meRes = await getCurrentUser();
        if (meRes && meRes.success && meRes.data) {
            // Update email UI
            userEmailText.textContent = meRes.data.email || data.user?.email || "Connected";
            showView("capture");
            
            // Fetch latest enums
            if (!isEnumsLoaded) {
                try {
                    const enumsRes = await getEnums();
                    if (enumsRes && enumsRes.success && enumsRes.data) {
                        populateSelect(roleSelect, enumsRes.data.jobRoles, "Select Role");
                        populateSelect(jobLevelSelect, enumsRes.data.jobLevels, "Select Level");
                        populateSelect(sourceSelect, enumsRes.data.opportunitySources, "Select Source");
                        populateSelect(statusSelect, enumsRes.data.opportunityStatuses, "Select Status");
                        isEnumsLoaded = true;
                    } else {
                        initStaticDropdowns();
                    }
                } catch (enumErr) {
                    console.warn("Failed to fetch dynamic metadata, falling back to static constants:", enumErr);
                    initStaticDropdowns();
                }
            }
            
            await loadFormState();
            
            // Automatically capture current tab URL if empty
            if (!urlInput.value) {
                const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
                if (tab && tab.url && tab.url.startsWith("http")) {
                    urlInput.value = tab.url;
                    await chrome.storage.local.set({ jobUrl: tab.url });
                }
            }
        } else {
            // Token is invalid/expired
            console.error("Invalid token response:", meRes);
            await chrome.storage.local.remove(["token", "user"]);
            showView("auth");
        }
    } catch (err) {
        console.error("Auth check failed:", err);
        // If it's a network error/offline, check if we have a stored user object to allow offline viewing
        if (data.user) {
            userEmailText.textContent = `${data.user.email} (Offline)`;
            showView("capture");
            if (!isEnumsLoaded) initStaticDropdowns();
            await loadFormState();
        } else {
            showView("auth");
        }
    }
}

// 5. Auth Action Listeners
loginDashboardBtn.addEventListener("click", () => {
    chrome.tabs.create({ url: "http://localhost:5173" });
});

toggleManualBtn.addEventListener("click", () => {
    manualTokenInputContainer.classList.toggle("hidden");
});

saveTokenBtn.addEventListener("click", async () => {
    const rawToken = tokenInput.value.trim();
    if (!rawToken) {
        alert("Please enter a valid token.");
        return;
    }

    saveTokenBtn.disabled = true;
    saveTokenBtn.textContent = "Verifying...";

    try {
        // Temporarily store token to verify
        await chrome.storage.local.set({ token: rawToken });
        
        const res = await getCurrentUser();
        if (res && res.success && res.data) {
            await chrome.storage.local.set({ 
                token: rawToken, 
                user: res.data 
            });
            tokenInput.value = "";
            manualTokenInputContainer.classList.add("hidden");
            isEnumsLoaded = false; // Trigger reload of enums for new user
            await checkAuthAndLoad();
        } else {
            alert("Verification failed. The token might be invalid or expired.");
            await chrome.storage.local.remove(["token", "user"]);
        }
    } catch (err) {
        console.error(err);
        alert("Connection error. Ensure the backend server is running.");
        await chrome.storage.local.remove(["token", "user"]);
    } finally {
        saveTokenBtn.disabled = false;
        saveTokenBtn.textContent = "Save Token";
    }
});

disconnectBtn.addEventListener("click", async () => {
    if (confirm("Are you sure you want to disconnect?")) {
        await chrome.storage.local.remove(["token", "user"]);
        showView("auth");
    }
});

// 6. Capture Form Listeners & Field Auto-save
companyInput.addEventListener("input", async () => {
    await chrome.storage.local.set({ company: companyInput.value });
});

urlInput.addEventListener("input", async () => {
    await chrome.storage.local.set({ jobUrl: urlInput.value });
});

roleSelect.addEventListener("change", async () => {
    await chrome.storage.local.set({ jobRole: roleSelect.value });
});

jobLevelSelect.addEventListener("change", async () => {
    await chrome.storage.local.set({ jobLevel: jobLevelSelect.value });
});

sourceSelect.addEventListener("change", async () => {
    await chrome.storage.local.set({ source: sourceSelect.value });
});

statusSelect.addEventListener("change", async () => {
    await chrome.storage.local.set({ status: statusSelect.value });
});

captureUrlBtn.addEventListener("click", async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && tab.url) {
        urlInput.value = tab.url;
        await chrome.storage.local.set({ jobUrl: tab.url });
    }
});

selectCompanyBtn.addEventListener("click", async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab) return;
    try {
        await chrome.tabs.sendMessage(tab.id, {
            type: "START_SELECTION",
            field: "company",
        });
    } catch (err) {
        console.error("Failed to communicate with content script:", err);
        alert("Please refresh the active webpage to enable text selection.");
    }
});

clearBtn.addEventListener("click", async () => {
    await chrome.storage.local.remove([
        "company",
        "jobRole",
        "jobLevel",
        "source",
        "status",
        "jobUrl"
    ]);
    companyInput.value = "";
    urlInput.value = "";
    roleSelect.value = "";
    jobLevelSelect.value = "";
    sourceSelect.value = "";
    statusSelect.value = "";
});

saveJobBtn.addEventListener("click", async () => {
    const payload = {
        companyName: companyInput.value.trim(),
        jobName: roleSelect.value,
        jobLevel: jobLevelSelect.value,
        opportunityStatus: statusSelect.value,
        source: sourceSelect.value,
        jobUrl: urlInput.value.trim(),
    };

    if (!payload.companyName) {
        alert("Company Name is required.");
        return;
    }
    if (!payload.jobName) {
        alert("Job Role is required.");
        return;
    }
    if (!payload.jobLevel) {
        alert("Job Level is required.");
        return;
    }
    if (!payload.opportunityStatus) {
        alert("Status is required.");
        return;
    }
    if (!payload.source) {
        alert("Source is required.");
        return;
    }

    saveJobBtn.disabled = true;
    saveJobBtn.textContent = "Saving...";

    try {
        const res = await captureJob(payload);
        if (res && res.success) {
            alert("Opportunity successfully captured!");
            
            // Clear fields after successful capture
            await chrome.storage.local.remove([
                "company",
                "jobRole",
                "jobLevel",
                "source",
                "status",
                "jobUrl"
            ]);
            companyInput.value = "";
            urlInput.value = "";
            roleSelect.value = "";
            jobLevelSelect.value = "";
            sourceSelect.value = "";
            statusSelect.value = "";
        } else {
            alert("Failed to capture: " + (res?.message || "Unknown error"));
        }
    } catch (err) {
        console.error("Capture request error:", err);
        alert("An error occurred while saving the job opportunity.");
    } finally {
        saveJobBtn.disabled = false;
        saveJobBtn.textContent = "Save Job";
    }
});

viewCompaniesBtn.addEventListener("click", () => {
    chrome.tabs.create({
        url: chrome.runtime.getURL("pages/companies.html")
    });
});

// Listen to storage changes to support automatic login sync while popup is open
chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === "local" && (changes.token || changes.user)) {
        checkAuthAndLoad();
    }
    // Also update forms dynamically if content script captured selection text
    if (namespace === "local") {
        if (changes.company) companyInput.value = changes.company.newValue || "";
        if (changes.jobUrl) urlInput.value = changes.jobUrl.newValue || "";
    }
});

// Initial Startup
document.addEventListener("DOMContentLoaded", () => {
    initStaticDropdowns();
    checkAuthAndLoad();
});
window.addEventListener("focus", checkAuthAndLoad);
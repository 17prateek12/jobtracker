import { 
    getOpportunity,
    getOutreaches,
    createOutreach,
    getFollowups,
    createFollowup
} from "../service/api.js";

// Parameters
const params = new URLSearchParams(location.search);
const jobId = params.get("jobId");
const companyId = params.get("companyId");

// DOM Elements
const backBtn = document.getElementById("backBtn");
const openDashboardBtn = document.getElementById("openDashboardBtn");
const jobRoleText = document.getElementById("jobRoleText");
const companyBadge = document.getElementById("companyBadge");
const levelBadge = document.getElementById("levelBadge");
const statusBadge = document.getElementById("statusBadge");
const sourceBadge = document.getElementById("sourceBadge");
const jobUrlLink = document.getElementById("jobUrlLink");

const toggleOutreachFormBtn = document.getElementById("toggleOutreachFormBtn");
const outreachForm = document.getElementById("outreachForm");
const cancelOutreachBtn = document.getElementById("cancelOutreachBtn");
const outreachList = document.getElementById("outreachList");

// Back button navigation
backBtn.addEventListener("click", () => {
    if (companyId) {
        window.location.href = `jobs.html?companyId=${companyId}`;
    } else {
        window.location.href = "companies.html";
    }
});

// Open opportunity details in full web dashboard
openDashboardBtn.addEventListener("click", () => {
    chrome.tabs.create({
        url: `http://localhost:5173/opportunities/${jobId}`
    });
});

// Toggle Outreach Form
toggleOutreachFormBtn.addEventListener("click", () => {
    outreachForm.classList.toggle("hidden");
    toggleOutreachFormBtn.textContent = outreachForm.classList.contains("hidden") ? "+ Log Outreach" : "Hide Form";
});

cancelOutreachBtn.addEventListener("click", () => {
    outreachForm.reset();
    outreachForm.classList.add("hidden");
    toggleOutreachFormBtn.textContent = "+ Log Outreach";
});

// Load Job Opportunity & Communication Details
async function load() {
    if (!jobId) {
        jobRoleText.textContent = "Error: Invalid Job Reference";
        return;
    }

    try {
        // 1. Fetch Opportunity Details
        const jobRes = await getOpportunity(jobId);
        if (jobRes && jobRes.success && jobRes.data) {
            const job = jobRes.data;
            jobRoleText.textContent = job.jobRole.replace(/_/g, " ");
            
            companyBadge.textContent = job.company?.name || "Company";
            levelBadge.textContent = job.jobLevel.replace(/_/g, " ");
            statusBadge.textContent = job.status;
            sourceBadge.textContent = job.source.replace(/_/g, " ");
            
            // Status badges
            statusBadge.className = `badge badge-${job.status.toLowerCase()}`;
            
            if (job.jobUrl) {
                jobUrlLink.href = job.jobUrl;
                jobUrlLink.style.display = "inline";
            } else {
                jobUrlLink.style.display = "none";
            }
        }

        // 2. Fetch Outreach Logs
        await loadOutreachLogs();

    } catch (err) {
        console.error("Error loading job details:", err);
    }
}

// Fetch and render outreach cards with followups
async function loadOutreachLogs() {
    outreachList.innerHTML = "Loading communication history...";
    
    try {
        const outreachRes = await getOutreaches(jobId);
        if (outreachRes && outreachRes.success && outreachRes.data && outreachRes.data.length > 0) {
            outreachList.innerHTML = "";
            
            for (const log of outreachRes.data) {
                const card = document.createElement("div");
                card.className = "outreach-card";
                
                const typeText = log.type.replace(/_/g, " ");
                const roleText = log.contactRole ? ` (${log.contactRole})` : "";
                const nameText = log.contactName ? `${log.contactName}${roleText}` : "Unnamed Contact";
                
                // Construct card headers
                let contactInfoHtml = `
                    <div class="outreach-header">
                        <div>
                            <span class="outreach-contact">${nameText}</span>
                            <span class="outreach-type">${typeText}</span>
                        </div>
                        <span class="badge badge-saved">${log.status}</span>
                    </div>
                `;

                // Add message/notes if present
                let notesHtml = "";
                if (log.notes || log.message) {
                    notesHtml = `<div class="outreach-notes">${log.notes || log.message}</div>`;
                }

                // Add contact channels (Email/LinkedIn)
                let channelsHtml = '<div style="margin-top: 8px; font-size: 12px; display: flex; gap: 12px;">';
                if (log.email) {
                    channelsHtml += `<span>✉️ <a href="mailto:${log.email}" class="detail-link">${log.email}</a></span>`;
                }
                if (log.linkedinUrl) {
                    channelsHtml += `<span>🔗 <a href="${log.linkedinUrl}" target="_blank" class="detail-link">LinkedIn</a></span>`;
                }
                channelsHtml += '</div>';

                // Setup container for followups timeline
                const timelineContainerId = `timeline-${log._id}`;
                const timelineHtml = `
                    <div class="followup-section" style="margin-top: 16px; border-top: 1px solid var(--border); padding-top: 12px;">
                        <h4 style="margin: 0 0 10px 0; font-size: 13px; color: var(--text-muted);">Follow-up Timeline</h4>
                        <div id="${timelineContainerId}" class="followup-timeline">
                            Loading timeline...
                        </div>
                        
                        <!-- Quick Add Follow-up Form -->
                        <div style="margin-top: 12px; display: flex; gap: 8px;">
                            <input id="input-${log._id}" type="text" placeholder="Log a quick follow-up note..." style="height: 32px; font-size: 12px;" />
                            <button id="btn-${log._id}" class="btn btn-primary" style="padding: 0 12px; height: 32px; font-size: 12px; width: auto;">Add</button>
                        </div>
                    </div>
                `;

                card.innerHTML = contactInfoHtml + notesHtml + channelsHtml + timelineHtml;
                outreachList.appendChild(card);

                // Fetch follow-ups for this outreach asynchronously
                loadFollowupsForOutreach(log._id, timelineContainerId);

                // Wire up quick add follow-up button
                const sendBtn = card.querySelector(`#btn-${log._id}`);
                const textInput = card.querySelector(`#input-${log._id}`);
                
                sendBtn.addEventListener("click", async () => {
                    const msg = textInput.value.trim();
                    if (!msg) return;

                    sendBtn.disabled = true;
                    sendBtn.textContent = "...";
                    
                    try {
                        const res = await createFollowup({
                            outreachId: log._id,
                            message: msg,
                            notes: ""
                        });
                        if (res && res.success) {
                            textInput.value = "";
                            await loadFollowupsForOutreach(log._id, timelineContainerId);
                        } else {
                            alert("Failed to save follow-up.");
                        }
                    } catch (err) {
                        console.error("Error creating follow-up:", err);
                    } finally {
                        sendBtn.disabled = false;
                        sendBtn.textContent = "Add";
                    }
                });
            }
        } else {
            outreachList.innerHTML = `<div class="empty-state">No recruiting logs recorded for this opportunity yet.</div>`;
        }
    } catch (err) {
        console.error("Error loading outreaches:", err);
        outreachList.innerHTML = `<div class="empty-state">Failed to load communication history.</div>`;
    }
}

// Fetch and render followups under a specific outreach card
async function loadFollowupsForOutreach(outreachId, containerId) {
    const timelineEl = document.getElementById(containerId);
    if (!timelineEl) return;

    try {
        const res = await getFollowups(outreachId);
        if (res && res.success && res.data && res.data.length > 0) {
            timelineEl.innerHTML = "";
            res.data.forEach(item => {
                const itemEl = document.createElement("div");
                itemEl.className = "followup-item";
                
                const dateText = item.sentAt ? new Date(item.sentAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                }) : "Just now";

                itemEl.innerHTML = `
                    <div class="followup-date">${dateText}</div>
                    <div>${item.message}</div>
                `;
                timelineEl.appendChild(itemEl);
            });
        } else {
            timelineEl.innerHTML = `<div style="font-size: 12px; color: var(--text-muted);">No follow-ups logged yet.</div>`;
        }
    } catch (err) {
        console.error("Error fetching follow-ups:", err);
        timelineEl.innerHTML = `<div style="font-size: 12px; color: var(--danger);">Error loading timeline.</div>`;
    }
}

// Log Outreach Form Submit Handler
outreachForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const payload = {
        opportunityId: jobId,
        type: document.getElementById("outreachTypeSelect").value,
        status: document.getElementById("outreachStatusSelect").value,
        contactName: document.getElementById("contactNameInput").value.trim() || undefined,
        contactRole: document.getElementById("contactRoleSelect").value || undefined,
        email: document.getElementById("contactEmailInput").value.trim() || undefined,
        linkedinUrl: document.getElementById("contactLinkedinInput").value.trim() || undefined,
        notes: document.getElementById("outreachNotesText").value.trim() || undefined
    };

    const submitBtn = outreachForm.querySelector("button[type='submit']");
    submitBtn.disabled = true;
    submitBtn.textContent = "Saving...";

    try {
        const res = await createOutreach(payload);
        if (res && res.success) {
            outreachForm.reset();
            outreachForm.classList.add("hidden");
            toggleOutreachFormBtn.textContent = "+ Log Outreach";
            await loadOutreachLogs();
        } else {
            alert("Failed to log outreach: " + (res?.message || "Unknown error"));
        }
    } catch (err) {
        console.error("Error saving outreach:", err);
        alert("An error occurred while saving outreach details.");
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = "Save Outreach";
    }
});

// Startup
load();
import { getCompanyJobs } from "../service/api.js";

const jobsEl = document.getElementById("jobs");
const pageTitle = document.getElementById("pageTitle");
const searchInput = document.getElementById("searchInput");
const backBtn = document.getElementById("backBtn");

const params = new URLSearchParams(location.search);
const companyId = params.get("companyId");

let allJobs = [];

async function load() {
    if (!companyId) {
        jobsEl.innerHTML = `<li class="empty-state">Invalid Company Reference.</li>`;
        return;
    }

    try {
        const result = await getCompanyJobs(companyId);
        if (result && result.success && result.data) {
            allJobs = result.data.jobs || [];
            const companyName = result.data.company?.name || "Company";
            pageTitle.textContent = `Jobs at ${companyName}`;
            renderJobs(allJobs);
        } else {
            jobsEl.innerHTML = `<li class="empty-state">No jobs found for this company.</li>`;
        }
    } catch (err) {
        console.error("Error loading jobs:", err);
        jobsEl.innerHTML = `<li class="empty-state">Failed to load opportunities.</li>`;
    }
}

function renderJobs(jobs) {
    jobsEl.innerHTML = "";
    if (jobs.length === 0) {
        jobsEl.innerHTML = `<li class="empty-state">No matching opportunities.</li>`;
        return;
    }

    jobs.forEach(job => {
        const li = document.createElement("li");
        li.className = "card-item";
        
        // Status class helper
        const statusClass = `badge-${(job.status || "SAVED").toLowerCase()}`;

        li.innerHTML = `
            <div>
                <h3 class="card-title">${job.jobRole.replace(/_/g, " ")}</h3>
                <p class="card-subtitle">${job.jobLevel.replace(/_/g, " ")}</p>
            </div>
            <span class="badge ${statusClass}">${job.status}</span>
        `;

        li.onclick = () => {
            window.location.href = `job-detail.html?jobId=${job._id}&companyId=${companyId}`;
        };

        jobsEl.appendChild(li);
    });
}

// Search filtering listener
searchInput.addEventListener("input", (e) => {
    const query = e.target.value.toLowerCase().trim();
    const filtered = allJobs.filter(j => 
        j.jobRole.toLowerCase().replace(/_/g, " ").includes(query) ||
        j.jobLevel.toLowerCase().replace(/_/g, " ").includes(query)
    );
    renderJobs(filtered);
});

backBtn.addEventListener("click", () => {
    window.location.href = "companies.html";
});

load();
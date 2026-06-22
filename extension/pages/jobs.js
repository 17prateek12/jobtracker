import { getCompanyJobs, } from "../service/api.js";

const jobsEl = document.getElementById("jobs");
const params = new URLSearchParams(location.search);
const companyId = params.get("companyId");

async function load() {
    const result = await getCompanyJobs(companyId);
    jobsEl.innerHTML = "";
     console.log("JOBS API", result);
    result.data.jobs.forEach((job) => {
        const li = document.createElement("li");

        li.innerHTML =
            `
                ${job.jobRole}
                |
                ${job.jobLevel}
                |
                ${job.status}
                `;
        li.onclick = () => {

            chrome.tabs.create({
                url:
                    chrome.runtime.getURL(
                        `pages/job-detail.html?jobId=${job._id}`
                    ),
            });
        };
        jobsEl.appendChild(
            li
        );
    }
    );
}

load();
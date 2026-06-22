import {
    getOpportunity,
} from "../service/api.js";

const params =
    new URLSearchParams(
        location.search
    );

const jobId =
    params.get("jobId");

async function load() {

    const result =
        await getOpportunity(
            jobId
        );

    console.log(result);

    document.getElementById(
        "job"
    ).innerHTML = `
        <h3>${result.data.jobRole}</h3>
        <p>${result.data.jobLevel}</p>
        <p>${result.data.status}</p>
        <a href="${result.data.jobUrl}" target="_blank">
            Open Job
        </a>
    `;
}

load();

document
    .getElementById(
        "openDashboardBtn"
    )
    .addEventListener(
        "click",
        () => {

            chrome.tabs.create({
                url:
                    `http://localhost:5173/opportunities/${jobId}`
            });
        }
    );
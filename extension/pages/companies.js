import { getCompanies, } from "../service/api.js";

const companiesEl = document.getElementById("companies");

async function load() {

    const result =
        await getCompanies();

    console.log(
        "COMPANIES API:",
        result
    );

    companiesEl.innerHTML = "";

    result.data.forEach(
        company => {

            const li =
                document.createElement(
                    "li"
                );

            li.textContent =
                company.name;

            li.onclick = () => {

                console.log(
                    "Company Clicked",
                    company
                );

                chrome.tabs.create({
                    url:
                        chrome.runtime.getURL(
                            `pages/jobs.html?companyId=${company._id}`
                        ),
                });
            };

            companiesEl.appendChild(
                li
            );
        }
    );
}

load();
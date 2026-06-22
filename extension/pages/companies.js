import { getCompanies } from "../service/api.js";

const companiesEl = document.getElementById("companies");
const searchInput = document.getElementById("searchInput");
const closeTabBtn = document.getElementById("closeTabBtn");

let allCompanies = [];

async function load() {
    try {
        const result = await getCompanies();
        if (result && result.success && result.data) {
            allCompanies = result.data;
            renderCompanies(allCompanies);
        } else {
            companiesEl.innerHTML = `<li class="empty-state">No companies found or unauthorized.</li>`;
        }
    } catch (err) {
        console.error("Error loading companies:", err);
        companiesEl.innerHTML = `<li class="empty-state">Failed to load companies. Ensure backend is running.</li>`;
    }
}

function renderCompanies(companies) {
    companiesEl.innerHTML = "";
    if (companies.length === 0) {
        companiesEl.innerHTML = `<li class="empty-state">No matching companies.</li>`;
        return;
    }

    companies.forEach(company => {
        const li = document.createElement("li");
        li.className = "card-item";
        
        // Show company name and details
        li.innerHTML = `
            <div>
                <h3 class="card-title">${company.name}</h3>
                <p class="card-subtitle">Opportunities tracked under this company</p>
            </div>
            <span class="btn-nav-top">View Jobs</span>
        `;

        li.onclick = () => {
            window.location.href = `jobs.html?companyId=${company._id}`;
        };

        companiesEl.appendChild(li);
    });
}

// Search filter listener
searchInput.addEventListener("input", (e) => {
    const query = e.target.value.toLowerCase().trim();
    const filtered = allCompanies.filter(c => c.name.toLowerCase().includes(query));
    renderCompanies(filtered);
});

closeTabBtn.addEventListener("click", () => {
    window.close();
});

load();
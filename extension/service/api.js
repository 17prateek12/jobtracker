const API_BASE = "http://localhost:5000/api";

async function request(endpoint, options = {}) {
    const { token } = await chrome.storage.local.get("token");
    console.log(token);
    const response = await fetch(`${API_BASE}${endpoint}`,
        {
            ...options,
            headers: {
                "Content-Type":
                    "application/json",
                Authorization:
                    `Bearer ${token}`,
            },
        }
    );

    return response.json();
}

// export const captureJob = (payload) =>
//     request(
//         "/capture/capture-job",
//         {
//             method: "POST",
//             body:
//                 JSON.stringify(
//                     payload
//                 ),
//         }
//     );

export async function captureJob(payload) {

  const { token } = await chrome.storage.local.get("token");

  const response = await fetch(
      `${API_BASE}/capture/capture-job`,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",

          Authorization:
            `Bearer ${token}`,
        },

        body: JSON.stringify(
          payload
        ),
      }
    );

  return response.json();
}

export const getCompanies =
    () =>
        request(
            "/capture/captured-jobs"
        );

export const getCompanyJobs =
    (companyId) =>
        request(
            `/capture/captured-jobs/${companyId}`
        );        

export const getOpportunity =
    (opportunityId) =>
        request(
            `/opportunities/${opportunityId}`
        );        

export async function getEnums() {
    const { token } = await chrome.storage.local.get("token");
    const response = await fetch(
        `${API_BASE}/metadata/enums`,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        }
    );
    return response.json();
}

export async function getCurrentUser() {
    const { token } = await chrome.storage.local.get("token");
    const response = await fetch(
        `${API_BASE}/auth/me`,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        }
    );
    return response.json();
}


console.log("Loading..")
import { captureJob, } from "../service/api.js";
import {
    JOB_ROLES,
    JOB_LEVELS,
    OPPORTUNITY_SOURCES,
    OPPORTUNITY_STATUS,
} from "./constants.js";
const companyInput = document.getElementById("companyInput");
const urlInput = document.getElementById("urlInput");
const tokenInput = document.getElementById("tokenInput");


function populateSelect(selectId, values) {
    const select = document.getElementById(selectId);
    values.forEach(value => {
        const option =
            document.createElement("option");

        option.value = value;
        option.textContent = value;

        select.appendChild(option);
    });
}

populateSelect("roleSelect", JOB_ROLES);
populateSelect("jobLevelSelect", JOB_LEVELS);
populateSelect("sourceSelect", OPPORTUNITY_SOURCES);
populateSelect("statusSelect", OPPORTUNITY_STATUS);



const selectCompanyBtn = document.getElementById("selectCompanyBtn");
const captureUrlBtn = document.getElementById("captureUrlBtn");
const clearBtn = document.getElementById("clearBtn");

async function loadForm() {
    const data = await chrome.storage.local.get(null);
    console.log("ALL STORAGE:", data);
    companyInput.value = data.company || "";
    urlInput.value = data.jobUrl || "";
    document.getElementById("roleSelect").value = data.jobRole || "";
    document.getElementById("jobLevelSelect").value = data.jobLevel || "";
    document.getElementById("sourceSelect").value = data.source || "";
    document.getElementById("statusSelect").value = data.status || "";
}
loadForm();

selectCompanyBtn.addEventListener("click", async () => {
    const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
    });

    // await chrome.tabs.sendMessage(
    //     tab.id,
    //     {
    //         type: "START_SELECTION",
    //         field: "company",
    //     }
    // );
    try {
        await chrome.tabs.sendMessage(
            tab.id,
            {
                type: "START_SELECTION",
                field: "company",
            }
        );
    } catch (err) {
        console.error(
            "Content script not loaded",
            err
        );

        alert(
            "Refresh page and try again"
        );
    }
}
);


captureUrlBtn.addEventListener("click", async () => {
    const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
    });

    urlInput.value = tab.url;

    await chrome.storage.local.set({
        jobUrl: tab.url,
    });
}
);

companyInput.addEventListener("input", async () => {
    await chrome.storage.local.set({
        company: companyInput.value,
    });
}
);

urlInput.addEventListener("input", async () => {
    await chrome.storage.local.set({
        jobUrl: urlInput.value,
    });
}
);

document.getElementById("roleSelect")
    .addEventListener(
        "change",
        async (e) => {

            await chrome.storage.local.set({
                jobRole:
                    e.target.value,
            });
        }
    );

document.getElementById("jobLevelSelect")
    .addEventListener(
        "change",
        async (e) => {

            await chrome.storage.local.set({
                jobLevel:
                    e.target.value,
            });
        }
    );

document.getElementById("sourceSelect")
    .addEventListener(
        "change",
        async (e) => {

            await chrome.storage.local.set({
                source:
                    e.target.value,
            });
        }
    );

document.getElementById("statusSelect")
    .addEventListener(
        "change",
        async (e) => {

            await chrome.storage.local.set({
                status:
                    e.target.value,
            });
        }
    );

clearBtn.addEventListener("click", async () => {
    await chrome.storage.local.clear();
    companyInput.value = "";
    urlInput.value = "";
    document.getElementById("roleSelect").value = "";
    document.getElementById("jobLevelSelect").value = "";
    document.getElementById("sourceSelect").value = "";
    document.getElementById("statusSelect").value = "";
}
);


document.addEventListener(
    "DOMContentLoaded",
    loadForm
);

window.addEventListener(
    "focus",
    loadForm
);

chrome.storage.onChanged.addListener(
    () => {
        loadForm();
    }
);

document.getElementById("saveTokenBtn")
    .addEventListener("click", async () => {
        await chrome.storage.local.set({ token: tokenInput.value, });
        alert("JWT Saved");
    }
    );

document.getElementById("saveJobBtn")
    .addEventListener("click", async () => {
        try {
            const payload = {
                companyName: companyInput.value,
                jobName: document.getElementById("roleSelect").value,
                jobLevel: document.getElementById("jobLevelSelect").value,
                opportunityStatus: document.getElementById("statusSelect").value,
                source: document.getElementById("sourceSelect").value,
                jobUrl: urlInput.value,
            };
            const result = await captureJob(payload)
            console.log(result);
            alert("Saved to database");
        } catch (error) {
            console.error(error);
        }
    }
    );

document.getElementById("viewCompaniesBtn")
    .addEventListener("click", () => {
        chrome.tabs.create({
            url:
                chrome.runtime.getURL(
                    "pages/companies.html"
                ),
        });
    }
    );



// // auth flow
// async function handleCredentialResponse(response) {
//   try {
//     const backendResponse = await fetch("http://localhost:5000/api/auth/google-login",
//       {
//         method:"POST",
//         headers:{
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({idToken: response.credential,}),
//       }
//     );

//     const data = await backendResponse.json();
//     await chrome.storage.local.set({token: data.data.token, user: data.data.user,});
//     showLoggedIn();
//   } catch (error) {
//     console.error(error);
//     alert("Login Failed");
//   }
// }

// window.handleCredentialResponse = handleCredentialResponse;

// async function checkAuth() {
//   const {token} = await chrome.storage.local.get("token");
//   if(token){
//     showLoggedIn();
//   }
// }

// function showLoggedIn() {
//   document.getElementById("authContainer").style.display = "none";
//   document.getElementById("loggedInContainer").style.display = "block";
// }

// document.getElementById("logoutBtn")
// ?.addEventListener("click", async()=>{
//   await chrome.storage.local.clear();
//   location.reload();
// });

// checkAuth();



// const companyInput =
//   document.getElementById(
//     "companyInput"
//   );

// const roleInput =
//   document.getElementById(
//     "roleInput"
//   );

// const urlInput =
//   document.getElementById(
//     "urlInput"
//   );

// const selectCompanyBtn =
//   document.getElementById(
//     "selectCompanyBtn"
//   );

// const selectRoleBtn =
//   document.getElementById(
//     "selectRoleBtn"
//   );

// const captureUrlBtn =
//   document.getElementById(
//     "captureUrlBtn"
//   );

// const clearBtn =
//   document.getElementById(
//     "clearBtn"
//   );

// async function loadForm() {

//     const data =
//         await chrome.storage.local.get(null);

//     console.log(
//         "ALL STORAGE:",
//         data
//     );

//     companyInput.value =
//         data.company || "";

//     urlInput.value =
//         data.jobUrl || "";
// }


// // const companyInput =
// //     document.getElementById(
// //         "companyInput"
// //     );

// // const roleInput =
// //     document.getElementById(
// //         "roleInput"
// //     );

// // const urlInput =
// //     document.getElementById(
// //         "urlInput"
// //     );

// // const selectCompanyBtn =
// //     document.getElementById(
// //         "selectCompanyBtn"
// //     );

// // const selectRoleBtn =
// //     document.getElementById(
// //         "selectRoleBtn"
// //     );

// // const captureUrlBtn =
// //     document.getElementById(
// //         "captureUrlBtn"
// //     );

// // const clearBtn =
// //     document.getElementById(
// //         "clearBtn"
// //     );

// // async function loadForm() {

// //     const data =
// //         await chrome.storage.local.get([
// //             "company",
// //             "role",
// //             "jobUrl",
// //         ]);

// //     companyInput.value =
// //         data.company || "";

// //     roleInput.value =
// //         data.role || "";

// //     urlInput.value =
// //         data.jobUrl || "";
// // }

// // loadForm();

// // selectCompanyBtn.addEventListener(
// //     "click",
// //     async () => {

// //         const [tab] =
// //             await chrome.tabs.query({
// //                 active: true,
// //                 currentWindow: true,
// //             });

// //         chrome.tabs.sendMessage(
// //             tab.id,
// //             {
// //                 type: "START_SELECTION",
// //                 field: "company",
// //             }
// //         );

// //         window.close();
// //     }
// // );

// // selectRoleBtn.addEventListener(
// //     "click",
// //     async () => {

// //         const [tab] =
// //             await chrome.tabs.query({
// //                 active: true,
// //                 currentWindow: true,
// //             });

// //         chrome.tabs.sendMessage(
// //             tab.id,
// //             {
// //                 type: "START_SELECTION",
// //                 field: "role",
// //             }
// //         );

// //         window.close();
// //     }
// // );

// // captureUrlBtn.addEventListener(
// //     "click",
// //     async () => {

// //         const [tab] =
// //             await chrome.tabs.query({
// //                 active: true,
// //                 currentWindow: true,
// //             });

// //         urlInput.value =
// //             tab.url;

// //         await chrome.storage.local.set({
// //             jobUrl: tab.url,
// //         });
// //     }
// // );

// // companyInput.addEventListener(
// //     "change",
// //     async () => {

// //         await chrome.storage.local.set({
// //             company:
// //                 companyInput.value,
// //         });
// //     }
// // );

// // roleInput.addEventListener(
// //     "change",
// //     async () => {

// //         await chrome.storage.local.set({
// //             role:
// //                 roleInput.value,
// //         });
// //     }
// // );

// // urlInput.addEventListener(
// //     "change",
// //     async () => {

// //         await chrome.storage.local.set({
// //             jobUrl:
// //                 urlInput.value,
// //         });
// //     }
// // );

// // clearBtn.addEventListener(
// //     "click",
// //     async () => {

// //         await chrome.storage.local.remove([
// //             "company",
// //             "role",
// //             "jobUrl",
// //         ]);

// //         companyInput.value = "";

// //         roleInput.value = "";

// //         urlInput.value = "";
// //     }
// // );

// // const companyValue =
// //     document.getElementById(
// //         "companyValue"
// //     );

// // const selectCompanyBtn =
// //     document.getElementById(
// //         "selectCompanyBtn"
// //     );

// // chrome.runtime.onMessage.addListener(
// //     (message) => {

// //         if (
// //             message.type ===
// //             "FIELD_SELECTED"
// //         ) {

// //             if (
// //                 message.field ===
// //                 "company"
// //             ) {

// //                 companyValue.innerText =
// //                     message.value;
// //             }
// //         }
// //     }
// // );

// // selectCompanyBtn.addEventListener(
// //     "click",
// //     async () => {

// //         const [tab] =
// //             await chrome.tabs.query({
// //                 active: true,
// //                 currentWindow: true,
// //             });

// //         chrome.tabs.sendMessage(
// //             tab.id,
// //             {
// //                 type: "START_SELECTION",
// //                 field: "company",
// //             }
// //         );
// //     }
// // );

// // const companyValue =
// //     document.getElementById(
// //         "companyValue"
// //     );

// // const selectCompanyBtn =
// //     document.getElementById(
// //         "selectCompanyBtn"
// //     );

// // chrome.runtime.onMessage.addListener(
// //     (message) => {

// //         if (
// //             message.type ===
// //             "FIELD_SELECTED"
// //         ) {

// //             if (
// //                 message.field ===
// //                 "company"
// //             ) {

// //                 companyValue.innerText =
// //                     message.value;
// //             }
// //         }
// //     }
// // );

// // selectCompanyBtn.addEventListener(
// //     "click",
// //     async () => {

// //         const tabs =
// //             await chrome.tabs.query({
// //                 active: true,
// //                 currentWindow: true,
// //             });

// //         chrome.tabs.sendMessage(
// //             tabs[0].id,
// //             {
// //                 type: "START_SELECTION",
// //                 field: "company",
// //             }
// //         );
// //     }
// // );
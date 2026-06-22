console.log(
  "CONTENT SCRIPT LOADED"
);

// Automatically sync session token from Dashboard to Extension
function syncDashboardToken() {
  const isDashboardApp = 
    window.location.origin === "http://localhost:5173" ||
    document.title.includes("Job CRM") ||
    document.querySelector('meta[name="application-name"]')?.getAttribute('content') === 'Job Tracker';

  if (isDashboardApp) {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");

    chrome.storage.local.get(["token", "user"], (stored) => {
      if (token) {
        if (stored.token !== token) {
          let userObj = null;
          try {
            if (userStr) userObj = JSON.parse(userStr);
          } catch (e) {
            console.error("[Job Tracker] Failed to parse user details:", e);
          }
          chrome.storage.local.set({ token, user: userObj }, () => {
            console.log("[Job Tracker] Session token synced from dashboard.");
          });
        }
      } else {
        // Dashboard logged out - clear storage if extension was connected
        if (stored.token) {
          chrome.storage.local.remove(["token", "user"], () => {
            console.log("[Job Tracker] Cleared extension session since dashboard logged out.");
          });
        }
      }
    });
  }
}

// Run immediately and subscribe to focus/click updates
syncDashboardToken();
window.addEventListener("focus", syncDashboardToken);
window.addEventListener("click", syncDashboardToken);


let activeField = null;

function stopSelectionMode() {

  document.removeEventListener(
    "mouseup",
    handleMouseUp
  );

  activeField = null;
}

async function handleMouseUp() {

  const selectedText =
    window
      .getSelection()
      .toString()
      .trim();

  console.log(
    "Selected Text:",
    selectedText
  );

  console.log(
    "Active Field:",
    activeField
  );

  if (!selectedText) {
    return;
  }

  await chrome.storage.local.set({
    [activeField]:
      selectedText,
  });

  console.log(
    "Saved To Storage"
  );

  alert(
    `${activeField} saved:\n${selectedText}`
  );

  stopSelectionMode();
}

async function handleMouseUp() {

  const selectedText =
    window
      .getSelection()
      .toString()
      .trim();

  console.log(
    "Selected Text:",
    selectedText
  );

  console.log(
    "Active Field:",
    activeField
  );

  if (!selectedText) {
    return;
  }

  await chrome.storage.local.set({
    [activeField]:
      selectedText,
  });

  const data =
    await chrome.storage.local.get(null);

  console.log(
    "AFTER SAVE:",
    data
  );

  alert(
    `${activeField} saved:\n${selectedText}`
  );

  stopSelectionMode();
}

chrome.runtime.onMessage.addListener(
  (message) => {

    console.log(
      "Message Received",
      message
    );

    if (
      message.type ===
      "START_SELECTION"
    ) {

      activeField =
        message.field;

      console.log(
        "Selection Started",
        activeField
      );

      alert(
        `Select ${activeField} text and release mouse`
      );

      document.addEventListener(
        "mouseup",
        handleMouseUp
      );
    }
  }
);


// let activeField = null;

// function stopSelectionMode() {

//     document.removeEventListener(
//         "mouseup",
//         handleMouseUp
//     );

//     activeField = null;
// }

// async function handleMouseUp() {

//     const selectedText =
//         window
//             .getSelection()
//             .toString()
//             .trim();

//     if (!selectedText) {
//         return;
//     }

//     await chrome.storage.local.set({
//         [activeField]:
//             selectedText,
//     });

//     alert(
//         `${activeField} saved:\n${selectedText}`
//     );

//     stopSelectionMode();
// }

// chrome.runtime.onMessage.addListener(
//     (message) => {

//         if (
//             message.type ===
//             "START_SELECTION"
//         ) {

//             activeField =
//                 message.field;

//             alert(
//                 `Select ${activeField} text and release mouse`
//             );

//             document.addEventListener(
//                 "mouseup",
//                 handleMouseUp
//             );
//         }
//     }
// );

// console.log("CONTENT SCRIPT LOADED");
// alert("CONTENT SCRIPT LOADED");

// let activeField = null;

// function handleMouseUp() {
//     const selectedText = window
//         .getSelection()
//         .toString()
//         .trim();

//     if (!selectedText) {
//         return;
//     }

//     chrome.runtime.sendMessage({
//         type: "FIELD_SELECTED",
//         field: activeField,
//         value: selectedText,
//     });

//     alert(
//         `${activeField} selected:\n${selectedText}`
//     );

//     stopSelectionMode();
// }

// function stopSelectionMode() {
//     document.removeEventListener(
//         "mouseup",
//         handleMouseUp
//     );

//     activeField = null;
// }

// chrome.runtime.onMessage.addListener(
//     (message) => {

//         if (
//             message.type ===
//             "START_SELECTION"
//         ) {

//             activeField =
//                 message.field;

//             alert(
//                 `Select ${activeField} text and release mouse`
//             );

//             document.addEventListener(
//                 "mouseup",
//                 handleMouseUp
//             );
//         }
//     }
// );

// let activeField = null;

// let hoveredElement = null;

// function removeSelectionMode() {

//     document.removeEventListener(
//         "mouseover",
//         handleMouseOver
//     );

//     document.removeEventListener(
//         "mouseout",
//         handleMouseOut
//     );

//     document.removeEventListener(
//         "click",
//         handleClick,
//         true
//     );

//     activeField = null;
// }

// function handleMouseOver(event) {

//     hoveredElement =
//         event.target;

//     hoveredElement.style.outline =
//         "2px solid red";
// }

// function handleMouseOut(event) {

//     event.target.style.outline =
//         "";
// }

// function handleClick(event) {

//     event.preventDefault();

//     event.stopPropagation();

//     const selectedText =
//         event.target.innerText?.trim();

//     if (!selectedText) {
//         return;
//     }

//     chrome.runtime.sendMessage({
//         type: "FIELD_SELECTED",
//         field: activeField,
//         value: selectedText,
//     });

//     event.target.style.outline =
//         "";

//     removeSelectionMode();
// }

// chrome.runtime.onMessage.addListener(
//     (message) => {

//         console.log(
//             "Message Received",
//             message
//         );

//         if (
//             message.type ===
//             "START_SELECTION"
//         ) {

//             console.log(
//                 "Selection Started"
//             );

//             activeField =
//                 message.field;

//             document.addEventListener(
//                 "mouseover",
//                 handleMouseOver
//             );

//             document.addEventListener(
//                 "mouseout",
//                 handleMouseOut
//             );

//             document.addEventListener(
//                 "click",
//                 handleClick,
//                 true
//             );
//         }
//     }
// );

// // chrome.runtime.onMessage.addListener(
// //     (message) => {

// //         if (
// //             message.type ===
// //             "START_SELECTION"
// //         ) {

// //             activeField =
// //                 message.field;

// //             document.addEventListener(
// //                 "mouseover",
// //                 handleMouseOver
// //             );

// //             document.addEventListener(
// //                 "mouseout",
// //                 handleMouseOut
// //             );

// //             document.addEventListener(
// //                 "click",
// //                 handleClick,
// //                 true
// //             );
// //         }
// //     }
// // );
export async function getToken() {
    const data = await chrome.storage.local.get("token");
    return data.token;
}

export async function saveToken(token) {
    await chrome.storage.local.set({token,});
}
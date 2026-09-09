// =========================
// SmartTradePro - Part 1
// =========================

// Show selected page
function showPage(pageId) {
    const pages = document.querySelectorAll(".page");

    pages.forEach(page => {
        page.style.display = "none";
    });

    const page = document.getElementById(pageId);
    if (page) {
        page.style.display = "block";
    }
}

// Show Dashboard when the app starts
window.onload = function () {
    showPage("dashboard");
};

// Manual Trader buttons
const contractType = document.getElementById("contractType");
const buyButton1 = document.getElementById("buyButton1");
const buyButton2 = document.getElementById("buyButton2");
const predictionSection = document.getElementById("predictionSection");

// Only attach the event if the element exists
if (contractType) {
    contractType.addEventListener("change", updateButtons);
}

// Connect to the NEW Deriv public WebSocket
const ws = new WebSocket(
    "wss://api.derivws.com/trading/v1/options/ws/public"
);

ws.onopen = () => {
    const status = document.getElementById("status");

    if (status) {
        status.textContent = "Connected";
    }

    ws.send(JSON.stringify({
        ticks: "R_100"
    }));
};

ws.onmessage = (event) => {
    const data = JSON.parse(event.data);

    if (data.error) {
        const price = document.getElementById("price");

        if (price) {
            price.textContent = data.error.message;
        }

        return;
    }

    if (data.msg_type === "tick") {
        const price = document.getElementById("price");

        if (price) {
            price.textContent = data.tick.quote;
        }
    }
};

ws.onclose = () => {
    const status = document.getElementById("status");

    if (status) {
        status.textContent = "Disconnected";
    }
};
// =========================
// SmartTradePro - Part 2
// =========================

// Update Buy button labels
function updateButtons() {
    if (!contractType || !buyButton1 || !buyButton2) {
        return;
    }

    const value = contractType.value;

    switch (value) {
        case "overunder":
            buyButton1.textContent = "Buy Over";
            buyButton2.textContent = "Buy Under";
            if (predictionSection) predictionSection.style.display = "block";
            break;

        case "evenodd":
            buyButton1.textContent = "Buy Even";
            buyButton2.textContent = "Buy Odd";
            if (predictionSection) predictionSection.style.display = "none";
            break;

        case "matchesdiffers":
            buyButton1.textContent = "Buy Matches";
            buyButton2.textContent = "Buy Differs";
            if (predictionSection) predictionSection.style.display = "block";
            break;

        default:
            buyButton1.textContent = "Buy";
            buyButton2.textContent = "Buy";
            if (predictionSection) predictionSection.style.display = "none";
    }
}

// Select the symbol based on the market dropdown
function getSymbol() {

    const market = document.getElementById("market");

    if (!market) {
        return "R_100";
    }

    switch (market.value) {

        case "R_10":
            return "R_10";

        case "R_25":
            return "R_25";

        case "R_50":
            return "R_50";

        case "R_75":
            return "R_75";

        case "R_100":
            return "R_100";

        default:
            return "R_100";
    }
}

// Set the correct button labels when the page loads
updateButtons();
// =========================
// SmartTradePro - Part 3
// =========================

// Login with Deriv (OAuth)
async function loginDeriv() {

    const clientId = "34d8l4gpZvYeLnHZVacCy";
    const redirectUri = "https://derivpro.top/oauth/callback.html";

    const state = crypto.randomUUID();

    const codeVerifier = crypto.randomUUID() + crypto.randomUUID();

    localStorage.setItem("deriv_oauth_state", state);
    localStorage.setItem("deriv_code_verifier", codeVerifier);

    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);

    const hash = await crypto.subtle.digest("SHA-256", data);

    const codeChallenge = btoa(
        String.fromCharCode(...new Uint8Array(hash))
    )
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");

    const url =
        "https://auth.deriv.com/oauth2/auth" +
        "?response_type=code" +
        "&client_id=" + encodeURIComponent(clientId) +
        "&redirect_uri=" + encodeURIComponent(redirectUri) +
        "&state=" + encodeURIComponent(state) +
        "&code_challenge=" + encodeURIComponent(codeChallenge) +
        "&code_challenge_method=S256";

    window.location.href = url;
}

// Show connection status in the console
console.log("SmartTradePro loaded successfully.");
function checkOAuthCallback() {

    const params = new URLSearchParams(window.location.search);

    const code = params.get("code");

    if (code) {
        console.log("Authorization code:", code);

        alert("Login successful. Authorization code received.");
    }
}

checkOAuthCallback();

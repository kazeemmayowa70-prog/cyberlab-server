let token = null;

const $ = (id) => document.getElementById(id);

function show(text) {
  $("message").textContent = text;
}

function showPanel(loggedIn, name) {
  $("authPanel").hidden = loggedIn;
  $("userPanel").hidden = !loggedIn;
  $("welcome").textContent = loggedIn ? "Logged in as " + name : "";
}

async function send(path, method, body) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = "Bearer " + token;
  try {
    const res = await fetch(path, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    return { ok: res.ok, data: await res.json() };
  } catch (err) {
    return { ok: false, data: { error: "Cannot reach the server" } };
  }
}

$("registerBtn").addEventListener("click", async () => {
  const r = await send("/register", "POST", {
    username: $("username").value,
    password: $("password").value,
  });
  show(r.ok ? "Account created. Now log in." : r.data.error);
});

$("loginBtn").addEventListener("click", async () => {
  const name = $("username").value;
  const r = await send("/login", "POST", {
    username: name,
    password: $("password").value,
  });
  if (r.ok) {
    token = r.data.token;
    $("password").value = "";
    showPanel(true, name);
    show("Login successful.");
  } else {
    show(r.data.error);
  }
});

$("profileBtn").addEventListener("click", async () => {
  const r = await send("/profile", "GET");
  show(r.ok ? "Username: " + r.data.username + " | Role: " + r.data.role : r.data.error);
});

$("adminBtn").addEventListener("click", async () => {
  const r = await send("/admin", "GET");
  show(r.ok ? r.data.message : r.data.error);
});

$("logoutBtn").addEventListener("click", () => {
  token = null;
  showPanel(false, "");
  show("Logged out.");
});

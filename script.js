// Show specific page
function showPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
  document.getElementById(pageId).classList.remove('hidden');
}

// Login
async function login() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  const res = await fetch("/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });

  const data = await res.json();

  if (data.success) {
    document.getElementById("login-page").classList.add("hidden");
    document.getElementById("navbar").classList.remove("hidden");
    showPage("dashboard");
  } else {
    document.getElementById("login-msg").innerText = data.message;
  }
}

// Logout
function logout() {
  document.getElementById("navbar").classList.add("hidden");
  document.querySelectorAll(".page").forEach(p => p.classList.add("hidden"));
  document.getElementById("login-page").classList.remove("hidden");
}

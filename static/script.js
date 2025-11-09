// static/script.js
// Handles Login, Register (via fetch JSON), toggling, and dashboard patient form.

document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ static/script.js loaded");

  // UI toggles
  const showRegisterLink = document.getElementById("show-register");
  const showLoginLink = document.getElementById("show-login");
  const loginBox = document.getElementById("login-form-content");
  const registerBox = document.getElementById("register-form-content");

  if (showRegisterLink && showLoginLink) {
    showRegisterLink.addEventListener("click", (e) => {
      e.preventDefault();
      if (loginBox) loginBox.style.display = "none";
      if (registerBox) registerBox.style.display = "block";
    });
    showLoginLink.addEventListener("click", (e) => {
      e.preventDefault();
      if (registerBox) registerBox.style.display = "none";
      if (loginBox) loginBox.style.display = "block";
    });
  }

  // Helper: submit form as JSON to given endpoint
  async function submitJson(formEl, endpoint) {
    const formData = new FormData(formEl);
    const payload = Object.fromEntries(formData.entries());
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      return { ok: res.ok, status: res.status, data };
    } catch (err) {
      console.error("Network error:", err);
      return { ok: false, status: 0, data: { error: "Network error" } };
    }
  }

  // Login handler
  const loginForm = document.querySelector('form[action="/login"]');
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const result = await submitJson(loginForm, "/login");
      if (result.ok && result.data && result.data.success) {
        window.location.href = result.data.redirect || "/dashboard";
      } else {
        alert(result.data.error || "Login failed");
      }
    });
  }

  // Register handler
  const registerForm = document.querySelector('form[action="/register"]');
  if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const result = await submitJson(registerForm, "/register");
      if (result.ok && result.data && result.data.success) {
        alert("Registration successful");
        window.location.href = result.data.redirect || "/dashboard";
      } else {
        alert(result.data.error || "Registration failed");
      }
    });
  }

  // Dashboard patient recommendation form
  const profileForm = document.getElementById("profileForm");
  const resultDiv = document.getElementById("result");
  if (profileForm) {
    profileForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      resultDiv.innerHTML = "<p>⏳ Generating recommendation...</p>";
      const formData = new FormData(profileForm);
      const payload = Object.fromEntries(formData.entries());
      try {
        const res = await fetch("/recommend", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          resultDiv.innerHTML = `
            <h3>💊 Recommended Medication</h3>
            <p><b>Medicine:</b> ${data.medicine}</p>
            <p><b>Dosage:</b> ${data.dosage}</p>
            <p><b>Timing:</b> ${data.timing}</p>
            <p>📧 Email sent (if configured).</p>
          `;
        } else {
          resultDiv.innerHTML = `<p style="color:red;">${data.error || "Failed to get recommendation"}</p>`;
        }
      } catch (err) {
        console.error("Error:", err);
        resultDiv.innerHTML = `<p style="color:red;">Network error</p>`;
      }
    });
  }
});

// js/auth.js - Authentication Handler for Greenhouse Fitness

/**
 * Show notification message to user
 * @param {string} message - Message to display
 * @param {string} type - "success" or "error"
 */
function showNotification(message, type = "success") {
  // Try to find notification elements on login page
  let notifContainer =
    type === "success"
      ? document.getElementById("login-success")
      : document.getElementById("login-error");
  let notifText = document.getElementById("login-error-message");

  // Fallback for registration page
  if (!notifContainer) {
    notifContainer = document.getElementById("success-message");
    notifText = notifContainer
      ? notifContainer.querySelector("p.text-sm")
      : null;
  }

  if (notifContainer) {
    // Update message if text element exists
    if (notifText && type === "error") {
      notifText.textContent = message;
    } else if (
      type === "success" &&
      notifContainer.querySelector("p.text-sm")
    ) {
      notifContainer.querySelector("p.text-sm").textContent = message;
    }

    notifContainer.classList.remove("hidden");

    // Auto-hide after 5 seconds
    setTimeout(() => {
      notifContainer.classList.add("hidden");
    }, 5000);
  } else {
    // Fallback to console log
    console.log(`${type.toUpperCase()}: ${message}`);
  }
}

/**
 * Handle login form submission
 */
async function handleLogin(event) {
  if (event) {
    event.preventDefault();
  }

  try {
    // Get form elements
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const loginButton = document.getElementById("loginButton");
    const buttonText = document.getElementById("loginButtonText");
    const spinner = document.getElementById("loginSpinner");

    if (!emailInput || !passwordInput) {
      console.error("❌ Form inputs not found");
      showNotification("Error: Form fields not found", "error");
      return;
    }

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    // Validation
    if (!email || !password) {
      showNotification("❌ Please enter email and password", "error");
      return;
    }

    // Disable button and show spinner
    if (loginButton) {
      loginButton.disabled = true;
      if (buttonText) buttonText.style.display = "none";
      if (spinner) spinner.style.display = "inline-block";
    }

    console.log("🔐 Attempting login with:", { email });

    // Call API
    const user = await window.API.Usuarios.login(email, password);

    console.log("✅ Login successful:", user);

    // Hide error, show success
    const loginError = document.getElementById("login-error");
    const loginSuccess = document.getElementById("login-success");

    if (loginError) loginError.classList.add("hidden");
    if (loginSuccess) loginSuccess.classList.remove("hidden");

    // Redirect after delay
    setTimeout(() => {
      window.location.href = "./homepage.html";
    }, 1500);
  } catch (error) {
    console.error("❌ Login error:", error);

    // Re-enable button
    const loginButton = document.getElementById("loginButton");
    const buttonText = document.getElementById("loginButtonText");
    const spinner = document.getElementById("loginSpinner");

    if (loginButton) {
      loginButton.disabled = false;
      if (buttonText) buttonText.style.display = "inline";
      if (spinner) spinner.classList.add("hidden");
    }

    // Show error
    const loginError = document.getElementById("login-error");
    const loginSuccess = document.getElementById("login-success");
    const errorMsgEl = document.getElementById("login-error-message");

    if (loginSuccess) loginSuccess.classList.add("hidden");

    if (loginError && errorMsgEl) {
      errorMsgEl.textContent = error.message || "Credenciales incorrectas";
      loginError.classList.remove("hidden");
    }
  }
}

/**
 * Handle registration form submission
 */
async function handleRegister(event) {
  if (event) event.preventDefault();

  try {
    // Get form elements
    const firstNameInput = document.getElementById("firstName");
    const lastNameInput = document.getElementById("lastName");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const confirmPasswordInput = document.getElementById("confirmPassword");
    const registerButton = document.getElementById("register-button");
    const buttonText = document.getElementById("button-text");
    const spinner = document.getElementById("loading-spinner");

    if (
      !firstNameInput ||
      !emailInput ||
      !passwordInput ||
      !confirmPasswordInput
    ) {
      console.error("❌ Form inputs not found");
      showNotification("Error: Form fields not found", "error");
      return;
    }

    const firstName = firstNameInput.value.trim();
    const lastName = lastNameInput ? lastNameInput.value.trim() : "";
    const fullNombre = lastName ? `${firstName} ${lastName}` : firstName;
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    const confirmPassword = confirmPasswordInput.value.trim();

    // Get optional fields
    const telefono = document.getElementById("telefono")?.value.trim() || "";
    const direccion = document.getElementById("direccion")?.value.trim() || "";
    const ciudad = document.getElementById("ciudad")?.value.trim() || "";
    const codigo_postal =
      document.getElementById("codigo_postal")?.value.trim() || "";
    const fecha_nacimiento =
      document.getElementById("fecha_nacimiento")?.value || "";

    // Validation
    if (!fullNombre || !email || !password || !confirmPassword) {
      showNotification("❌ Please complete all fields", "error");
      return;
    }

    if (password !== confirmPassword) {
      showNotification("❌ Passwords do not match", "error");
      return;
    }

    if (password.length < 6) {
      showNotification("❌ Password must be at least 6 characters", "error");
      return;
    }

    // Disable button and show spinner
    if (registerButton) {
      registerButton.disabled = true;
      if (buttonText) buttonText.style.display = "none";
      if (spinner) spinner.style.display = "inline-block";
    }

    console.log("📝 Registering user:", { fullNombre, email });

    // Call API - Backend expects: nombre, email, password, telefono, direccion, ciudad, codigo_postal, fecha_nacimiento
    const user = await window.API.Usuarios.register(
      fullNombre,
      email,
      password,
      telefono,
      direccion,
      ciudad,
      codigo_postal,
      fecha_nacimiento
    );

    console.log("✅ Registration successful:", user);

    // Show success message
    const successContainer = document.getElementById("success-message");
    if (successContainer) {
      successContainer.className =
        "bg-success-50 border border-success-200 rounded-lg p-4";
      const successTextEl = successContainer.querySelector(
        "p.text-sm.font-medium"
      );
      if (successTextEl)
        successTextEl.textContent = "¡Cuenta creada exitosamente!";
      successContainer.classList.remove("hidden");
    }

    // Redirect to login page
    setTimeout(() => {
      window.location.href = "./user_login.html";
    }, 2000);
  } catch (error) {
    console.error("❌ Registration error:", error);

    // Re-enable button
    const registerButton = document.getElementById("register-button");
    const buttonText = document.getElementById("button-text");
    const spinner = document.getElementById("loading-spinner");

    if (registerButton) {
      registerButton.disabled = false;
      if (buttonText) buttonText.style.display = "inline";
      if (spinner) spinner.style.display = "none";
    }

    // Show error
    const errorMsg = error.message || "Registration failed";
    const errorContainer = document.getElementById("success-message");
    if (errorContainer) {
      errorContainer.className =
        "bg-error-50 border border-error-200 rounded-lg p-4";
      const errorTextEl = errorContainer.querySelector("p.text-sm.font-medium");
      const errorDetailEl = errorContainer.querySelector("p.text-xs");
      if (errorTextEl) errorTextEl.textContent = "Error en el registro";
      if (errorDetailEl) errorDetailEl.textContent = errorMsg;
      errorContainer.classList.remove("hidden");
      setTimeout(() => errorContainer.classList.add("hidden"), 5000);
    }
  }
}

/**
 * Handle logout
 */
function logout() {
  console.log("🚪 Logging out...");

  // Use API's logout method if available
  if (window.API?.Usuarios?.logout) {
    window.API.Usuarios.logout();
  } else {
    // Manual cleanup
    localStorage.removeItem("currentUser");
    localStorage.removeItem("userId");
  }

  // Redirect to homepage
  window.location.href = "./homepage.html";
}

/**
 * Update authentication UI based on current user
 */
function updateAuthUI() {
  const user = window.API?.Usuarios?.getUser?.();

  if (user) {
    console.log("👤 User logged in:", user.nombre);

    // Update any user-related UI elements
    const userNameEl = document.getElementById("user-name");
    const userEmailEl = document.getElementById("user-email");
    const logoutBtn = document.getElementById("logout-btn");

    if (userNameEl) userNameEl.textContent = user.nombre;
    if (userEmailEl) userEmailEl.textContent = user.email;
    if (logoutBtn) logoutBtn.style.display = "block";
  }
}

// Export to global scope
window.handleLogin = handleLogin;
window.handleRegister = handleRegister;
window.logout = logout;
window.updateAuthUI = updateAuthUI;

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ Auth.js loaded");

  updateAuthUI();

  // Setup login form if it exists on this page
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", handleLogin);
    console.log("✅ Login form configured");
  }

  // Setup registration form if it exists on this page
  const registerForm = document.getElementById("registerForm");
  if (registerForm) {
    registerForm.addEventListener("submit", handleRegister);
    console.log("✅ Registration form configured");
  }

  // Setup logout button if it exists
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", logout);
    console.log("✅ Logout button configured");
  }
});

// js/user-profile.js - User Profile Management

let isEditMode = false;
let originalUserData = {};

/**
 * Load user profile data
 */
async function loadUserProfile() {
  try {
    const user = window.API?.Usuarios?.getUser();

    if (!user || !user.id_usuario) {
      console.warn("⚠️ No user logged in, redirecting to login...");
      window.location.href = "./user_login.html";
      return;
    }

    console.log("✅ Loading profile for user:", user);

    // Store original data
    originalUserData = { ...user };

    // Update UI with user data
    updateProfileUI(user);
  } catch (error) {
    console.error("❌ Error loading profile:", error);
    showError("Error al cargar el perfil");
  }
}

/**
 * Update profile UI with user data
 */
function updateProfileUI(user) {
  // Avatar
  const avatarInitial = document.getElementById("profile-avatar-initial");
  if (avatarInitial && user.nombre) {
    avatarInitial.textContent = user.nombre.charAt(0).toUpperCase();
  }

  // User name and email in sidebar
  const userName = document.getElementById("profile-user-name");
  const userEmail = document.getElementById("profile-user-email");
  if (userName) userName.textContent = user.nombre || "Usuario";
  if (userEmail) userEmail.textContent = user.email || "";

  // Member since
  const memberSince = document.getElementById("profile-member-since");
  if (memberSince && user.fecha_registro) {
    const date = new Date(user.fecha_registro);
    memberSince.textContent = date.getFullYear();
  }

  // Form fields
  const nombreInput = document.getElementById("nombre");
  const emailInput = document.getElementById("email");
  const telefonoInput = document.getElementById("telefono");
  const direccionInput = document.getElementById("direccion");
  const ciudadInput = document.getElementById("ciudad");
  const codigoPostalInput = document.getElementById("codigo_postal");
  const fechaNacimientoInput = document.getElementById("fecha_nacimiento");

  if (nombreInput) nombreInput.value = user.nombre || "";
  if (emailInput) emailInput.value = user.email || "";
  if (telefonoInput) telefonoInput.value = user.telefono || "";
  if (direccionInput) direccionInput.value = user.direccion || "";
  if (ciudadInput) ciudadInput.value = user.ciudad || "";
  if (codigoPostalInput) codigoPostalInput.value = user.codigo_postal || "";
  if (fechaNacimientoInput && user.fecha_nacimiento) {
    // Format date to YYYY-MM-DD for input[type="date"]
    const date = new Date(user.fecha_nacimiento);
    fechaNacimientoInput.value = date.toISOString().split("T")[0];
  }
}

/**
 * Toggle edit mode
 */
function toggleEditMode() {
  isEditMode = !isEditMode;

  const nombreInput = document.getElementById("nombre");
  const telefonoInput = document.getElementById("telefono");
  const direccionInput = document.getElementById("direccion");
  const ciudadInput = document.getElementById("ciudad");
  const codigoPostalInput = document.getElementById("codigo_postal");
  const fechaNacimientoInput = document.getElementById("fecha_nacimiento");
  const newPasswordInput = document.getElementById("newPassword");
  const confirmPasswordInput = document.getElementById("confirmPassword");
  const formActions = document.getElementById("form-actions");
  const editToggleBtn = document.getElementById("edit-toggle-btn");

  if (isEditMode) {
    // Enable editing
    if (nombreInput) nombreInput.disabled = false;
    if (telefonoInput) telefonoInput.disabled = false;
    if (direccionInput) direccionInput.disabled = false;
    if (ciudadInput) ciudadInput.disabled = false;
    if (codigoPostalInput) codigoPostalInput.disabled = false;
    if (fechaNacimientoInput) fechaNacimientoInput.disabled = false;
    if (newPasswordInput) newPasswordInput.disabled = false;
    if (confirmPasswordInput) confirmPasswordInput.disabled = false;
    if (formActions) formActions.classList.remove("hidden");
    if (editToggleBtn) editToggleBtn.classList.add("hidden");
  } else {
    // Disable editing
    if (nombreInput) nombreInput.disabled = true;
    if (telefonoInput) telefonoInput.disabled = true;
    if (direccionInput) direccionInput.disabled = true;
    if (ciudadInput) ciudadInput.disabled = true;
    if (codigoPostalInput) codigoPostalInput.disabled = true;
    if (fechaNacimientoInput) fechaNacimientoInput.disabled = true;
    if (newPasswordInput) newPasswordInput.disabled = true;
    if (confirmPasswordInput) confirmPasswordInput.disabled = true;
    if (formActions) formActions.classList.add("hidden");
    if (editToggleBtn) editToggleBtn.classList.remove("hidden");
  }
}

/**
 * Cancel edit mode and restore original data
 */
function cancelEdit() {
  isEditMode = false;
  toggleEditMode();

  // Restore original data
  updateProfileUI(originalUserData);

  // Clear password fields
  const newPasswordInput = document.getElementById("newPassword");
  const confirmPasswordInput = document.getElementById("confirmPassword");
  if (newPasswordInput) newPasswordInput.value = "";
  if (confirmPasswordInput) confirmPasswordInput.value = "";

  // Hide messages
  hideMessages();
}

/**
 * Handle profile form submission
 */
async function handleProfileUpdate(event) {
  event.preventDefault();

  try {
    const user = window.API?.Usuarios?.getUser();
    if (!user || !user.id_usuario) {
      showError("Error: Usuario no encontrado");
      return;
    }

    // Get form data
    const nombre = document.getElementById("nombre").value.trim();
    const telefono = document.getElementById("telefono").value.trim();
    const direccion = document.getElementById("direccion").value.trim();
    const ciudad = document.getElementById("ciudad").value.trim();
    const codigo_postal = document.getElementById("codigo_postal").value.trim();
    const fecha_nacimiento = document.getElementById("fecha_nacimiento").value;
    const newPassword = document.getElementById("newPassword").value.trim();
    const confirmPassword = document
      .getElementById("confirmPassword")
      .value.trim();

    // Validation
    if (!nombre) {
      showError("El nombre es requerido");
      return;
    }

    // Validate password if provided
    if (newPassword || confirmPassword) {
      if (newPassword !== confirmPassword) {
        showError("Las contraseñas no coinciden");
        return;
      }

      if (newPassword.length < 6) {
        showError("La contraseña debe tener al menos 6 caracteres");
        return;
      }
    }

    // Show loading state
    const saveButton = document.getElementById("save-button");
    const saveButtonText = document.getElementById("save-button-text");
    const saveSpinner = document.getElementById("save-spinner");

    if (saveButton) saveButton.disabled = true;
    if (saveButtonText) saveButtonText.style.display = "none";
    if (saveSpinner) saveSpinner.classList.remove("hidden");

    // Prepare update data
    const updateData = {
      nombre,
      telefono,
      direccion,
      ciudad,
      codigo_postal,
      fecha_nacimiento: fecha_nacimiento || null,
    };

    // Add password only if provided
    if (newPassword) {
      updateData.password = newPassword;
    }

    console.log("📝 Updating profile:", updateData);

    // Call API to update user
    const response = await window.API.Usuarios.update(
      user.id_usuario,
      updateData
    );

    if (response) {
      // Update localStorage with new data
      const updatedUser = { ...user, ...updateData };
      localStorage.setItem("currentUser", JSON.stringify(updatedUser));

      // Update UI
      updateProfileUI(updatedUser);
      originalUserData = { ...updatedUser };

      // Show success message
      showSuccess("Perfil actualizado exitosamente");

      // Clear password fields
      const newPasswordInput = document.getElementById("newPassword");
      const confirmPasswordInput = document.getElementById("confirmPassword");
      if (newPasswordInput) newPasswordInput.value = "";
      if (confirmPasswordInput) confirmPasswordInput.value = "";

      // Exit edit mode
      setTimeout(() => {
        cancelEdit();
      }, 1500);
    } else {
      throw new Error("Error al actualizar perfil");
    }
  } catch (error) {
    console.error("❌ Error updating profile:", error);
    showError(error.message || "Error al actualizar perfil");
  } finally {
    // Re-enable button
    const saveButton = document.getElementById("save-button");
    const saveButtonText = document.getElementById("save-button-text");
    const saveSpinner = document.getElementById("save-spinner");

    if (saveButton) saveButton.disabled = false;
    if (saveButtonText) saveButtonText.style.display = "inline";
    if (saveSpinner) saveSpinner.classList.add("hidden");
  }
}

/**
 * Show success message
 */
function showSuccess(message) {
  hideMessages();
  const successDiv = document.getElementById("profile-success");
  const successMessage = document.getElementById("profile-success-message");

  if (successDiv && successMessage) {
    successMessage.textContent = message;
    successDiv.classList.remove("hidden");

    // Auto-hide after 5 seconds
    setTimeout(() => {
      successDiv.classList.add("hidden");
    }, 5000);
  }
}

/**
 * Show error message
 */
function showError(message) {
  hideMessages();
  const errorDiv = document.getElementById("profile-error");
  const errorMessage = document.getElementById("profile-error-message");

  if (errorDiv && errorMessage) {
    errorMessage.textContent = message;
    errorDiv.classList.remove("hidden");
  }
}

/**
 * Hide all messages
 */
function hideMessages() {
  const successDiv = document.getElementById("profile-success");
  const errorDiv = document.getElementById("profile-error");

  if (successDiv) successDiv.classList.add("hidden");
  if (errorDiv) errorDiv.classList.add("hidden");
}

// Export functions to global scope
window.toggleEditMode = toggleEditMode;
window.cancelEdit = cancelEdit;

// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ User Profile script loaded");

  // Load profile data
  loadUserProfile();

  // Setup form submission
  const profileForm = document.getElementById("profileForm");
  if (profileForm) {
    profileForm.addEventListener("submit", handleProfileUpdate);
    console.log("✅ Profile form configured");
  }

  // Update cart count
  if (window.API?.Carrito?.updateCartUI) {
    window.API.Carrito.updateCartUI();
  }
});

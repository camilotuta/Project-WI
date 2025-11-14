// Global variables
let allUsers = [];
let deleteUserId = null;

// Load users
async function loadUsers() {
  const tbody = document.getElementById("users-table");

  try {
    const response = await apiCall("/usuarios");
    allUsers = response.data || [];

    renderUsers(allUsers);
  } catch (error) {
    console.error("Error loading users:", error);
    tbody.innerHTML =
      '<tr><td colspan="7" style="text-align: center; padding: 2rem; color: var(--error);">Error al cargar usuarios</td></tr>';
  }
}

// Render users
function renderUsers(users) {
  const tbody = document.getElementById("users-table");

  if (users.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="7" style="text-align: center; padding: 2rem;">No hay usuarios registrados</td></tr>';
    return;
  }

  tbody.innerHTML = users
    .map(
      (user) => `
    <tr>
      <td>${user.id_usuario}</td>
      <td><strong>${user.nombre}</strong></td>
      <td>${user.email}</td>
      <td>${user.telefono || "N/A"}</td>
      <td>${user.ciudad || "N/A"}</td>
      <td>${formatDate(user.fecha_registro)}</td>
      <td class="table-actions">
        <button class="btn btn-sm btn-warning" onclick="editUser(${
          user.id_usuario
        })">
          ✏️ Editar
        </button>
        <button class="btn btn-sm btn-danger" onclick="openDeleteModal(${
          user.id_usuario
        })">
          🗑️ Eliminar
        </button>
      </td>
    </tr>
  `
    )
    .join("");
}

// Filter users
function filterUsers() {
  const search = document.getElementById("search-input").value.toLowerCase();

  let filtered = allUsers;

  if (search) {
    filtered = filtered.filter(
      (u) =>
        u.nombre.toLowerCase().includes(search) ||
        u.email.toLowerCase().includes(search)
    );
  }

  renderUsers(filtered);
}

// Open user modal
function openUserModal() {
  document.getElementById("modal-title").textContent = "Nuevo Usuario";
  document.getElementById("user-form").reset();
  document.getElementById("user-id").value = "";
  document.getElementById("password-group").style.display = "block";
  document.getElementById("user-password").required = true;
  document.getElementById("user-modal").classList.add("active");
}

// Close user modal
function closeUserModal() {
  document.getElementById("user-modal").classList.remove("active");
}

// Edit user
async function editUser(id) {
  try {
    const response = await apiCall(`/usuarios/${id}`);
    const user = response.data;

    if (!user) {
      showNotification("Usuario no encontrado", "error");
      return;
    }

    document.getElementById("modal-title").textContent = "Editar Usuario";
    document.getElementById("user-id").value = user.id_usuario;

    // Split nombre into nombre and apellido if contains space
    const nameParts = user.nombre.split(" ");
    document.getElementById("user-nombre").value = nameParts[0] || "";
    document.getElementById("user-apellido").value =
      nameParts.slice(1).join(" ") || "";

    document.getElementById("user-email").value = user.email;
    document.getElementById("user-telefono").value = user.telefono || "";
    document.getElementById("user-fecha-nacimiento").value =
      user.fecha_nacimiento ? user.fecha_nacimiento.split("T")[0] : "";
    document.getElementById("user-direccion").value = user.direccion || "";
    document.getElementById("user-ciudad").value = user.ciudad || "";
    document.getElementById("user-codigo-postal").value =
      user.codigo_postal || "";

    // Hide password field when editing
    document.getElementById("password-group").style.display = "none";
    document.getElementById("user-password").required = false;

    document.getElementById("user-modal").classList.add("active");
  } catch (error) {
    console.error("Error loading user:", error);
    showNotification("Error al cargar el usuario", "error");
  }
}

// Save user
async function saveUser() {
  const id = document.getElementById("user-id").value;
  const nombre = document.getElementById("user-nombre").value.trim();
  const apellido = document.getElementById("user-apellido").value.trim();
  const email = document.getElementById("user-email").value.trim();
  const password = document.getElementById("user-password").value;
  const telefono = document.getElementById("user-telefono").value.trim();
  const fechaNacimiento = document.getElementById(
    "user-fecha-nacimiento"
  ).value;
  const direccion = document.getElementById("user-direccion").value.trim();
  const ciudad = document.getElementById("user-ciudad").value.trim();
  const codigoPostal = document
    .getElementById("user-codigo-postal")
    .value.trim();

  // Validation
  if (!nombre || !email) {
    showNotification("Por favor completa los campos requeridos", "warning");
    return;
  }

  if (!id && !password) {
    showNotification(
      "La contraseña es requerida para nuevos usuarios",
      "warning"
    );
    return;
  }

  const saveBtn = document.getElementById("save-btn-text");
  const saveLoading = document.getElementById("save-loading");

  saveBtn.style.display = "none";
  saveLoading.style.display = "inline-block";

  try {
    // Prepare user data
    const userData = {
      nombre,
      apellido: apellido || null,
      email,
      telefono: telefono || null,
      fecha_nacimiento: fechaNacimiento || null,
      direccion: direccion || null,
      ciudad: ciudad || null,
      codigo_postal: codigoPostal || null,
    };

    // Add password only for new users or if provided
    if (password) {
      userData.password = password;
    }

    // Create or update user
    let response;
    if (id) {
      response = await apiCall(`/usuarios/${id}`, {
        method: "PUT",
        body: JSON.stringify(userData),
      });
    } else {
      response = await apiCall("/usuarios", {
        method: "POST",
        body: JSON.stringify(userData),
      });
    }

    if (response.success) {
      showNotification(
        id ? "Usuario actualizado exitosamente" : "Usuario creado exitosamente",
        "success"
      );
      closeUserModal();
      await loadUsers();
    } else {
      throw new Error(response.message || "Error al guardar el usuario");
    }
  } catch (error) {
    console.error("Error saving user:", error);
    showNotification(error.message || "Error al guardar el usuario", "error");
  } finally {
    saveBtn.style.display = "inline";
    saveLoading.style.display = "none";
  }
}

// Open delete modal
function openDeleteModal(id) {
  deleteUserId = id;
  document.getElementById("delete-modal").classList.add("active");
}

// Close delete modal
function closeDeleteModal() {
  deleteUserId = null;
  document.getElementById("delete-modal").classList.remove("active");
}

// Confirm delete
async function confirmDelete() {
  if (!deleteUserId) return;

  try {
    const response = await apiCall(`/usuarios/${deleteUserId}`, {
      method: "DELETE",
    });

    if (response.success) {
      showNotification("Usuario eliminado exitosamente", "success");
      closeDeleteModal();
      await loadUsers();
    } else {
      throw new Error(response.message || "Error al eliminar el usuario");
    }
  } catch (error) {
    console.error("Error deleting user:", error);
    showNotification(error.message || "Error al eliminar el usuario", "error");
  }
}

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  // Add event listener for search
  document
    .getElementById("search-input")
    ?.addEventListener("input", filterUsers);

  // Load initial data
  loadUsers();
});

// Expose functions globally
window.openUserModal = openUserModal;
window.closeUserModal = closeUserModal;
window.editUser = editUser;
window.saveUser = saveUser;
window.openDeleteModal = openDeleteModal;
window.closeDeleteModal = closeDeleteModal;
window.confirmDelete = confirmDelete;

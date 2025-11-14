// Global variables
let allCategories = [];
let deleteCategoryId = null;

// Load categories
async function loadCategories() {
  const grid = document.getElementById("categories-grid");

  try {
    const response = await apiCall("/categorias");
    allCategories = response.data || [];

    renderCategories(allCategories);
  } catch (error) {
    console.error("Error loading categories:", error);
    grid.innerHTML =
      '<div class="stat-card" style="text-align: center; color: var(--error);">Error al cargar categorías</div>';
  }
}

// Render categories
function renderCategories(categories) {
  const grid = document.getElementById("categories-grid");

  if (categories.length === 0) {
    grid.innerHTML =
      '<div class="stat-card" style="text-align: center;">No hay categorías registradas</div>';
    return;
  }

  grid.innerHTML = categories
    .map(
      (category) => `
    <div class="stat-card">
      <div style="margin-bottom: 1rem;">
        <h3 style="font-size: 1.25rem; font-weight: 600; color: var(--text-primary); margin-bottom: 0.5rem;">
          ${category.nombre}
        </h3>
        <p style="font-size: 0.875rem; color: var(--text-secondary);">
          ${category.descripcion || "Sin descripción"}
        </p>
      </div>
      <div class="table-actions" style="justify-content: flex-start;">
        <button class="btn btn-sm btn-warning" onclick="editCategory(${
          category.id_categoria
        })">
          ✏️ Editar
        </button>
        <button class="btn btn-sm btn-danger" onclick="openDeleteModal(${
          category.id_categoria
        })">
          🗑️ Eliminar
        </button>
      </div>
    </div>
  `
    )
    .join("");
}

// Open category modal
function openCategoryModal() {
  document.getElementById("modal-title").textContent = "Nueva Categoría";
  document.getElementById("category-form").reset();
  document.getElementById("category-id").value = "";
  document.getElementById("category-modal").classList.add("active");
}

// Close category modal
function closeCategoryModal() {
  document.getElementById("category-modal").classList.remove("active");
}

// Edit category
async function editCategory(id) {
  try {
    const response = await apiCall(`/categorias/${id}`);
    const category = response.data;

    if (!category) {
      showNotification("Categoría no encontrada", "error");
      return;
    }

    document.getElementById("modal-title").textContent = "Editar Categoría";
    document.getElementById("category-id").value = category.id_categoria;
    document.getElementById("category-name").value = category.nombre;
    document.getElementById("category-description").value =
      category.descripcion || "";

    document.getElementById("category-modal").classList.add("active");
  } catch (error) {
    console.error("Error loading category:", error);
    showNotification("Error al cargar la categoría", "error");
  }
}

// Save category
async function saveCategory() {
  const id = document.getElementById("category-id").value;
  const name = document.getElementById("category-name").value.trim();
  const description = document
    .getElementById("category-description")
    .value.trim();

  // Validation
  if (!name) {
    showNotification("Por favor ingresa el nombre de la categoría", "warning");
    return;
  }

  const saveBtn = document.getElementById("save-btn-text");
  const saveLoading = document.getElementById("save-loading");

  saveBtn.style.display = "none";
  saveLoading.style.display = "inline-block";

  try {
    const categoryData = {
      nombre: name,
      descripcion: description || null,
    };

    // Create or update category
    let response;
    if (id) {
      response = await apiCall(`/categorias/${id}`, {
        method: "PUT",
        body: JSON.stringify(categoryData),
      });
    } else {
      response = await apiCall("/categorias", {
        method: "POST",
        body: JSON.stringify(categoryData),
      });
    }

    if (response.success) {
      showNotification(
        id
          ? "Categoría actualizada exitosamente"
          : "Categoría creada exitosamente",
        "success"
      );
      closeCategoryModal();
      await loadCategories();
    } else {
      throw new Error(response.message || "Error al guardar la categoría");
    }
  } catch (error) {
    console.error("Error saving category:", error);
    showNotification(error.message || "Error al guardar la categoría", "error");
  } finally {
    saveBtn.style.display = "inline";
    saveLoading.style.display = "none";
  }
}

// Open delete modal
function openDeleteModal(id) {
  deleteCategoryId = id;
  document.getElementById("delete-modal").classList.add("active");
}

// Close delete modal
function closeDeleteModal() {
  deleteCategoryId = null;
  document.getElementById("delete-modal").classList.remove("active");
}

// Confirm delete
async function confirmDelete() {
  if (!deleteCategoryId) return;

  try {
    const response = await apiCall(`/categorias/${deleteCategoryId}`, {
      method: "DELETE",
    });

    if (response.success) {
      showNotification("Categoría eliminada exitosamente", "success");
      closeDeleteModal();
      await loadCategories();
    } else {
      throw new Error(response.message || "Error al eliminar la categoría");
    }
  } catch (error) {
    console.error("Error deleting category:", error);
    showNotification(
      error.message || "Error al eliminar la categoría",
      "error"
    );
  }
}

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  loadCategories();
});

// Expose functions globally
window.openCategoryModal = openCategoryModal;
window.closeCategoryModal = closeCategoryModal;
window.editCategory = editCategory;
window.saveCategory = saveCategory;
window.openDeleteModal = openDeleteModal;
window.closeDeleteModal = closeDeleteModal;
window.confirmDelete = confirmDelete;

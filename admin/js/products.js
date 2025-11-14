// Global variables
let allProducts = [];
let allCategories = [];
let deleteProductId = null;

// Load products and categories
async function loadData() {
  try {
    await Promise.all([loadProducts(), loadCategories()]);
  } catch (error) {
    console.error("Error loading data:", error);
    showNotification("Error al cargar datos", "error");
  }
}

// Load products
async function loadProducts() {
  const tbody = document.getElementById("products-table");

  try {
    const response = await apiCall("/productos");
    allProducts = response.data || [];

    renderProducts(allProducts);
  } catch (error) {
    console.error("Error loading products:", error);
    tbody.innerHTML =
      '<tr><td colspan="8" style="text-align: center; padding: 2rem; color: var(--error);">Error al cargar productos</td></tr>';
  }
}

// Render products
function renderProducts(products) {
  const tbody = document.getElementById("products-table");

  if (products.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="8" style="text-align: center; padding: 2rem;">No hay productos disponibles</td></tr>';
    return;
  }

  tbody.innerHTML = products
    .map(
      (product) => `
    <tr>
      <td>${product.id_producto}</td>
      <td>
        <img src="../../frontend${product.imagen_url}" 
             alt="${product.nombre}" 
             class="table-image"
             onerror="this.src='https://via.placeholder.com/50'">
      </td>
      <td><strong>${product.nombre}</strong></td>
      <td>${product.categoria_nombre || "Sin categoría"}</td>
      <td>${formatCurrency(product.precio)}</td>
      <td>${product.stock_disponible || 0}</td>
      <td>
        ${
          product.destacado
            ? '<span class="badge badge-success">Sí</span>'
            : '<span class="badge badge-error">No</span>'
        }
      </td>
      <td class="table-actions">
        <button class="btn btn-sm btn-warning" onclick="editProduct(${
          product.id_producto
        })">
          ✏️ Editar
        </button>
        <button class="btn btn-sm btn-danger" onclick="openDeleteModal(${
          product.id_producto
        })">
          🗑️ Eliminar
        </button>
      </td>
    </tr>
  `
    )
    .join("");
}

// Load categories
async function loadCategories() {
  try {
    const response = await apiCall("/categorias");
    allCategories = response.data || [];

    // Populate category filters and selects
    const categoryFilter = document.getElementById("category-filter");
    const productCategory = document.getElementById("product-category");

    const options = allCategories
      .map(
        (cat) => `<option value="${cat.id_categoria}">${cat.nombre}</option>`
      )
      .join("");

    categoryFilter.innerHTML =
      '<option value="">Todas las categorías</option>' + options;
    productCategory.innerHTML =
      '<option value="">Seleccionar categoría</option>' + options;
  } catch (error) {
    console.error("Error loading categories:", error);
  }
}

// Filter products
function filterProducts() {
  const search = document.getElementById("search-input").value.toLowerCase();
  const categoryId = document.getElementById("category-filter").value;
  const featured = document.getElementById("featured-filter").value;

  let filtered = allProducts;

  if (search) {
    filtered = filtered.filter(
      (p) =>
        p.nombre.toLowerCase().includes(search) ||
        p.descripcion?.toLowerCase().includes(search)
    );
  }

  if (categoryId) {
    filtered = filtered.filter((p) => p.id_categoria == categoryId);
  }

  if (featured !== "") {
    const isFeatured = featured === "true";
    filtered = filtered.filter((p) => p.destacado === isFeatured);
  }

  renderProducts(filtered);
}

// Open product modal
function openProductModal() {
  document.getElementById("modal-title").textContent = "Nuevo Producto";
  document.getElementById("product-form").reset();
  document.getElementById("product-id").value = "";
  document.getElementById("image-preview").innerHTML =
    '<div class="image-preview-placeholder">Selecciona una imagen o arrastra aquí</div>';
  document.getElementById("product-modal").classList.add("active");
}

// Close product modal
function closeProductModal() {
  document.getElementById("product-modal").classList.remove("active");
}

// Edit product
async function editProduct(id) {
  try {
    const response = await apiCall(`/productos/${id}`);
    const product = response.data;

    if (!product) {
      showNotification("Producto no encontrado", "error");
      return;
    }

    document.getElementById("modal-title").textContent = "Editar Producto";
    document.getElementById("product-id").value = product.id_producto;
    document.getElementById("product-name").value = product.nombre;
    document.getElementById("product-description").value =
      product.descripcion || "";
    document.getElementById("product-category").value =
      product.id_categoria || "";
    document.getElementById("product-price").value = product.precio;
    document.getElementById("product-stock").value =
      product.stock_disponible || 0;
    document.getElementById("product-brand").value = product.marca || "";
    document.getElementById("product-featured").checked =
      product.destacado || false;

    // Show current image
    if (product.imagen_url) {
      document.getElementById(
        "image-preview"
      ).innerHTML = `<img src="../../frontend${product.imagen_url}" alt="${product.nombre}">`;
    }

    document.getElementById("product-modal").classList.add("active");
  } catch (error) {
    console.error("Error loading product:", error);
    showNotification("Error al cargar el producto", "error");
  }
}

// Save product
async function saveProduct() {
  const id = document.getElementById("product-id").value;
  const name = document.getElementById("product-name").value.trim();
  const description = document
    .getElementById("product-description")
    .value.trim();
  const categoryId = document.getElementById("product-category").value;
  const price = parseFloat(document.getElementById("product-price").value);
  const stock = parseInt(document.getElementById("product-stock").value);
  const brand = document.getElementById("product-brand").value.trim();
  const featured = document.getElementById("product-featured").checked;
  const imageFile = document.getElementById("product-image").files[0];

  // Validation
  if (!name || !description || !categoryId || !price || isNaN(stock)) {
    showNotification(
      "Por favor completa todos los campos requeridos",
      "warning"
    );
    return;
  }

  // Check if image is required for new product
  if (!id && !imageFile) {
    showNotification(
      "Por favor selecciona una imagen para el producto",
      "warning"
    );
    return;
  }

  const saveBtn = document.getElementById("save-btn-text");
  const saveLoading = document.getElementById("save-loading");

  saveBtn.style.display = "none";
  saveLoading.style.display = "inline-block";

  try {
    let imagePath = null;

    // Upload image if selected
    if (imageFile) {
      const formData = new FormData();
      formData.append("image", imageFile);

      const uploadResponse = await fetch(`${API_URL}/upload`, {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error("Error al subir la imagen");
      }

      const uploadData = await uploadResponse.json();
      imagePath = uploadData.data.path;
    }

    // Prepare product data
    const productData = {
      nombre: name,
      descripcion: description,
      id_categoria: parseInt(categoryId),
      precio: price,
      stock_disponible: stock,
      marca: brand || null,
      destacado: featured,
    };

    // Add image path if uploaded
    if (imagePath) {
      productData.imagen_url = imagePath;
    }

    // Create or update product
    let response;
    if (id) {
      response = await apiCall(`/productos/${id}`, {
        method: "PUT",
        body: JSON.stringify(productData),
      });
    } else {
      response = await apiCall("/productos", {
        method: "POST",
        body: JSON.stringify(productData),
      });
    }

    if (response.success) {
      showNotification(
        id
          ? "Producto actualizado exitosamente"
          : "Producto creado exitosamente",
        "success"
      );
      closeProductModal();
      await loadProducts();
    } else {
      throw new Error(response.message || "Error al guardar el producto");
    }
  } catch (error) {
    console.error("Error saving product:", error);
    showNotification(error.message || "Error al guardar el producto", "error");
  } finally {
    saveBtn.style.display = "inline";
    saveLoading.style.display = "none";
  }
}

// Open delete modal
function openDeleteModal(id) {
  deleteProductId = id;
  document.getElementById("delete-modal").classList.add("active");
}

// Close delete modal
function closeDeleteModal() {
  deleteProductId = null;
  document.getElementById("delete-modal").classList.remove("active");
}

// Confirm delete
async function confirmDelete() {
  if (!deleteProductId) return;

  try {
    const response = await apiCall(`/productos/${deleteProductId}`, {
      method: "DELETE",
    });

    if (response.success) {
      showNotification("Producto eliminado exitosamente", "success");
      closeDeleteModal();
      await loadProducts();
    } else {
      throw new Error(response.message || "Error al eliminar el producto");
    }
  } catch (error) {
    console.error("Error deleting product:", error);
    showNotification(error.message || "Error al eliminar el producto", "error");
  }
}

// Image preview
document.addEventListener("DOMContentLoaded", () => {
  const imageInput = document.getElementById("product-image");
  const imagePreview = document.getElementById("image-preview");

  if (imageInput) {
    imageInput.addEventListener("change", function () {
      const file = this.files[0];

      if (file) {
        const reader = new FileReader();

        reader.onload = function (e) {
          imagePreview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
        };

        reader.readAsDataURL(file);
      }
    });
  }

  // Add event listeners for filters
  document
    .getElementById("search-input")
    ?.addEventListener("input", filterProducts);
  document
    .getElementById("category-filter")
    ?.addEventListener("change", filterProducts);
  document
    .getElementById("featured-filter")
    ?.addEventListener("change", filterProducts);

  // Load initial data
  loadData();
});

// Expose functions globally
window.openProductModal = openProductModal;
window.closeProductModal = closeProductModal;
window.editProduct = editProduct;
window.saveProduct = saveProduct;
window.openDeleteModal = openDeleteModal;
window.closeDeleteModal = closeDeleteModal;
window.confirmDelete = confirmDelete;

// ============================================
// PRODUCTS.JS - Gestión de Productos
// ============================================

// Estado global de productos
let allProducts = [];
let filteredProducts = [];
let currentPage = 1;
const productsPerPage = 12;

// Cargar productos al iniciar
document.addEventListener("DOMContentLoaded", async () => {
  await loadAllProducts();
  setupFilters();
  setupSearch();
  setupPagination();
});

// ============================================
// CARGAR PRODUCTOS
// ============================================

async function loadAllProducts(filters = {}) {
  try {
    showLoading(true);
    const response = await API.Productos.getAll(filters);
    allProducts = response.data;
    filteredProducts = allProducts;

    renderProducts();
    updateProductCount();
  } catch (error) {
    console.error("Error cargando productos:", error);
    API.showNotification("Error cargando productos", "error");
  } finally {
    showLoading(false);
  }
}

// ============================================
// RENDERIZAR PRODUCTOS
// ============================================

function renderProducts() {
  const container = document.getElementById("products-container");
  if (!container) return;

  const startIndex = (currentPage - 1) * productsPerPage;
  const endIndex = startIndex + productsPerPage;
  const productsToShow = filteredProducts.slice(startIndex, endIndex);

  if (productsToShow.length === 0) {
    container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📦</div>
                <h3>No se encontraron productos</h3>
                <p>Intenta con otros filtros o términos de búsqueda</p>
                <button class="btn btn-primary" onclick="clearFilters()">Limpiar Filtros</button>
            </div>
        `;
    return;
  }

  container.innerHTML = productsToShow
    .map((product) => createProductCardHTML(product))
    .join("");
  updatePagination();
}

function createProductCardHTML(producto) {
  const hasDiscount =
    producto.precio_original && producto.precio_original > producto.precio;
  const discount = hasDiscount
    ? Math.round(
        ((producto.precio_original - producto.precio) /
          producto.precio_original) *
          100
      )
    : 0;

  return `
        <div class="product-card fade-in-up" data-product-id="${
          producto.id_producto
        }">
            <div class="product-image" onclick="goToProductDetail(${
              producto.id_producto
            })">
                <div class="placeholder-image">
                    ${getCategoryIcon(producto.nombre_categoria)}
                </div>
                ${
                  producto.oferta
                    ? '<span class="product-badge badge-error">Oferta</span>'
                    : ""
                }
                ${
                  producto.nuevo
                    ? '<span class="product-badge badge-success">Nuevo</span>'
                    : ""
                }
                ${
                  hasDiscount
                    ? `<span class="product-badge badge-warning">-${discount}%</span>`
                    : ""
                }
            </div>
            
            <div class="product-content">
                <div class="product-category">${producto.nombre_categoria}</div>
                <h3 onclick="goToProductDetail(${producto.id_producto})">${
    producto.nombre
  }</h3>
                <p>${
                  producto.descripcion
                    ? producto.descripcion.substring(0, 100) + "..."
                    : ""
                }</p>
                
                <div class="product-rating">
                    <div class="stars">
                        ${"⭐".repeat(
                          Math.round(
                            parseFloat(producto.valoracion_promedio) || 0
                          )
                        )}
                        ${"☆".repeat(
                          5 -
                            Math.round(
                              parseFloat(producto.valoracion_promedio) || 0
                            )
                        )}
                    </div>
                    <span class="rating-count">(${
                      producto.total_valoraciones || 0
                    })</span>
                </div>
                
                <div class="product-price">
                    <span class="current-price">${API.formatPrice(
                      producto.precio
                    )}</span>
                    ${
                      producto.precio_original
                        ? `<span class="original-price">${API.formatPrice(
                            producto.precio_original
                          )}</span>`
                        : ""
                    }
                </div>
                
                <div class="product-stock">
                    ${
                      producto.stock > 10
                        ? `<span class="in-stock">✓ Disponible</span>`
                        : producto.stock > 0
                        ? `<span class="low-stock">⚠ Solo ${producto.stock} disponibles</span>`
                        : `<span class="out-stock">✗ Agotado</span>`
                    }
                </div>
                
                <div class="product-actions">
                    <button class="btn btn-primary" onclick="addToCart(${
                      producto.id_producto
                    })" 
                            ${producto.stock === 0 ? "disabled" : ""}>
                        ${producto.stock === 0 ? "✗ Agotado" : "🛒 Agregar"}
                    </button>
                    <button class="btn btn-outline" onclick="goToProductDetail(${
                      producto.id_producto
                    })">
                        Ver Detalles
                    </button>
                </div>
            </div>
        </div>
    `;
}

// ============================================
// FILTROS
// ============================================

function setupFilters() {
  // Filtro por categoría
  const categoryFilter = document.getElementById("category-filter");
  categoryFilter?.addEventListener("change", applyFilters);

  // Filtro por precio
  const priceFilter = document.getElementById("price-filter");
  priceFilter?.addEventListener("change", applyFilters);

  // Filtro por disponibilidad
  const stockFilter = document.getElementById("stock-filter");
  stockFilter?.addEventListener("change", applyFilters);

  // Ordenar
  const sortFilter = document.getElementById("sort-filter");
  sortFilter?.addEventListener("change", applySorting);
}

function applyFilters() {
  const categoryFilter = document.getElementById("category-filter")?.value;
  const priceFilter = document.getElementById("price-filter")?.value;
  const stockFilter = document.getElementById("stock-filter")?.value;

  filteredProducts = allProducts.filter((product) => {
    // Filtro de categoría
    if (categoryFilter && categoryFilter !== "all") {
      if (product.id_categoria !== parseInt(categoryFilter)) return false;
    }

    // Filtro de precio
    if (priceFilter) {
      const price = parseFloat(product.precio);
      switch (priceFilter) {
        case "under50":
          if (price >= 50000) return false;
          break;
        case "50to100":
          if (price < 50000 || price >= 100000) return false;
          break;
        case "100to200":
          if (price < 100000 || price >= 200000) return false;
          break;
        case "over200":
          if (price < 200000) return false;
          break;
      }
    }

    // Filtro de stock
    if (stockFilter === "available") {
      if (product.stock <= 0) return false;
    }

    return true;
  });

  currentPage = 1;
  applySorting();
}

function applySorting() {
  const sortFilter = document.getElementById("sort-filter")?.value;

  switch (sortFilter) {
    case "price-asc":
      filteredProducts.sort((a, b) => a.precio - b.precio);
      break;
    case "price-desc":
      filteredProducts.sort((a, b) => b.precio - a.precio);
      break;
    case "name-asc":
      filteredProducts.sort((a, b) => a.nombre.localeCompare(b.nombre));
      break;
    case "name-desc":
      filteredProducts.sort((a, b) => b.nombre.localeCompare(a.nombre));
      break;
    case "rating":
      filteredProducts.sort(
        (a, b) => b.valoracion_promedio - a.valoracion_promedio
      );
      break;
    case "newest":
      filteredProducts.sort(
        (a, b) => new Date(b.fecha_creacion) - new Date(a.fecha_creacion)
      );
      break;
    default:
      // Por defecto: destacados primero
      filteredProducts.sort((a, b) => {
        if (a.destacado && !b.destacado) return -1;
        if (!a.destacado && b.destacado) return 1;
        return 0;
      });
  }

  renderProducts();
}

function clearFilters() {
  document.getElementById("category-filter").value = "all";
  document.getElementById("price-filter").value = "";
  document.getElementById("stock-filter").value = "";
  document.getElementById("sort-filter").value = "default";
  document.getElementById("search-input").value = "";

  filteredProducts = allProducts;
  currentPage = 1;
  renderProducts();
  updateProductCount();
}

// ============================================
// BÚSQUEDA
// ============================================

function setupSearch() {
  const searchInput = document.getElementById("search-input");
  const searchBtn = document.getElementById("search-btn");

  searchInput?.addEventListener("input", debounce(performSearch, 300));
  searchBtn?.addEventListener("click", performSearch);

  searchInput?.addEventListener("keypress", (e) => {
    if (e.key === "Enter") performSearch();
  });
}

function performSearch() {
  const searchTerm = document
    .getElementById("search-input")
    ?.value.toLowerCase()
    .trim();

  if (!searchTerm) {
    filteredProducts = allProducts;
  } else {
    filteredProducts = allProducts.filter(
      (product) =>
        product.nombre.toLowerCase().includes(searchTerm) ||
        product.descripcion?.toLowerCase().includes(searchTerm) ||
        product.nombre_categoria.toLowerCase().includes(searchTerm)
    );
  }

  currentPage = 1;
  renderProducts();
  updateProductCount();
}

// ============================================
// PAGINACIÓN
// ============================================

function setupPagination() {
  const prevBtn = document.getElementById("prev-page");
  const nextBtn = document.getElementById("next-page");

  prevBtn?.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      renderProducts();
      scrollToTop();
    }
  });

  nextBtn?.addEventListener("click", () => {
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
    if (currentPage < totalPages) {
      currentPage++;
      renderProducts();
      scrollToTop();
    }
  });
}

function updatePagination() {
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const pageInfo = document.getElementById("page-info");
  const prevBtn = document.getElementById("prev-page");
  const nextBtn = document.getElementById("next-page");

  if (pageInfo) {
    pageInfo.textContent = `Página ${currentPage} de ${totalPages || 1}`;
  }

  if (prevBtn) {
    prevBtn.disabled = currentPage === 1;
  }

  if (nextBtn) {
    nextBtn.disabled = currentPage === totalPages;
  }
}

// ============================================
// UTILIDADES
// ============================================

function updateProductCount() {
  const countElement = document.getElementById("product-count");
  if (countElement) {
    countElement.textContent = `${filteredProducts.length} productos encontrados`;
  }
}

function showLoading(show) {
  const loader = document.getElementById("products-loader");
  if (loader) {
    loader.style.display = show ? "block" : "none";
  }
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function getCategoryIcon(nombre) {
  const icons = {
    Gimnasio: "🏋️",
    Pilates: "🧘",
    Cardio: "🏃",
    Suplementos: "💊",
    Accesorios: "🎯",
  };
  return icons[nombre] || "📦";
}

function goToProductDetail(id) {
  window.location.href = `../html/product-detail.html?id=${id}`;
}

async function addToCart(id_producto, cantidad = 1) {
  const user = API.getUser();

  if (!user) {
    API.showNotification(
      "Debes iniciar sesión para agregar al carrito",
      "warning"
    );
    setTimeout(() => (window.location.href = "../html/login.html"), 1500);
    return;
  }

  try {
    await API.Carrito.add(user.id_usuario, id_producto, cantidad);
    API.showNotification("✓ Producto agregado al carrito", "success");
    await API.updateCartCount();
  } catch (error) {
    API.showNotification(
      error.message || "Error agregando al carrito",
      "error"
    );
  }
}

// Debounce helper
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

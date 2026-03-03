// products.js - Lógica para la página de productos

let currentPage = 1;
const productsPerPage = 12;

// Función para generar badges de etiquetas
function generateBadges(etiquetas) {
  if (!etiquetas || !Array.isArray(etiquetas) || etiquetas.length === 0) {
    return "";
  }

  return etiquetas
    .map((etiqueta) => {
      let badgeClass = "bg-primary-light text-primary";

      const etiq = etiqueta.toLowerCase();
      if (etiq === "orgánico" || etiq === "organico") {
        badgeClass = "bg-success text-white";
      } else if (etiq === "popular") {
        badgeClass = "bg-warning text-white";
      } else if (etiq === "profesional") {
        badgeClass = "bg-primary text-white";
      } else if (etiq === "eco") {
        badgeClass = "bg-success-light text-success";
      } else if (etiq === "premium") {
        badgeClass = "bg-secondary text-white";
      } else if (etiq === "natural") {
        badgeClass = "bg-success text-white";
      } else if (etiq === "fitness") {
        badgeClass = "bg-primary-light text-primary";
      } else if (etiq === "tech") {
        badgeClass = "bg-secondary-light text-secondary";
      }

      return `<span class="text-xs px-2 py-1 rounded font-medium ${badgeClass}">${etiqueta}</span>`;
    })
    .join(" ");
}
let allProducts = [];
let filteredProducts = [];
let currentFilters = {
  category: null,
  priceRange: null,
  inStock: null,
  sortBy: "relevance",
  search: "",
};

// Obtener categoría de URL
function getCategoryFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("category");
}

// Cargar productos desde la API
async function loadProducts(filters = {}) {
  try {
    console.log("🔄 Cargando productos con filtros:", filters);

    // Filtrado de categoría delegado al backend
    const categoriaSlug =
      filters.category && filters.category !== "all" ? filters.category : null;

    const response = await window.API.Productos.getAll(categoriaSlug);

    console.log("✅ Productos obtenidos de la API:", response);

    let productos = response.data || response || [];

    console.log("📊 Productos recibidos:", productos.length);

    if (!Array.isArray(productos) || productos.length === 0) {
      console.warn("⚠️ No se obtuvieron productos");
      showError("No hay productos disponibles en esta categoría");
      return;
    }

    // Aplicar filtros restantes (precio, stock, búsqueda, orden) — la categoría ya viene filtrada del servidor
    productos = applyFilters(productos, { ...filters, category: null });
    renderProducts(productos);

    console.log(`📊 Productos mostrados: ${productos.length}`);
  } catch (error) {
    console.error("❌ Error loading products:", error);
    showError("Error al cargar productos. Por favor, intenta de nuevo.");
  }
}

function renderProducts(productos) {
  let container =
    document.querySelector(".products-grid") ||
    document.querySelector("[data-products-grid]") ||
    document.querySelector("#products-grid") ||
    document.querySelector(".grid");

  if (!container) {
    console.warn("⚠️ Container no encontrado");
    return;
  }

  console.log("✅ Container encontrado");

  container.innerHTML = "";

  // Actualizar contador de productos
  const countEl = document.getElementById("product-count");
  if (countEl) countEl.textContent = productos ? productos.length : 0;

  if (!productos || productos.length === 0) {
    container.innerHTML =
      '<p class="col-span-full text-center text-gray-500">No hay productos</p>';
    return;
  }

  productos.forEach((product) => {
    try {
      const card = createProductCard(product);
      container.appendChild(card);
    } catch (error) {
      console.error("❌ Error creating product card:", error, product);
    }
  });
}

function createProductCard(product) {
  const card = document.createElement("div");
  card.className =
    "product-card bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow";

  const imageUrl = window.getImageUrl(product.imagen_url || product.imagen);

  card.innerHTML = `
    <div class="relative overflow-hidden bg-gray-200 h-48">
      <img 
        src="${imageUrl}" 
        alt="${product.nombre || "Producto"}"
        class="w-full h-full object-cover hover:scale-110 transition-transform"
        onerror="this.src='https://img.freepik.com/vector-premium/vector-icono-imagen-predeterminado-pagina-imagen-faltante-diseno-sitio-web-o-aplicacion-movil-no-hay-foto-disponible_87543-11093.jpg'"
      />
      <div class="absolute top-2 left-2 flex gap-1 flex-wrap">
        ${generateBadges(product.etiquetas)}
      </div>
      ${
        product.oferta && product.oferta > 0
          ? `<span class="absolute top-2 right-2 bg-error text-white px-2 py-1 rounded-full text-xs font-bold tracking-wide">-${product.oferta}%</span>`
          : ""
      }
    </div>

    <div class="p-4">
      <h3 class="font-semibold text-base text-gray-800 mb-2 line-clamp-2" style="letter-spacing: 0.06em; line-height: 1.4">${
        product.nombre || "Sin nombre"
      }</h3>
      
      <p class="text-gray-600 text-xs mb-3 line-clamp-2">${
        product.descripcion || "Sin descripción"
      }</p>

      <div class="flex items-center justify-between mb-3">
        <span class="text-lg font-bold text-primary">$${parseFloat(
          product.precio || 0,
        ).toLocaleString("es-CO")} COP</span>
        ${
          product.stock && product.stock > 0
            ? `<span class="text-xs bg-success-light text-success px-2 py-1 rounded">Stock: ${product.stock}</span>`
            : `<span class="text-xs bg-error-light text-error px-2 py-1 rounded">Sin stock</span>`
        }
      </div>

      <div class="flex gap-2">
        <button class="flex-1 btn-primary py-2 text-sm add-to-cart-btn">
          🛒 Agregar
        </button>
        <a href="product_details.html?id=${
          product.id_producto
        }" class="flex-1 btn-outline py-2 text-sm text-center">
          Ver
        </a>
      </div>
    </div>
  `;

  const btn = card.querySelector(".add-to-cart-btn");
  btn.addEventListener("click", () => {
    handleAddToCart(product);
  });

  return card;
}

function handleAddToCart(product) {
  console.log("🛒 Agregando producto:", product);
  if (window.API && window.API.Carrito) {
    window.API.Carrito.addItem(product, 1);
  } else {
    console.error("❌ API no disponible");
  }
}

function applyFilters(productos, filters) {
  let filtered = [...productos];

  if (filters.category && filters.category !== "all") {
    filtered = filtered.filter((p) => {
      // Comparar con categoria_nombre que viene del JOIN
      const categoriaLower = (p.categoria_nombre || "").toLowerCase();
      const filterLower = filters.category.toLowerCase();

      // Mapear nombres amigables a nombres de BD
      const categoryMap = {
        "gym-acc": "accesorios de gimnasio",
        "pilates-yoga": "pilates y yoga",
        "natural-supps": "suplementos naturales",
        "sport-supps": "suplementos deportivos",
        clothing: "ropa deportiva",
        "home-gym": "home gym",
      };

      const mappedFilter = categoryMap[filterLower] || filterLower;
      return categoriaLower === mappedFilter;
    });
  }

  if (filters.priceRange) {
    const [min, max] = filters.priceRange;
    filtered = filtered.filter((p) => p.precio >= min && p.precio <= max);
  }

  if (filters.inStock === true) {
    filtered = filtered.filter((p) => p.stock && p.stock > 0);
  }

  if (filters.search && filters.search.trim() !== "") {
    const searchTerm = filters.search.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.nombre.toLowerCase().includes(searchTerm) ||
        (p.descripcion && p.descripcion.toLowerCase().includes(searchTerm)),
    );
  }

  if (filters.sortBy) {
    switch (filters.sortBy) {
      case "price-low":
        filtered.sort((a, b) => a.precio - b.precio);
        break;
      case "price-high":
        filtered.sort((a, b) => b.precio - a.precio);
        break;
      case "newest":
        filtered.sort((a, b) => (b.id_producto || 0) - (a.id_producto || 0));
        break;
    }
  }

  return filtered;
}

function showError(message) {
  let container =
    document.querySelector(".products-grid") ||
    document.querySelector("[data-products-grid]") ||
    document.querySelector("#products-grid") ||
    document.querySelector(".grid");

  if (container) {
    container.innerHTML = `<div class="col-span-full text-center text-red-500 py-8">${message}</div>`;
  }

  console.log("❌ " + message);
}

document.addEventListener("DOMContentLoaded", () => {
  console.log("📄 DOM cargado, inicializando productos...");

  // Obtener categoría de URL si existe
  const categoryFromURL = getCategoryFromURL();
  if (categoryFromURL) {
    currentFilters.category = categoryFromURL;
    console.log("📂 Categoría desde URL:", categoryFromURL);
  }

  // Cargar productos iniciales
  loadProducts(currentFilters);

  // Configurar filtros de categoría
  setupCategoryFilters();

  // Configurar filtros especiales
  setupSpecialFilters();

  // Configurar ordenamiento
  setupSorting();

  // Configurar búsqueda
  setupSearch();

  // Configurar botón de limpiar filtros
  setupClearFilters();

  // Marcar botón activo inicial
  initializeActiveFilters();
});

// Inicializar filtros activos según estado actual
function initializeActiveFilters() {
  const categoryButtons = document.querySelectorAll(".filter-btn");

  categoryButtons.forEach((btn) => {
    const filterValue = btn.getAttribute("data-filter");

    // Marcar como activo si coincide con el filtro actual
    if (
      currentFilters.category === filterValue ||
      (currentFilters.category === null && filterValue === "all")
    ) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });

  console.log("✅ Filtros activos inicializados");
}

// Configurar filtros de categoría
function setupCategoryFilters() {
  const categoryButtons = document.querySelectorAll(".filter-btn");

  categoryButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const filter = btn.getAttribute("data-filter");
      console.log("📂 Filtro de categoría seleccionado:", filter);

      // Actualizar clase active
      categoryButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      // Actualizar filtros y recargar
      currentFilters.category = filter === "all" ? null : filter;
      loadProducts(currentFilters);
    });
  });

  console.log("✅ Filtros de categoría configurados");
}

// Configurar filtros especiales (destacados, nuevos, ofertas)
function setupSpecialFilters() {
  const specialButtons = document.querySelectorAll(".special-filter-btn");

  specialButtons.forEach((btn) => {
    btn.addEventListener("click", async () => {
      const special = btn.getAttribute("data-special");
      console.log("⭐ Filtro especial seleccionado:", special);

      // Actualizar clase active
      specialButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      // Cargar productos según filtro especial
      try {
        let response;
        if (special === "featured") {
          response = await window.API.Productos.getFeatured(12);
        } else if (special === "new") {
          response = await window.API.Productos.getNew(12);
        } else if (special === "offers") {
          response = await window.API.Productos.getOffers(12);
        }

        if (response && response.data) {
          renderProducts(response.data);
        }
      } catch (error) {
        console.error("❌ Error cargando productos especiales:", error);
        showError("Error al cargar productos");
      }
    });
  });

  console.log("✅ Filtros especiales configurados");
}

// Configurar ordenamiento
function setupSorting() {
  const sortSelect = document.getElementById("sort-select");

  if (sortSelect) {
    sortSelect.addEventListener("change", (e) => {
      const sortBy = e.target.value;
      console.log("🔢 Ordenar por:", sortBy);

      currentFilters.sortBy = sortBy;
      loadProducts(currentFilters);
    });

    console.log("✅ Ordenamiento configurado");
  }
}

// Configurar búsqueda
function setupSearch() {
  const searchInput = document.getElementById("search-input");

  if (searchInput) {
    let searchTimeout;
    searchInput.addEventListener("input", (e) => {
      clearTimeout(searchTimeout);
      const searchTerm = e.target.value;

      // Debounce de 300ms
      searchTimeout = setTimeout(() => {
        console.log("🔍 Buscar:", searchTerm);
        currentFilters.search = searchTerm;
        loadProducts(currentFilters);
      }, 300);
    });

    console.log("✅ Búsqueda configurada");
  }
}

// Configurar botón de limpiar filtros
function setupClearFilters() {
  const clearBtn = document.querySelector("[data-clear-filters]");

  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      console.log("🧹 Limpiar filtros");

      // Resetear filtros
      currentFilters = {
        category: null,
        priceRange: null,
        inStock: null,
        sortBy: "relevance",
        search: "",
      };

      // Resetear UI
      document.querySelectorAll(".filter-btn").forEach((btn) => {
        btn.classList.remove("active");
        if (btn.getAttribute("data-filter") === "all") {
          btn.classList.add("active");
        }
      });

      document.querySelectorAll(".special-filter-btn").forEach((btn) => {
        btn.classList.remove("active");
      });

      const searchInput = document.getElementById("search-input");
      if (searchInput) searchInput.value = "";

      const sortSelect = document.getElementById("sort-select");
      if (sortSelect) sortSelect.value = "relevance";

      // Recargar productos
      loadProducts(currentFilters);
    });

    console.log("✅ Botón de limpiar filtros configurado");
  }
}

window.loadProducts = loadProducts;
window.handleAddToCart = handleAddToCart;

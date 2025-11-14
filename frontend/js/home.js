// js/home.js - Carga de productos en homepage

// Cargar productos cuando la página carga
document.addEventListener("DOMContentLoaded", async () => {
  console.log("📄 Home.js cargando...");
  try {
    await loadFeaturedProducts();
  } catch (error) {
    console.error("❌ Error en loadFeaturedProducts:", error);
  }
});

/**
 * Cargar productos destacados
 */
async function loadFeaturedProducts() {
  try {
    console.log("📦 Cargando productos destacados...");

    // Obtener grid de productos - buscar con selector flexible
    let productsGrid = document.querySelector("#featured-products-grid");
    if (!productsGrid) {
      productsGrid = document.querySelector('.grid[class*="grid-cols-"]');
    }
    if (!productsGrid) {
      console.warn(
        "⚠️  No se encontró el grid de productos, intentando con querySelectorAll"
      );
      const grids = document.querySelectorAll('[class*="grid-cols-"]');
      if (grids.length > 0) {
        productsGrid = grids[0]; // Primera grid que encuentre
      }
    }

    if (!productsGrid) {
      console.error("❌ No se encontró contenedor para productos");
      return;
    }

    console.log("✅ Grid de productos encontrado");

    // Obtener 4 productos destacados aleatorios desde API
    const response = await window.API.Productos.getFeatured(4);

    if (!response || !response.data) {
      console.error("❌ Respuesta inválida de API:", response);
      return;
    }

    console.log(`✅ ${response.data.length} productos destacados obtenidos`);

    // Limpiar grid existente
    productsGrid.innerHTML = "";

    // Agregar productos al grid
    response.data.forEach((producto) => {
      const productCard = createProductCard(producto);
      productsGrid.appendChild(productCard);
    });

    console.log(`✅ ${response.data.length} productos agregados al grid`);
  } catch (error) {
    console.error("❌ Error cargando productos:", error);
  }
}

/**
 * Crear tarjeta de producto HTML
 */
function createProductCard(producto) {
  const card = document.createElement("div");
  card.className = "card group hover:shadow-organic-hover transition-state";

  // Imagen con getImageUrl para manejo correcto
  const imageSrc = window.getImageUrl(producto.imagen_url || producto.imagen);

  const priceFormatted =
    window.API?.formatPrice?.(producto.precio) ||
    `$${parseFloat(producto.precio || 0).toFixed(2)}`;

  // Calcular precio con descuento si hay oferta
  let priceHTML = `<span class="text-xl font-bold text-primary">${priceFormatted}</span>`;
  if (producto.oferta && producto.oferta > 0) {
    const precioOriginal = parseFloat(producto.precio);
    const precioConDescuento = precioOriginal * (1 - producto.oferta / 100);
    const precioDescuentoFormatted =
      window.API?.formatPrice?.(precioConDescuento) ||
      `$${precioConDescuento.toFixed(2)}`;
    priceHTML = `
      <span class="text-xl font-bold text-primary">${precioDescuentoFormatted}</span>
      <span class="text-sm text-text-tertiary line-through ml-2">${priceFormatted}</span>
    `;
  }

  card.innerHTML = `
    <div class="relative overflow-hidden rounded-t-lg">
      <img
        src="${imageSrc}"
        alt="${producto.nombre || "Producto"}"
        class="w-full h-48 object-cover group-hover:scale-105 transition-state"
        loading="lazy"
      />
      ${
        producto.oferta
          ? `<div class="absolute top-2 right-2"><span class="bg-accent text-white px-2 py-1 rounded text-xs font-medium">-${producto.oferta}%</span></div>`
          : ""
      }
    </div>
    <div class="p-6">
      <h3 class="text-lg font-heading font-bold text-text-primary mb-2">${
        producto.nombre || "Sin nombre"
      }</h3>
      <p class="text-sm text-text-secondary mb-4">${(
        producto.descripcion || ""
      ).substring(0, 80)}...</p>
      <div class="flex items-center justify-between mb-4">
        <div>
          ${priceHTML}
        </div>
      </div>
      <div class="flex gap-2">
        <button 
          class="flex-1 btn btn-primary text-sm py-2"
          onclick="addProductToCart(${
            producto.id_producto
          }, '${producto.nombre.replace(/'/g, "\\'")}', '${priceFormatted}')"
        >
          + Carrito
        </button>
        <a 
          href="./product_details.html?id=${producto.id_producto}"
          class="flex-1 btn btn-outline text-sm py-2 text-center"
        >
          Detalles
        </a>
      </div>
    </div>
  `;

  return card;
}

/**
 * Agregar producto al carrito
 */
function addProductToCart(productId, productName, price) {
  console.log(`🛒 Agregando al carrito: ${productName}`);

  try {
    // Obtener carrito actual
    let cart = JSON.parse(localStorage.getItem("cart") || "[]");

    // Agregar producto
    cart.push({
      id: productId,
      nombre: productName,
      precio: price,
      cantidad: 1,
      fecha: new Date().toISOString(),
    });

    // Guardar carrito
    localStorage.setItem("cart", JSON.stringify(cart));

    // Mostrar notificación si existe la función
    if (window.showNotification) {
      window.showNotification(`✅ ${productName} agregado al carrito`);
    } else if (
      window.API &&
      window.API.Carrito &&
      window.API.Carrito.showNotification
    ) {
      window.API.Carrito.showNotification(
        `✅ ${productName} agregado al carrito`,
        "success"
      );
    }

    // Actualizar contador
    updateCartBadge();
  } catch (error) {
    console.error("Error al agregar al carrito:", error);
  }
}

/**
 * Actualizar badge del carrito
 */
function updateCartBadge() {
  const cart = JSON.parse(localStorage.getItem("cart") || "[]");
  const cartCountElements = document.querySelectorAll(
    '.cart-count, [class*="cart-badge"]'
  );

  cartCountElements.forEach((el) => {
    el.textContent = cart.length;
  });
}

// Inicializar badge al cargar página
updateCartBadge();

console.log("✅ Home.js cargado");

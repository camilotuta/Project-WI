// js/favoritos.js

document.addEventListener("DOMContentLoaded", async () => {
  // Verificar autenticación
  const userId = window.API.Carrito.getCurrentUserId();
  if (!userId) {
    window.location.href = "user_login.html";
    return;
  }

  // Cargar favoritos
  await loadFavoritos();

  // Actualizar contadores
  await window.API.Favoritos.updateFavoritosCount();
  await updateCartCount();
});

async function updateCartCount() {
  try {
    const userId = window.API.Carrito.getCurrentUserId();
    if (!userId) return;

    const carrito = await window.API.Carrito.get(userId);
    const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);

    const cartBadges = document.querySelectorAll("[data-cart-count]");
    cartBadges.forEach((badge) => {
      badge.textContent = totalItems;
    });
  } catch (error) {
    console.error("Error al actualizar contador del carrito:", error);
  }
}

async function loadFavoritos() {
  const loadingState = document.getElementById("loading-state");
  const emptyState = document.getElementById("empty-state");
  const favoritosGrid = document.getElementById("favoritos-grid");
  const favoritosTotal = document.getElementById("favoritos-total");

  try {
    const favoritos = await window.API.Favoritos.getFavoritos();

    // Ocultar loading
    loadingState.classList.add("hidden");

    if (favoritos.length === 0) {
      // Mostrar estado vacío
      emptyState.classList.remove("hidden");
      favoritosTotal.textContent = "0";
    } else {
      // Mostrar grid de favoritos
      favoritosGrid.classList.remove("hidden");
      favoritosTotal.textContent = favoritos.length;

      // Renderizar productos
      favoritosGrid.innerHTML = "";
      favoritos.forEach((producto) => {
        const card = createFavoritoCard(producto);
        favoritosGrid.appendChild(card);
      });
    }
  } catch (error) {
    console.error("Error al cargar favoritos:", error);
    loadingState.classList.add("hidden");
    emptyState.classList.remove("hidden");
    emptyState.querySelector("h3").textContent = "Error al cargar favoritos";
    emptyState.querySelector("p").textContent =
      "Por favor, intenta de nuevo más tarde";
  }
}

function createFavoritoCard(producto) {
  const card = document.createElement("div");
  card.className = "card group hover:shadow-lg transition-all relative";

  // Imagen
  const imageUrl = window.getImageUrl(producto.imagen_url || producto.imagen);
  const fallbackImage =
    "https://img.freepik.com/vector-premium/vector-icono-imagen-predeterminado-pagina-imagen-faltante-diseno-sitio-web-o-aplicacion-movil-no-hay-foto-disponible_87543-11093.jpg";

  // Badges
  let badgesHTML = "";
  if (producto.etiquetas && Array.isArray(producto.etiquetas)) {
    badgesHTML = producto.etiquetas
      .map((etiqueta) => {
        let badgeClass = "badge-success";
        const etiq = etiqueta.toLowerCase();
        if (etiq === "popular") badgeClass = "badge-warning";
        else if (etiq === "profesional" || etiq === "premium")
          badgeClass = "badge-primary";
        else if (etiq === "nuevo" || etiq === "new")
          badgeClass = "badge-success";

        return `<span class="${badgeClass}">${etiqueta}</span>`;
      })
      .join("");
  }

  // Precio con oferta
  let priceHTML = "";
  if (producto.oferta && producto.oferta > 0) {
    const precioOriginal = parseFloat(producto.precio);
    const precioConDescuento = precioOriginal * (1 - producto.oferta / 100);
    priceHTML = `
      <div class="flex items-center gap-2 mb-3">
        <span class="text-xl font-bold text-primary">${window.API.formatPrice(
          precioConDescuento
        )}</span>
        <span class="text-sm text-text-tertiary line-through">${window.API.formatPrice(
          precioOriginal
        )}</span>
        <span class="badge-accent text-xs">-${producto.oferta}%</span>
      </div>
    `;
  } else {
    priceHTML = `
      <div class="text-xl font-bold text-primary mb-3">${window.API.formatPrice(
        producto.precio
      )}</div>
    `;
  }

  card.innerHTML = `
    <button
      class="absolute top-2 right-2 z-10 bg-white rounded-full p-2 shadow-md hover:bg-error hover:text-white transition-all"
      onclick="removeFavorito(${producto.id_producto})"
      title="Eliminar de favoritos"
    >
      <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>
    
    <div class="relative overflow-hidden rounded-t-lg">
      <a href="product_details.html?id=${producto.id_producto}">
        <img
          src="${imageUrl}"
          alt="${producto.nombre}"
          class="w-full h-48 object-cover group-hover:scale-105 transition-transform"
          loading="lazy"
          onerror="this.src='${fallbackImage}'"
        />
      </a>
      ${
        badgesHTML
          ? `<div class="absolute top-2 left-2 flex gap-1 flex-wrap">${badgesHTML}</div>`
          : ""
      }
    </div>
    
    <div class="p-4">
      <a href="product_details.html?id=${producto.id_producto}" class="block">
        <h3 class="font-semibold text-primary mb-2 line-clamp-2 hover:text-accent transition-colors">
          ${producto.nombre}
        </h3>
      </a>
      
      ${priceHTML}
      
      <div class="space-y-2">
        <a
          href="product_details.html?id=${producto.id_producto}"
          class="btn-outline w-full text-center block"
        >
          Ver Detalles
        </a>
        <button
          onclick="addToCartFromFavoritos(${producto.id_producto})"
          class="btn-primary w-full flex items-center justify-center gap-2"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 11-4 0v-6m4 0V9a2 2 0 10-4 0v4.01"></path>
          </svg>
          Añadir al Carrito
        </button>
      </div>
    </div>
  `;

  return card;
}

// Función global para eliminar favorito
window.removeFavorito = async function (productId) {
  if (!confirm("¿Eliminar este producto de favoritos?")) return;

  try {
    await window.API.Favoritos.toggleFavorito(productId);
    window.API.Favoritos.showNotification(
      "Producto eliminado de favoritos",
      "success"
    );

    // Recargar favoritos
    await loadFavoritos();
    await window.API.Favoritos.updateFavoritosCount();
  } catch (error) {
    console.error("Error al eliminar favorito:", error);
    window.API.Favoritos.showNotification(
      "Error al eliminar favorito",
      "error"
    );
  }
};

// Función global para agregar al carrito desde favoritos
window.addToCartFromFavoritos = async function (productId) {
  try {
    // Obtener información del producto
    const response = await window.API.Productos.getById(productId);
    const producto = response.success ? response.data : response;

    if (!producto) {
      throw new Error("Producto no encontrado");
    }

    // Agregar al carrito
    await window.API.Carrito.addItem(producto, 1);

    // Actualizar contador del carrito
    await updateCartCount();

    window.API.Carrito.showNotification(
      "✅ Producto agregado al carrito",
      "success"
    );
  } catch (error) {
    console.error("Error al agregar al carrito:", error);
    window.API.Carrito.showNotification(
      "❌ Error al agregar al carrito",
      "error"
    );
  }
};

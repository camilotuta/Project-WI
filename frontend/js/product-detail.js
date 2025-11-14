// js/product-detail.js

// Función para actualizar el contador del carrito
async function updateCartCount() {
  try {
    const userId = window.API.Carrito.getCurrentUserId();
    if (!userId) {
      const cartCount = document.getElementById("cart-count");
      if (cartCount) cartCount.textContent = "0";
      return;
    }

    const carrito = await window.API.Carrito.getCarrito();
    const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);

    // Actualizar ambos selectores para compatibilidad
    const cartCount = document.getElementById("cart-count");
    const cartBadges = document.querySelectorAll("[data-cart-count]");

    if (cartCount) {
      cartCount.textContent = totalItems;
    }

    cartBadges.forEach((badge) => {
      badge.textContent = totalItems;
    });
  } catch (error) {
    console.error("❌ Error al actualizar contador del carrito:", error);
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  // Cargar contador del carrito al inicio
  await updateCartCount();

  // Cargar contador de favoritos al inicio
  await window.API.Favoritos.updateFavoritosCount();

  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get("id");

  if (productId) {
    await loadProductDetails(productId);
    await loadRelatedProducts(productId);
  } else {
    console.error("❌ No product ID provided");
  }
});

async function loadProductDetails(id) {
  try {
    const response = await window.API.Productos.getById(id);

    const producto = response.success ? response.data : response;

    if (!producto) {
      throw new Error("Producto no encontrado");
    }

    console.log("✅ Producto cargado:", producto);

    // Actualizar título de la página
    document.title = `${producto.nombre} - Greenhouse Fitness`;

    // Elementos principales
    const productName = document.getElementById("product-name");
    const productDescription = document.getElementById("product-description");
    const productPrice = document.getElementById("product-price");
    const productImage = document.getElementById("product-image");
    const mainProductImage = document.getElementById("main-product-image");
    const addToCartBtn = document.getElementById("add-to-cart-btn");

    // Actualizar nombre
    if (productName) productName.textContent = producto.nombre || "Sin nombre";

    // Actualizar breadcrumb con categoría y producto
    const breadcrumbCategory = document.getElementById("breadcrumb-category");
    const breadcrumbProduct = document.getElementById("breadcrumb-product");

    if (breadcrumbCategory && producto.categoria_nombre) {
      breadcrumbCategory.textContent = producto.categoria_nombre;
      breadcrumbCategory.href = `product_catalog.html?category=${producto.categoria_nombre.toLowerCase()}`;
    }
    if (breadcrumbProduct) {
      breadcrumbProduct.textContent = producto.nombre;
    }

    // Actualizar descripción
    if (productDescription)
      productDescription.textContent =
        producto.descripcion || "Sin descripción";

    // Actualizar precio con ofertas y mostrar ahorro
    const priceContainer = document.getElementById("price-container");
    if (productPrice && priceContainer) {
      if (producto.oferta && producto.oferta > 0) {
        const precioOriginal = parseFloat(producto.precio);
        const precioConDescuento = precioOriginal * (1 - producto.oferta / 100);
        const ahorro = precioOriginal - precioConDescuento;

        priceContainer.innerHTML = `
          <span id="product-price" class="text-3xl font-bold text-primary">${window.API.formatPrice(
            precioConDescuento
          )}</span>
          <span class="text-xl text-text-tertiary line-through">${window.API.formatPrice(
            precioOriginal
          )}</span>
          <span class="bg-accent text-white px-3 py-1 rounded-full text-sm font-medium">-${
            producto.oferta
          }%</span>
          <span class="text-sm text-success font-medium">Ahorras ${window.API.formatPrice(
            ahorro
          )}</span>
        `;
      } else {
        priceContainer.innerHTML = `
          <span id="product-price" class="text-3xl font-bold text-primary">${window.API.formatPrice(
            producto.precio || 0
          )}</span>
        `;
      }
    }

    // Actualizar imágenes
    const imagePath = producto.imagen_url || producto.imagen || "";
    const imageUrl = window.getImageUrl(imagePath);
    const fallbackImage =
      "https://img.freepik.com/vector-premium/vector-icono-imagen-predeterminado-pagina-imagen-faltante-diseno-sitio-web-o-aplicacion-movil-no-hay-foto-disponible_87543-11093.jpg";

    if (productImage) {
      productImage.src = imageUrl;
      productImage.alt = producto.nombre;
      productImage.onerror = () => {
        productImage.src = fallbackImage;
      };
    }

    if (mainProductImage) {
      mainProductImage.src = imageUrl;
      mainProductImage.alt = producto.nombre;
      mainProductImage.onerror = () => {
        mainProductImage.src = fallbackImage;
      };
    }

    // Actualizar badges de etiquetas
    if (producto.etiquetas && Array.isArray(producto.etiquetas)) {
      const badgeContainer = document.querySelector(".flex.items-center.gap-2");
      if (badgeContainer) {
        const badgesHTML = producto.etiquetas
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

        const offerBadge = badgeContainer.querySelector(
          ".bg-accent.text-white"
        );
        badgeContainer.innerHTML = badgesHTML;
        if (producto.oferta && producto.oferta > 0 && offerBadge) {
          badgeContainer.innerHTML += offerBadge.outerHTML;
        }
      }
    }

    // Botón agregar al carrito
    if (addToCartBtn) {
      addToCartBtn.onclick = async (e) => {
        e.preventDefault();
        console.log("🛒 Click en botón Agregar al Carrito");

        const userId = window.API.Carrito.getCurrentUserId();

        if (!userId) {
          window.API.Carrito.showNotification(
            "⚠️ Debes iniciar sesión",
            "warning"
          );
          setTimeout(() => {
            window.location.href = "../pages/user_login.html";
          }, 1500);
          return;
        }

        // Obtener cantidad
        const quantityInput = document.getElementById("quantity");
        const quantity = quantityInput ? parseInt(quantityInput.value) : 1;

        // Agregar al carrito
        await window.API.Carrito.addItem(producto, quantity);

        // Actualizar contador del carrito
        await updateCartCount();
      };
    }

    // Info de stock
    if (producto.stock !== undefined) {
      const stockInfo = document.getElementById("product-stock");
      if (stockInfo) {
        if (producto.stock > 0) {
          stockInfo.innerHTML = `En stock - ${producto.stock} unidades disponibles`;
          stockInfo.className = "text-success font-medium";
          stockInfo.parentElement.querySelector(".w-3").className =
            "w-3 h-3 bg-success rounded-full";
        } else {
          stockInfo.innerHTML = "Sin stock";
          stockInfo.className = "text-error font-medium";
          stockInfo.parentElement.querySelector(".w-3").className =
            "w-3 h-3 bg-error rounded-full";
        }
      }
    }

    // SKU del producto
    const skuElement = document.getElementById("product-sku");
    if (skuElement) {
      skuElement.textContent = producto.id_producto
        ? `PRD-${String(producto.id_producto).padStart(4, "0")}`
        : "-";
    }

    // Calificaciones (por ahora estáticas, preparadas para BD)
    const ratingElement = document.getElementById("product-rating");
    const reviewsCount = document.getElementById("product-reviews-count");
    if (ratingElement && reviewsCount) {
      // Valores por defecto hasta implementar sistema de reseñas
      const rating = 5.0;
      const reviews = 0;

      ratingElement.innerHTML = "★★★★★";
      reviewsCount.textContent =
        reviews > 0 ? `(${reviews} reseñas)` : "(Sin reseñas)";
    }

    // Info de categoría
    const categoryInfo = document.getElementById("product-category");
    if (categoryInfo && producto.categoria_nombre) {
      categoryInfo.textContent = producto.categoria_nombre;
    }

    // Botón de favoritos
    await setupFavoritoButton(producto.id_producto);
  } catch (error) {
    console.error("❌ Error cargando producto:", error);
    window.API.Carrito.showNotification("Error cargando producto", "error");
  }
}

async function loadRelatedProducts(id) {
  try {
    const response = await window.API.Productos.getRelated(id);
    const related = Array.isArray(response) ? response : response.data || [];

    const relatedContainer = document.getElementById("related-products");
    if (!relatedContainer) return;

    relatedContainer.innerHTML = "";

    if (related.length === 0) {
      relatedContainer.innerHTML =
        '<p class="text-center text-text-secondary">No hay productos relacionados</p>';
      return;
    }

    related.forEach((producto) => {
      const card = createRelatedProductCard(producto);
      relatedContainer.appendChild(card);
    });

    console.log(`✅ ${related.length} productos relacionados cargados`);
  } catch (error) {
    console.error("❌ Error cargando productos relacionados:", error);
  }
}

function createRelatedProductCard(product) {
  const card = document.createElement("div");
  card.className = "card hover:shadow-organic-hover transition-shadow group";

  const imagePath = product.imagen_url || product.imagen || "";
  const image = window.getImageUrl(imagePath);
  const fallbackImage =
    "https://img.freepik.com/vector-premium/vector-icono-imagen-predeterminado-pagina-imagen-faltante-diseno-sitio-web-o-aplicacion-movil-no-hay-foto-disponible_87543-11093.jpg";

  // Calcular precio con descuento
  let priceHTML = `<p class="text-lg font-bold text-primary mb-3">${window.API.formatPrice(
    product.precio || 0
  )}</p>`;
  if (product.oferta && product.oferta > 0) {
    const precioOriginal = parseFloat(product.precio);
    const precioConDescuento = precioOriginal * (1 - product.oferta / 100);
    priceHTML = `
      <div class="mb-3">
        <p class="text-lg font-bold text-primary">${window.API.formatPrice(
          precioConDescuento
        )}</p>
        <p class="text-sm text-text-tertiary line-through">${window.API.formatPrice(
          precioOriginal
        )}</p>
      </div>
    `;
  }

  // Generar badges
  let badgesHTML = "";
  if (product.etiquetas && Array.isArray(product.etiquetas)) {
    badgesHTML = product.etiquetas
      .slice(0, 2)
      .map((etiqueta) => {
        let badgeClass = "bg-primary-light text-primary";
        const etiq = etiqueta.toLowerCase();
        if (etiq === "popular") badgeClass = "bg-warning text-white";
        else if (etiq === "orgánico" || etiq === "organico" || etiq === "eco")
          badgeClass = "bg-success text-white";
        else if (etiq === "profesional" || etiq === "premium")
          badgeClass = "bg-primary text-white";

        return `<span class="text-xs px-2 py-1 rounded font-medium ${badgeClass}">${etiqueta}</span>`;
      })
      .join(" ");
  }

  let offerBadgeHTML = "";
  if (product.oferta && product.oferta > 0) {
    offerBadgeHTML = `<span class="bg-accent text-white px-2 py-1 rounded text-xs font-medium">-${product.oferta}%</span>`;
  }

  card.innerHTML = `
    <div class="relative overflow-hidden rounded-t-lg">
      <img
        src="${image}"
        alt="${product.nombre}"
        class="w-full h-48 object-cover group-hover:scale-105 transition-transform"
        loading="lazy"
        onerror="this.src='${fallbackImage}'"
      />
      ${
        offerBadgeHTML
          ? `<div class="absolute top-2 right-2">${offerBadgeHTML}</div>`
          : ""
      }
      ${
        badgesHTML
          ? `<div class="absolute top-2 left-2 flex gap-1 flex-wrap">${badgesHTML}</div>`
          : ""
      }
    </div>
    <div class="p-4">
      <h3 class="font-semibold text-primary mb-2 line-clamp-2">${
        product.nombre
      }</h3>
      ${priceHTML}
      <a href="product_details.html?id=${
        product.id_producto
      }" class="btn-primary w-full text-center block">
        Ver Detalles
      </a>
    </div>
  `;

  return card;
}

// Función para configurar el botón de favoritos
async function setupFavoritoButton(productId) {
  const favoritoBtn = document.getElementById("favorito-btn");
  if (!favoritoBtn) return;

  try {
    // Verificar si ya es favorito
    const isFav = await window.API.Favoritos.isFavorito(productId);
    updateFavoritoButtonState(favoritoBtn, isFav);

    // Agregar evento click
    favoritoBtn.onclick = async (e) => {
      e.preventDefault();

      const userId = window.API.Carrito.getCurrentUserId();
      if (!userId) {
        window.API.Favoritos.showNotification(
          "⚠️ Debes iniciar sesión para agregar favoritos",
          "warning"
        );
        setTimeout(() => {
          window.location.href = "user_login.html";
        }, 1500);
        return;
      }

      try {
        // Deshabilitar botón mientras procesa
        favoritoBtn.disabled = true;

        const response = await window.API.Favoritos.toggleFavorito(productId);

        // Actualizar estado del botón
        updateFavoritoButtonState(favoritoBtn, response.data.isFavorito);

        // Mostrar notificación
        window.API.Favoritos.showNotification(response.message, "success");
      } catch (error) {
        console.error("Error al toggle favorito:", error);
        window.API.Favoritos.showNotification(
          "Error al procesar favorito",
          "error"
        );
      } finally {
        favoritoBtn.disabled = false;
      }
    };
  } catch (error) {
    console.error("Error al configurar botón de favoritos:", error);
  }
}

// Función para actualizar el estado visual del botón de favoritos
function updateFavoritoButtonState(button, isFavorito) {
  const icon = button.querySelector(".favorito-icon");

  if (isFavorito) {
    button.classList.remove("bg-white", "text-primary", "border-primary");
    button.classList.add("bg-accent", "text-white", "border-accent");
    button.title = "Eliminar de favoritos";
    if (icon) {
      icon.setAttribute("fill", "currentColor");
    }
  } else {
    button.classList.remove("bg-accent", "border-accent");
    button.classList.add("bg-white", "text-primary", "border-primary");
    button.title = "Agregar a favoritos";
    if (icon) {
      icon.setAttribute("fill", "none");
    }
  }
}

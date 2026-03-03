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
    initReviews(productId);
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
            precioConDescuento,
          )}</span>
          <span class="text-xl text-text-tertiary line-through">${window.API.formatPrice(
            precioOriginal,
          )}</span>
          <span class="bg-accent text-white px-3 py-1 rounded-full text-sm font-medium">-${
            producto.oferta
          }%</span>
          <span class="text-sm text-success font-medium">Ahorras ${window.API.formatPrice(
            ahorro,
          )}</span>
        `;
      } else {
        priceContainer.innerHTML = `
          <span id="product-price" class="text-3xl font-bold text-primary">${window.API.formatPrice(
            producto.precio || 0,
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
          ".bg-accent.text-white",
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
            "warning",
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

    // Calificaciones — se rellenan dinámicamente por initReviews()
    const ratingElement = document.getElementById("product-rating");
    const reviewsCount = document.getElementById("product-reviews-count");
    if (ratingElement) ratingElement.innerHTML = "☆☆☆☆☆";
    if (reviewsCount) reviewsCount.textContent = "(Sin reseñas)";

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
    product.precio || 0,
  )}</p>`;
  if (product.oferta && product.oferta > 0) {
    const precioOriginal = parseFloat(product.precio);
    const precioConDescuento = precioOriginal * (1 - product.oferta / 100);
    priceHTML = `
      <div class="mb-3">
        <p class="text-lg font-bold text-primary">${window.API.formatPrice(
          precioConDescuento,
        )}</p>
        <p class="text-sm text-text-tertiary line-through">${window.API.formatPrice(
          precioOriginal,
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
          "warning",
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
          "error",
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

// ==========================================================
// SISTEMA DE RESEÑAS Y VALORACIONES
// ==========================================================

const STAR_LABELS = [
  "",
  "Pésimo",
  "Regular",
  "Bueno",
  "Muy bueno",
  "Excelente",
];

/**
 * Genera HTML de estrellas rellenas/semirellenas/vacías
 * @param {number} rating - valor entre 0 y 5
 * @param {number} size   - tamaño en rem (por defecto 1)
 */
function renderStars(rating, size = 1) {
  let html = "";
  for (let i = 1; i <= 5; i++) {
    if (rating >= i) {
      html += `<span style="color:#f59e0b;font-size:${size}rem;">★</span>`;
    } else if (rating >= i - 0.5) {
      // semiestrella usando clip
      html += `<span style="color:#f59e0b;font-size:${size}rem;">★</span>`;
    } else {
      html += `<span style="color:#d1d5db;font-size:${size}rem;">★</span>`;
    }
  }
  return html;
}

/**
 * Inicia el módulo de reseñas para el producto dado
 */
function initReviews(productId) {
  // --- Star picker interactivo ---
  const starPicker = document.getElementById("star-picker");
  const ratingInput = document.getElementById("review-rating");
  const starLabel = document.getElementById("star-label");
  const stars = starPicker ? starPicker.querySelectorAll(".star-pick") : [];

  function paintPicker(val) {
    stars.forEach((s) => {
      s.style.color = parseInt(s.dataset.val) <= val ? "#f59e0b" : "#d1d5db";
      s.style.transform =
        parseInt(s.dataset.val) <= val ? "scale(1.2)" : "scale(1)";
    });
  }

  stars.forEach((star) => {
    star.addEventListener("mouseenter", () =>
      paintPicker(parseInt(star.dataset.val)),
    );
    star.addEventListener("click", () => {
      const val = parseInt(star.dataset.val);
      ratingInput.value = val;
      if (starLabel) starLabel.textContent = STAR_LABELS[val];
    });
  });

  if (starPicker) {
    starPicker.addEventListener("mouseleave", () =>
      paintPicker(parseInt(ratingInput?.value || 0)),
    );
  }

  // --- Envío del formulario ---
  const form = document.getElementById("review-form");
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      await submitReview(productId);
    });
  }

  // --- Determinar qué estado mostrar para el área del formulario ---
  setupReviewFormState(productId);

  // --- Cargar reseñas existentes ---
  loadResenas(productId);
}

/**
 * Muestra el estado correcto del formulario de reseñas:
 *  - No logueado → botón de login
 *  - Logueado + no compró → mensaje de compra requerida
 *  - Logueado + ya reseñó → mensaje de reseña existente
 *  - Logueado + compró + no reseñó → formulario activo
 */
async function setupReviewFormState(productId) {
  const stateNoLogin = document.getElementById("review-state-no-login");
  const stateNoPurchase = document.getElementById("review-state-no-purchase");
  const stateAlreadyReviewed = document.getElementById(
    "review-state-already-reviewed",
  );
  const form = document.getElementById("review-form");
  const authorDisplay = document.getElementById("review-author-display");

  // Ocultar todo primero
  [stateNoLogin, stateNoPurchase, stateAlreadyReviewed, form].forEach((el) => {
    if (el) el.classList.add("hidden");
  });

  const user = window.API?.Usuarios?.getUser?.();

  if (!user) {
    if (stateNoLogin) stateNoLogin.classList.remove("hidden");
    return;
  }

  try {
    const res = await fetch(
      `http://localhost:3000/api/productos/${productId}/puede-resenar?id_usuario=${user.id_usuario}`,
    );
    const json = await res.json();
    const { compro, yaReseno } = json.data || {};

    if (!compro) {
      if (stateNoPurchase) stateNoPurchase.classList.remove("hidden");
    } else if (yaReseno) {
      if (stateAlreadyReviewed) stateAlreadyReviewed.classList.remove("hidden");
    } else {
      // Puede reseñar → mostrar formulario con nombre del usuario
      if (form) form.classList.remove("hidden");
      if (authorDisplay) authorDisplay.textContent = user.nombre || user.email;
    }
  } catch (err) {
    console.error("❌ setupReviewFormState:", err);
    // En caso de error de red, al menos no mostrar nada incorrecto
    if (stateNoPurchase) stateNoPurchase.classList.remove("hidden");
  }
}

async function loadResenas(productId) {
  try {
    const res = await fetch(
      `http://localhost:3000/api/productos/${productId}/resenas`,
    );
    const json = await res.json();
    if (!json.success) throw new Error(json.message);

    renderRatingSummary(json.data.stats);
    renderReviewsList(json.data.resenas);
    updateHeaderRating(json.data.stats);
  } catch (err) {
    console.error("❌ loadResenas:", err);
  }
}

function updateHeaderRating(stats) {
  const ratingEl = document.getElementById("product-rating");
  const countEl = document.getElementById("product-reviews-count");
  if (!ratingEl || !countEl) return;

  if (stats.total === 0) {
    ratingEl.innerHTML = "<span style='color:#d1d5db;'>★★★★★</span>";
    countEl.textContent = "(Sin reseñas)";
  } else {
    ratingEl.innerHTML = renderStars(stats.promedio, 1.1);
    countEl.textContent = `(${stats.total} reseña${stats.total !== 1 ? "s" : ""}, ${stats.promedio}/5)`;
  }
}

function renderRatingSummary(stats) {
  const avgNum = document.getElementById("rating-avg-number");
  const avgStars = document.getElementById("rating-avg-stars");
  const totalLabel = document.getElementById("rating-total-label");
  const barsContainer = document.getElementById("rating-bars");

  if (!avgNum) return;

  if (stats.total === 0) {
    avgNum.textContent = "—";
    avgStars.innerHTML =
      "<span style='color:#d1d5db;font-size:1.5rem;'>★★★★★</span>";
    totalLabel.textContent = "Sin reseñas aún";
    if (barsContainer) barsContainer.innerHTML = "";
    return;
  }

  avgNum.textContent = stats.promedio.toFixed(1);
  avgStars.innerHTML = renderStars(stats.promedio, 1.4);
  totalLabel.textContent = `${stats.total} reseña${stats.total !== 1 ? "s" : ""}`;

  if (!barsContainer) return;
  barsContainer.innerHTML = "";

  for (let i = 5; i >= 1; i--) {
    const count = stats.distribucion[i] || 0;
    const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
    const bar = document.createElement("div");
    bar.className = "flex items-center gap-2";
    bar.innerHTML = `
      <span class="text-xs font-medium text-text-secondary w-6 text-right">${i}</span>
      <span style="color:#f59e0b;font-size:0.85rem;">★</span>
      <div class="flex-1 bg-surface-200 rounded-full h-2 overflow-hidden">
        <div class="h-2 rounded-full transition-all" style="width:${pct}%;background:#f59e0b;"></div>
      </div>
      <span class="text-xs text-text-secondary w-8">${count}</span>
    `;
    barsContainer.appendChild(bar);
  }
}

function renderReviewsList(resenas) {
  const list = document.getElementById("reviews-list");
  const empty = document.getElementById("reviews-empty");
  if (!list) return;

  list.innerHTML = "";

  if (!resenas || resenas.length === 0) {
    if (empty) empty.classList.remove("hidden");
    return;
  }

  if (empty) empty.classList.add("hidden");

  resenas.forEach((r) => {
    const card = document.createElement("div");
    card.className = "bg-surface-50 rounded-xl p-5 border border-border";

    const fecha = new Date(r.fecha_creacion).toLocaleDateString("es-CO", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const verificadoBadge = r.verificado
      ? `<span class="inline-flex items-center gap-1 text-xs font-medium text-success bg-success-50 px-2 py-0.5 rounded-full">
           <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
           Compra verificada
         </span>`
      : "";

    card.innerHTML = `
      <div class="flex items-start justify-between gap-3 mb-2">
        <div>
          <div class="flex items-center gap-2 flex-wrap">
            <span class="font-semibold text-text-primary">${escapeHtml(r.nombre_autor)}</span>
            ${verificadoBadge}
          </div>
          <div class="flex items-center gap-2 mt-1">
            <span>${renderStars(r.calificacion, 0.9)}</span>
            ${r.titulo ? `<span class="text-sm font-medium text-text-primary">${escapeHtml(r.titulo)}</span>` : ""}
          </div>
        </div>
        <span class="text-xs text-text-tertiary shrink-0">${fecha}</span>
      </div>
      ${r.comentario ? `<p class="text-sm text-text-secondary leading-relaxed mt-2">${escapeHtml(r.comentario)}</p>` : ""}
    `;
    list.appendChild(card);
  });
}

async function submitReview(productId) {
  const btn = document.getElementById("review-submit-btn");
  const msg = document.getElementById("review-form-msg");

  const rating = parseInt(document.getElementById("review-rating")?.value || 0);
  const titulo = document.getElementById("review-title")?.value.trim();
  const comentario = document.getElementById("review-comment")?.value.trim();

  // Validar calificación
  if (!rating || rating < 1)
    return showFormMsg("Selecciona una calificación", "error");

  // Obtener usuario logueado
  const user = window.API?.Usuarios?.getUser?.();
  if (!user) {
    return showFormMsg(
      "Debes iniciar sesión para publicar una reseña",
      "error",
    );
  }

  btn.disabled = true;
  btn.textContent = "Enviando...";

  try {
    const res = await fetch(
      `http://localhost:3000/api/productos/${productId}/resenas`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_usuario: user.id_usuario,
          calificacion: rating,
          titulo,
          comentario,
        }),
      },
    );
    const json = await res.json();

    if (!json.success) {
      showFormMsg(json.message || "Error al publicar", "error");
    } else {
      showFormMsg("¡Reseña publicada!", "success");
      // Ocultar formulario y mostrar estado "ya reseñó"
      setTimeout(() => {
        const form = document.getElementById("review-form");
        const stateAlreadyReviewed = document.getElementById(
          "review-state-already-reviewed",
        );
        if (form) form.classList.add("hidden");
        if (stateAlreadyReviewed)
          stateAlreadyReviewed.classList.remove("hidden");
      }, 1500);
      await loadResenas(productId);
    }
  } catch (err) {
    showFormMsg("Error de conexión con el servidor", "error");
    console.error(err);
  } finally {
    btn.disabled = false;
    btn.innerHTML = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg> Publicar reseña`;
  }
}

function showFormMsg(text, type) {
  const msg = document.getElementById("review-form-msg");
  if (!msg) return;
  msg.textContent = text;
  msg.className = `text-sm ${
    type === "success" ? "text-success" : "text-error"
  }`;
  msg.classList.remove("hidden");
  setTimeout(() => msg.classList.add("hidden"), 4000);
}

function escapeHtml(str) {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

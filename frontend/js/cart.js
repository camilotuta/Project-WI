// cart.js - Manejo del carrito de compras

// Variable global para almacenar descuento aplicado
let descuentoAplicado = null;

// ========== CARGAR CARRITO ==========
async function loadCart() {
  console.log("🛒 Cargando carrito...");

  const user = window.API.Usuarios.getUser();

  if (!user || !user.id_usuario) {
    console.warn("⚠️ Usuario no autenticado, redirigiendo a login...");
    showEmptyCart("Debes iniciar sesión para ver tu carrito");
    setTimeout(() => {
      window.location.href = "user_login.html";
    }, 2000);
    return;
  }

  try {
    const cartItems = await window.API.Carrito.get(user.id_usuario);
    console.log("✅ Carrito obtenido en loadCart():", cartItems);
    console.log("✅ Tipo:", typeof cartItems);
    console.log("✅ Es array?:", Array.isArray(cartItems));
    console.log("✅ Longitud:", cartItems?.length);

    if (!cartItems || cartItems.length === 0) {
      console.warn("⚠️ Carrito vacío, mostrando mensaje");
      showEmptyCart();
      return;
    }

    console.log("🎨 Renderizando items del carrito...");
    renderCartItems(cartItems);
    renderCartTotals(cartItems);

    // Actualizar contador del carrito en navbar
    if (window.updateCartCount) {
      window.updateCartCount();
    }
  } catch (error) {
    console.error("❌ Error cargando carrito:", error);
    showEmptyCart("Error al cargar el carrito");
  }
}

// ========== RENDERIZAR ITEMS DEL CARRITO ==========
function renderCartItems(items) {
  const container = document.getElementById("cart-items");

  if (!container) {
    console.error("❌ Contenedor cart-items no encontrado");
    return;
  }

  container.innerHTML = "";

  items.forEach((item) => {
    const imageUrl = window.getImageUrl(item.imagen_url || item.imagen);
    const precioUnitario = parseFloat(item.precio);
    const subtotal = precioUnitario * parseInt(item.cantidad);

    const itemHTML = `
      <div class="card p-6 cart-item" data-cart-id="${item.id_carrito}">
        <div class="flex flex-col sm:flex-row gap-4">
          <!-- Product Image -->
          <div class="flex-shrink-0">
            <div class="w-24 h-24 sm:w-32 sm:h-32 rounded-lg overflow-hidden">
              <img
                src="${imageUrl}"
                alt="${item.nombre}"
                class="w-full h-full object-cover"
                onerror="this.src='https://img.freepik.com/vector-premium/vector-icono-imagen-predeterminado-pagina-imagen-faltante-diseno-sitio-web-o-aplicacion-movil-no-hay-foto-disponible_87543-11093.jpg'"
              />
            </div>
          </div>

          <!-- Product Details -->
          <div class="flex-1">
            <div class="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
              <div class="flex-1">
                <h3 class="font-heading font-semibold text-primary mb-1">
                  <a href="product_details.html?id=${item.id_producto}" 
                     class="hover:text-primary-600 transition-micro">
                    ${item.nombre}
                  </a>
                </h3>
                <p class="text-sm text-text-secondary mb-2 line-clamp-2">
                  ${item.descripcion || "Sin descripción"}
                </p>
              </div>

              <!-- Desktop Price -->
              <div class="hidden sm:block text-right">
                <span class="text-lg font-bold text-primary">
                  $${precioUnitario.toLocaleString("es-CO")} COP
                </span>
              </div>
            </div>

            <!-- Quantity and Actions -->
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-4">
              <!-- Quantity Controls -->
              <div class="flex items-center space-x-3">
                <span class="text-sm text-text-secondary">Cantidad:</span>
                <div class="flex items-center border border-border rounded-lg">
                  <button
                    class="p-2 hover:bg-surface-100 transition-micro"
                    onclick="updateCartQuantity(${item.id_carrito}, ${
                      item.cantidad - 1
                    })"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path>
                    </svg>
                  </button>
                  <input
                    type="number"
                    value="${item.cantidad}"
                    min="1"
                    max="99"
                    class="w-16 text-center border-0 focus:outline-none"
                    onchange="updateCartQuantity(${
                      item.id_carrito
                    }, this.value)"
                  />
                  <button
                    class="p-2 hover:bg-surface-100 transition-micro"
                    onclick="updateCartQuantity(${item.id_carrito}, ${
                      item.cantidad + 1
                    })"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Subtotal and Remove -->
              <div class="flex items-center justify-between sm:justify-end gap-4">
                <div class="text-right">
                  <div class="text-sm text-text-tertiary">Subtotal</div>
                  <div class="text-lg font-bold text-primary">$${subtotal.toLocaleString(
                    "es-CO",
                  )} COP</div>
                </div>
                <button
                  class="text-error hover:text-error-dark transition-micro p-2"
                  onclick="removeFromCart(${item.id_carrito})"
                  title="Eliminar producto"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    container.insertAdjacentHTML("beforeend", itemHTML);
  });
}

// ========== RENDERIZAR TOTALES ==========
function renderCartTotals(items) {
  const subtotal = items.reduce((sum, item) => {
    return sum + parseFloat(item.precio) * parseInt(item.cantidad);
  }, 0);

  // Calcular descuento según cupón aplicado
  let discount = 0;
  if (descuentoAplicado && descuentoAplicado.monto) {
    discount = descuentoAplicado.monto;
  }

  // Envío gratis si subtotal > 200,000 COP
  const shipping = subtotal > 200000 ? 0 : 15000;

  // IVA del 19%
  const tax = subtotal * 0.19;

  // Total
  const total = subtotal - discount + shipping + tax;

  console.log("💰 Totales calculados:", {
    subtotal: `$${subtotal.toLocaleString("es-CO")}`,
    discount: `$${discount.toLocaleString("es-CO")}`,
    shipping:
      shipping === 0 ? "GRATIS" : `$${shipping.toLocaleString("es-CO")}`,
    tax: `$${tax.toLocaleString("es-CO")}`,
    total: `$${total.toLocaleString("es-CO")}`,
  });

  // Actualizar subtotal
  const subtotalEl = document.getElementById("subtotal");
  if (subtotalEl) {
    subtotalEl.textContent = `$${subtotal.toLocaleString("es-CO")} COP`;
    console.log("✅ Subtotal actualizado");
  }

  // Actualizar descuento
  const discountEl = document.getElementById("discount");
  if (discountEl) {
    if (discount > 0) {
      discountEl.textContent = `-$${discount.toLocaleString("es-CO")} COP`;
      discountEl.parentElement.classList.remove("hidden");
    } else {
      discountEl.parentElement.classList.add("hidden");
    }
  }

  // Actualizar IVA
  const taxEl = document.getElementById("tax");
  if (taxEl) {
    taxEl.textContent = `$${tax.toLocaleString("es-CO")} COP`;
    console.log("✅ Tax actualizado");
  }

  // Actualizar total
  const totalEl = document.getElementById("total");
  if (totalEl) {
    totalEl.textContent = `$${total.toLocaleString("es-CO")} COP`;
    console.log("✅ Total actualizado");
  }

  // Actualizar envío manualmente
  const shippingElements = document.querySelectorAll(".flex.justify-between");
  shippingElements.forEach((el) => {
    const label = el.querySelector(".text-text-secondary");
    if (label && label.textContent.trim() === "Envío") {
      const value = el.querySelector(".font-medium, .text-success");
      if (value) {
        if (shipping === 0) {
          value.textContent = "GRATIS";
          value.className = "text-success font-medium";
        } else {
          value.textContent = `$${shipping.toLocaleString("es-CO")} COP`;
          value.className = "font-medium";
        }
        console.log("✅ Envío actualizado");
      }
    }
  });

  // Actualizar texto del subtotal con cantidad de productos
  const subtotalLabelElements = document.querySelectorAll(
    ".flex.justify-between",
  );
  subtotalLabelElements.forEach((el) => {
    const label = el.querySelector(".text-text-secondary");
    if (label && label.textContent.includes("Subtotal")) {
      const totalItems = items.reduce(
        (sum, item) => sum + parseInt(item.cantidad),
        0,
      );
      label.textContent = `Subtotal (${totalItems} ${
        totalItems === 1 ? "producto" : "productos"
      })`;
    }
  });
}

// ========== MOSTRAR CARRITO VACÍO ==========
function showEmptyCart(message = null) {
  const container = document.getElementById("cart-items");
  const cartContent = document.getElementById("cart-content");

  if (container) {
    container.innerHTML = `
      <div class="col-span-full text-center py-12">
        <div class="text-6xl mb-4">🛒</div>
        <h3 class="text-xl font-heading font-semibold text-primary mb-2">
          ${message || "Tu carrito está vacío"}
        </h3>
        <p class="text-text-secondary mb-6">
          Agrega productos para comenzar tu compra
        </p>
        <a href="product_catalog.html" class="btn-primary inline-block">
          Explorar Productos
        </a>
      </div>
    `;
  }

  // Ocultar el resumen si existe
  if (cartContent) {
    const summary = cartContent.querySelector(".lg\\:col-span-1");
    if (summary) summary.style.display = "none";
  }
}

// ========== ACTUALIZAR CANTIDAD ==========
async function updateCartQuantity(id_carrito, newQuantity) {
  const qty = parseInt(newQuantity);

  if (qty < 1) {
    removeFromCart(id_carrito);
    return;
  }

  if (qty > 99) {
    window.API.Carrito.showNotification("Cantidad máxima: 99", "warning");
    return;
  }

  try {
    console.log(`📝 Actualizando cantidad: ${id_carrito} -> ${qty}`);
    await window.API.Carrito.updateQuantity(id_carrito, qty);
    await loadCart(); // Recargar carrito completo
  } catch (error) {
    console.error("❌ Error actualizando cantidad:", error);
    window.API.Carrito.showNotification(
      "Error al actualizar cantidad",
      "error",
    );
  }
}

// ========== ELIMINAR DEL CARRITO ==========
async function removeFromCart(cartId) {
  try {
    console.log(`🗑️ Eliminando del carrito: ${cartId}`);
    await window.API.Carrito.remove(cartId);

    // Mostrar notificación de éxito
    window.API.Carrito.showNotification(
      "✅ Producto eliminado del carrito",
      "success",
    );

    await loadCart(); // Recargar carrito completo
  } catch (error) {
    console.error("❌ Error eliminando del carrito:", error);
    window.API.Carrito.showNotification(
      "❌ Error al eliminar producto",
      "error",
    );
  }
}

// ========== VACIAR CARRITO ==========
async function clearCart() {
  const user = window.API.Usuarios.getUser();

  if (!user) return;

  try {
    await window.API.Carrito.clear(user.id_usuario);

    // Mostrar notificación de éxito
    window.API.Carrito.showNotification(
      "✅ Carrito vaciado correctamente",
      "success",
    );

    await loadCart();
  } catch (error) {
    console.error("❌ Error vaciando carrito:", error);
    window.API.Carrito.showNotification(
      "❌ Error al vaciar el carrito",
      "error",
    );
  }
}

// ========== PROCEDER AL CHECKOUT ==========
async function proceedToCheckout() {
  const user = window.API.Usuarios.getUser();

  if (!user) {
    window.API.Carrito.showNotification(
      "⚠️ Debes iniciar sesión para finalizar tu compra",
      "warning",
    );
    setTimeout(() => {
      window.location.href = "user_login.html";
    }, 1500);
    return;
  }

  const btn = document.querySelector("[onclick='proceedToCheckout()']");
  if (btn) {
    btn.disabled = true;
    btn.textContent = "Procesando...";
  }

  try {
    const response = await fetch("http://localhost:3000/api/pedidos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id_usuario: user.id_usuario }),
    });

    const json = await response.json();

    if (json.success) {
      window.API.Carrito.showNotification(
        "✅ ¡Pedido confirmado! Gracias por tu compra.",
        "success",
      );
      // Actualizar contador del carrito en el navbar
      if (window.updateCartCount) window.updateCartCount();
      // Redirigir al perfil del usuario tras 2 segundos
      setTimeout(() => {
        window.location.href = "user_profile.html";
      }, 2000);
    } else {
      window.API.Carrito.showNotification(
        `❌ ${json.message || "Error al procesar el pedido"}`,
        "error",
      );
      if (btn) {
        btn.disabled = false;
        btn.textContent = "Finalizar Compra";
      }
    }
  } catch (error) {
    console.error("❌ Error en checkout:", error);
    window.API.Carrito.showNotification(
      "❌ Error de conexión con el servidor",
      "error",
    );
    if (btn) {
      btn.disabled = false;
      btn.textContent = "Finalizar Compra";
    }
  }
}

// ========== APLICAR CUPÓN DE DESCUENTO ==========
async function aplicarCupon() {
  const inputCodigo = document.getElementById("discount-code");
  const codigo = inputCodigo?.value?.trim();

  if (!codigo) {
    window.API.Carrito.showNotification(
      "❌ Por favor ingresa un código de descuento",
      "error",
    );
    return;
  }

  try {
    // Obtener subtotal actual
    const user = window.API.Usuarios.getUser();
    const cartItems = await window.API.Carrito.get(user.id_usuario);
    const subtotal = cartItems.reduce((sum, item) => {
      return sum + parseFloat(item.precio) * parseInt(item.cantidad);
    }, 0);

    console.log("🎟️ Validando cupón:", codigo, "con subtotal:", subtotal);

    // Validar cupón
    const resultado = await window.API.Descuentos.validarCodigo(
      codigo,
      subtotal,
    );

    if (resultado.success) {
      // Guardar descuento aplicado
      descuentoAplicado = resultado.descuento;

      // Mostrar mensaje de éxito
      const mensajeEl = document.getElementById("discount-message");
      if (mensajeEl) {
        const valorStr =
          descuentoAplicado.tipo === "porcentaje"
            ? `${descuentoAplicado.valor}%`
            : `$${descuentoAplicado.monto.toLocaleString("es-CO")} COP`;

        mensajeEl.innerHTML = `
          <p class="text-sm text-success">
            ✓ ${descuentoAplicado.descripcion} - Descuento: ${valorStr}
          </p>
        `;
        mensajeEl.classList.remove("hidden");
      }

      // Deshabilitar input y botón
      if (inputCodigo) {
        inputCodigo.disabled = true;
      }
      const btnAplicar = document.getElementById("apply-discount");
      if (btnAplicar) {
        btnAplicar.textContent = "Aplicado ✓";
        btnAplicar.disabled = true;
        btnAplicar.classList.add("opacity-50", "cursor-not-allowed");
      }

      // Recalcular totales
      renderCartTotals(cartItems);

      window.API.Carrito.showNotification(
        "✅ Cupón aplicado correctamente",
        "success",
      );
    } else {
      window.API.Carrito.showNotification(
        resultado.mensaje || "❌ Cupón no válido",
        "error",
      );

      // Limpiar mensaje si existía
      const mensajeEl = document.getElementById("discount-message");
      if (mensajeEl) {
        mensajeEl.classList.add("hidden");
      }
    }
  } catch (error) {
    console.error("❌ Error aplicando cupón:", error);
    window.API.Carrito.showNotification(
      "❌ Error al validar el cupón",
      "error",
    );
  }
}

// ========== REMOVER CUPÓN ==========
function removerCupon() {
  descuentoAplicado = null;

  // Resetear input y botón
  const inputCodigo = document.getElementById("discount-code");
  if (inputCodigo) {
    inputCodigo.value = "";
    inputCodigo.disabled = false;
  }

  const btnAplicar = document.getElementById("apply-discount");
  if (btnAplicar) {
    btnAplicar.textContent = "Aplicar";
    btnAplicar.disabled = false;
    btnAplicar.classList.remove("opacity-50", "cursor-not-allowed");
  }

  // Ocultar mensaje
  const mensajeEl = document.getElementById("discount-message");
  if (mensajeEl) {
    mensajeEl.classList.add("hidden");
  }

  // Recalcular totales
  loadCart();

  window.API.Carrito.showNotification("Cupón removido", "info");
}

// Exportar funciones globalmente
window.aplicarCupon = aplicarCupon;
window.removerCupon = removerCupon;

// ========== PRODUCTOS RECOMENDADOS ==========
async function loadRecommendedProducts() {
  try {
    const response = await fetch(
      "http://localhost:3000/api/productos/random?limit=4",
    );
    const data = await response.json();

    if (data.success && data.data) {
      renderRecommendedProducts(data.data);
    }
  } catch (error) {
    console.error("❌ Error cargando productos recomendados:", error);
    const container = document.getElementById("recommended-products");
    if (container) {
      container.innerHTML = `
        <div class="col-span-full text-center py-8 text-text-secondary">
          No se pudieron cargar las recomendaciones
        </div>
      `;
    }
  }
}

function renderRecommendedProducts(products) {
  const container = document.getElementById("recommended-products");
  if (!container) {
    console.warn("⚠️ Contenedor de recomendaciones no encontrado");
    return;
  }

  console.log("✅ Renderizando", products.length, "productos recomendados");

  container.innerHTML = products
    .map((product) => {
      const imageUrl = window.getImageUrl(product.imagen_url || product.imagen);
      const precio = parseFloat(product.precio);

      // Generar badges
      let badgesHTML = "";
      if (product.etiquetas && Array.isArray(product.etiquetas)) {
        const primeraEtiqueta = product.etiquetas[0];
        let badgeClass = "badge-success";
        const etiq = primeraEtiqueta.toLowerCase();

        if (etiq === "popular") {
          badgeClass = "badge-warning";
        } else if (etiq === "profesional") {
          badgeClass =
            "bg-primary text-white px-2 py-1 rounded text-xs font-medium";
        } else if (etiq === "eco") {
          badgeClass = "badge-success";
        } else if (etiq === "premium") {
          badgeClass =
            "bg-secondary text-white px-2 py-1 rounded text-xs font-medium";
        } else if (etiq === "orgánico" || etiq === "organico") {
          badgeClass = "badge-success";
        } else if (etiq === "natural") {
          badgeClass =
            "bg-success-light text-success px-2 py-1 rounded text-xs font-medium";
        }

        badgesHTML = `<span class="${badgeClass}">${primeraEtiqueta}</span>`;
      }

      return `
      <div class="card group hover:shadow-organic-hover transition-state">
        <div class="relative overflow-hidden rounded-t-lg">
          <img
            src="${imageUrl}"
            alt="${product.nombre}"
            class="w-full h-48 object-cover group-hover:scale-105 transition-state"
            loading="lazy"
            onerror="this.src='https://img.freepik.com/vector-premium/vector-icono-imagen-predeterminado-pagina-imagen-faltante-diseno-sitio-web-o-aplicacion-movil-no-hay-foto-disponible_87543-11093.jpg'"
          />
          <div class="absolute top-2 left-2">
            ${badgesHTML}
          </div>
        </div>
        <div class="p-4">
          <h3 class="font-heading font-semibold text-primary mb-2 line-clamp-2">
            ${product.nombre}
          </h3>
          <p class="text-sm text-text-secondary mb-3 line-clamp-2">
            ${product.descripcion || ""}
          </p>
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center space-x-2">
              <span class="text-lg font-bold text-primary">$${precio.toLocaleString(
                "es-CO",
              )} COP</span>
            </div>
          </div>
          <button
            class="w-full btn-primary py-2 px-4 rounded-lg font-medium transition-micro recommended-add-btn"
            data-product-id="${product.id_producto}"
          >
            🛒 Añadir al Carrito
          </button>
        </div>
      </div>
    `;
    })
    .join("");

  // Agregar event listeners a los botones
  container.querySelectorAll(".recommended-add-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const productId = this.getAttribute("data-product-id");
      addRecommendedToCart(parseInt(productId));
    });
  });
}

// Agregar producto recomendado al carrito
async function addRecommendedToCart(productId) {
  console.log("🛒 Agregando producto recomendado:", productId);

  try {
    // Obtener usuario
    const user = window.API.Usuarios.getUser();
    if (!user || !user.id_usuario) {
      window.API.Carrito.showNotification(
        "⚠️ Debes iniciar sesión para agregar productos",
        "warning",
      );
      setTimeout(() => {
        window.location.href = "user_login.html";
      }, 2000);
      return;
    }

    // Obtener producto
    const response = await fetch(
      `http://localhost:3000/api/productos/${productId}`,
    );
    const data = await response.json();

    if (data.success && data.data) {
      console.log("✅ Producto obtenido:", data.data);

      // Agregar al carrito
      await window.API.Carrito.add(user.id_usuario, productId, 1);

      // Recargar carrito y actualizar contador
      await loadCart();
      if (window.updateCartCount) {
        await window.updateCartCount();
      }

      window.API.Carrito.showNotification(
        `✅ ${data.data.nombre} agregado al carrito`,
        "success",
      );
    }
  } catch (error) {
    console.error("❌ Error agregando producto recomendado:", error);
    window.API.Carrito.showNotification(
      "❌ Error al agregar producto",
      "error",
    );
  }
}

window.addRecommendedToCart = addRecommendedToCart;

// ========== INICIALIZAR ==========
document.addEventListener("DOMContentLoaded", () => {
  console.log("🚀 Inicializando carrito...");
  loadCart();
  loadRecommendedProducts();
});

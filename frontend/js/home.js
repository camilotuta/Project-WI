// js/home.js - Carga de productos en homepage

// Cargar productos cuando la página carga
document.addEventListener("DOMContentLoaded", async () => {
  console.log("📄 Home.js cargando...");
  try {
    await loadFeaturedProductsCarousel();
    initializeAccordions();
  } catch (error) {
    console.error("❌ Error en inicialización:", error);
  }
});

/**
 * Cargar productos destacados en el carrusel
 */
async function loadFeaturedProductsCarousel() {
  try {
    console.log("📦 Cargando productos destacados para carrusel...");

    const carouselTrack = document.querySelector("#carousel-track");

    if (!carouselTrack) {
      console.error("❌ No se encontró el contenedor del carrusel");
      return;
    }

    console.log("✅ Carrusel encontrado");

    // Obtener TODOS los productos destacados desde API (sin límite)
    const response = await window.API.Productos.getFeatured(100); // Límite alto para obtener todos

    if (!response || !response.data || response.data.length === 0) {
      console.error("❌ No hay productos destacados");
      return;
    }

    const productos = response.data;
    console.log(`✅ ${productos.length} productos destacados obtenidos`);

    // Limpiar carrusel
    carouselTrack.innerHTML = "";

    // Agregar productos al carrusel
    productos.forEach((producto) => {
      const slide = createCarouselSlide(producto);
      carouselTrack.appendChild(slide);
    });

    // Inicializar controles del carrusel
    initializeCarousel(productos.length);

    console.log(`✅ Carrusel inicializado con ${productos.length} productos`);
  } catch (error) {
    console.error("❌ Error cargando carrusel:", error);
  }
}

/**
 * Crear slide del carrusel
 */
function createCarouselSlide(producto) {
  const slide = document.createElement("div");
  slide.className = "flex-shrink-0 w-1/2 lg:w-1/3 xl:w-1/4";

  const imageSrc = window.getImageUrl(producto.imagen_url || producto.imagen);
  const priceFormatted =
    window.API?.formatPrice?.(producto.precio) ||
    `$${parseFloat(producto.precio || 0).toFixed(2)}`;

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

  slide.innerHTML = `
    <div class="card group hover:shadow-organic-hover transition-state h-full">
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
      <div class="p-5">
        <h3 class="text-lg font-heading font-bold text-text-primary mb-2 line-clamp-1">${
          producto.nombre || "Sin nombre"
        }</h3>
        <p class="text-sm text-text-secondary mb-4 line-clamp-2">${(
          producto.descripcion || ""
        ).substring(0, 60)}...</p>
        <div class="flex items-center justify-between mb-4">
          ${priceHTML}
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
            Ver
          </a>
        </div>
      </div>
    </div>
  `;

  return slide;
}

/**
 * Inicializar controles del carrusel
 */
function initializeCarousel(totalProducts) {
  const track = document.querySelector("#carousel-track");
  const prevBtn = document.querySelector("#carousel-prev");
  const nextBtn = document.querySelector("#carousel-next");
  const indicatorsContainer = document.querySelector("#carousel-indicators");

  if (!track || !prevBtn || !nextBtn) {
    console.warn("⚠️ Controles del carrusel no encontrados");
    return;
  }

  let currentIndex = 0;

  // Calcular slides por vista según ancho de pantalla
  function getSlidesPerView() {
    const width = window.innerWidth;
    if (width < 1024) return 2; // móvil y tablet: 2 productos
    if (width < 1280) return 3; // desktop pequeño: 3 productos
    return 4; // desktop grande: 4 productos
  }

  let slidesPerView = getSlidesPerView();
  const maxIndex = totalProducts - 1; // Índice máximo para scroll infinito

  // Crear indicadores
  function createIndicators() {
    if (!indicatorsContainer) return;

    const totalPages = Math.ceil(totalProducts / slidesPerView);
    indicatorsContainer.innerHTML = "";

    for (let i = 0; i < totalPages; i++) {
      const indicator = document.createElement("button");
      indicator.className = `h-2 rounded-full transition-all ${
        i === 0 ? "bg-primary w-8" : "bg-surface-300 w-2"
      }`;
      indicator.setAttribute("aria-label", `Ir a página ${i + 1}`);
      indicator.addEventListener("click", () => {
        currentIndex = i * slidesPerView;
        if (currentIndex > maxIndex) currentIndex = 0;
        updateCarousel();
      });
      indicatorsContainer.appendChild(indicator);
    }
  }

  function updateCarousel() {
    const slideWidth = track.children[0]?.offsetWidth || 0;
    const gap = 24; // 6 * 4px (gap-6 = 1.5rem = 24px)
    const offset = currentIndex * (slideWidth + gap);

    track.style.transform = `translateX(-${offset}px)`;

    // Los botones siempre están habilitados para scroll infinito
    prevBtn.disabled = false;
    nextBtn.disabled = false;

    // Actualizar indicadores
    if (indicatorsContainer) {
      const indicators = indicatorsContainer.querySelectorAll("button");
      const currentPage = Math.floor(currentIndex / slidesPerView);

      indicators.forEach((indicator, index) => {
        if (index === currentPage) {
          indicator.className =
            "h-2 w-8 rounded-full transition-all bg-primary";
        } else {
          indicator.className =
            "h-2 w-2 rounded-full transition-all bg-surface-300";
        }
      });
    }
  }

  // Eventos de navegación con scroll infinito
  prevBtn.addEventListener("click", () => {
    if (currentIndex > 0) {
      currentIndex--;
    } else {
      // Al llegar al inicio, ir al final
      currentIndex = maxIndex;
    }
    updateCarousel();
  });

  nextBtn.addEventListener("click", () => {
    if (currentIndex < maxIndex) {
      currentIndex++;
    } else {
      // Al llegar al final, volver al inicio
      currentIndex = 0;
    }
    updateCarousel();
  });

  // Inicializar
  createIndicators();
  updateCarousel();

  // Auto-play con scroll infinito
  let autoplayInterval = setInterval(() => {
    if (currentIndex < maxIndex) {
      currentIndex++;
    } else {
      currentIndex = 0;
    }
    updateCarousel();
  }, 3000);

  // Pausar autoplay al hover
  track.addEventListener("mouseenter", () => clearInterval(autoplayInterval));
  track.addEventListener("mouseleave", () => {
    clearInterval(autoplayInterval);
    autoplayInterval = setInterval(() => {
      if (currentIndex < maxIndex) {
        currentIndex++;
      } else {
        currentIndex = 0;
      }
      updateCarousel();
    }, 3000);
  });

  // Responsive: actualizar al cambiar tamaño de ventana
  let resizeTimeout;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      const newSlidesPerView = getSlidesPerView();
      if (newSlidesPerView !== slidesPerView) {
        slidesPerView = newSlidesPerView;
        currentIndex = 0;
        createIndicators();
        updateCarousel();
      }
    }, 250);
  });

  console.log(
    `✅ Carrusel configurado: ${totalProducts} productos, mostrando ${slidesPerView} a la vez (infinito)`
  );
}

/**
 * Inicializar acordeones
 */
function initializeAccordions() {
  const accordionButtons = document.querySelectorAll(".accordion-button");

  accordionButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const targetId = button.getAttribute("data-accordion");
      const content = document.getElementById(targetId);
      const icon = button.querySelector(".accordion-icon");

      if (!content) return;

      // Verificar si está abierto usando la clase o el estilo
      const isOpen =
        content.classList.contains("open") ||
        (content.style.maxHeight &&
          content.style.maxHeight !== "0px" &&
          content.style.maxHeight !== "");

      // Cerrar todos los acordeones
      document.querySelectorAll(".accordion-content").forEach((item) => {
        item.style.maxHeight = "0px";
        item.classList.remove("open");
      });

      document.querySelectorAll(".accordion-icon").forEach((ic) => {
        ic.style.transform = "rotate(0deg)";
      });

      // Abrir el acordeón clickeado si estaba cerrado
      if (!isOpen) {
        content.style.maxHeight = content.scrollHeight + "px";
        content.classList.add("open");
        icon.style.transform = "rotate(180deg)";
      }
    });
  });

  // Asegurarse de que todos estén cerrados al iniciar
  document.querySelectorAll(".accordion-content").forEach((content) => {
    content.style.maxHeight = "0px";
    content.classList.remove("open");
  });

  document.querySelectorAll(".accordion-icon").forEach((icon) => {
    icon.style.transform = "rotate(0deg)";
  });

  console.log("✅ Acordeones inicializados");
}

/**
 * Cargar productos destacados (legacy - mantener para compatibilidad)
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

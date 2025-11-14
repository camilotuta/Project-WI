// Menú móvil
const menuToggle = document.getElementById("menuToggle");
const mainNav = document.getElementById("mainNav");

if (menuToggle && mainNav) {
  menuToggle.addEventListener("click", () => {
    mainNav.classList.toggle("active");
    menuToggle.classList.toggle("active");
  });
}

// Navegación suave
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      mainNav.classList.remove("active");
      menuToggle.classList.remove("active");
    }
  });
});

// Destacar enlace activo en navegación
window.addEventListener("scroll", () => {
  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll(".nav-link");

  let currentSection = "";
  sections.forEach((section) => {
    const sectionTop = section.offsetTop - 100;
    if (window.scrollY >= sectionTop) {
      currentSection = section.getAttribute("id");
    }
  });

  navLinks.forEach((link) => {
    link.classList.remove("active");
    if (link.getAttribute("href") === `#${currentSection}`) {
      link.classList.add("active");
    }
  });
});

// ========== FUNCIONES DE CARRITO DESHABILITADAS ==========
// Ahora se maneja en navbar.js y api.js
//
// function updateCartCount() { ... }
// function addToCart(productName, price) { ... }
// function showNotification(message) { ... }

// Event listeners para botones de agregar al carrito
document.querySelectorAll(".add-to-cart").forEach((button) => {
  button.addEventListener("click", function (e) {
    e.preventDefault();
    const productCard = this.closest(".product-card, .supplement-card");
    const productName = productCard.querySelector("h3, h4").textContent;
    const priceElement = productCard.querySelector(".current-price, .price");
    const price = priceElement ? priceElement.textContent : "$0.00";

    addToCart(productName, price);
  });
});

// Funcionalidad de tabs para equipos
const tabButtons = document.querySelectorAll(".tab-btn");
const equipmentGrids = document.querySelectorAll(".equipment-grid");

tabButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const category = button.getAttribute("data-category");

    // Remover clase active de todos los tabs y grids
    tabButtons.forEach((btn) => btn.classList.remove("active"));
    equipmentGrids.forEach((grid) => grid.classList.remove("active"));

    // Agregar clase active al tab y grid correspondiente
    button.classList.add("active");
    document
      .querySelector(`[data-category="${category}"].equipment-grid`)
      .classList.add("active");
  });
});

// Animación de estadísticas
const observerOptions = {
  threshold: 0.5,
  rootMargin: "0px 0px -100px 0px",
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      const stats = entry.target.querySelectorAll(".stat-number");
      stats.forEach((stat) => {
        const finalValue = parseInt(stat.textContent);
        let currentValue = 0;
        const increment = finalValue / 50;

        const counter = setInterval(() => {
          currentValue += increment;
          if (currentValue >= finalValue) {
            stat.textContent = finalValue.toLocaleString();
            clearInterval(counter);
          } else {
            stat.textContent = Math.floor(currentValue).toLocaleString();
          }
        }, 30);
      });
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

const statsSection = document.querySelector(".stats");
if (statsSection) {
  observer.observe(statsSection);
}

// Función de actualizar carrito - delegada a API
function updateCartCount() {
  if (window.API?.Carrito?.updateCartUI) {
    window.API.Carrito.updateCartUI();
  }
}

// Inicializar carrito
if (typeof updateCartCount === "function") {
  updateCartCount();
}

// Mobile menu toggle
const mobileMenuButton = document.getElementById("mobile-menu-button");
const mobileMenu = document.getElementById("mobile-menu");

if (mobileMenuButton && mobileMenu) {
  mobileMenuButton.addEventListener("click", function () {
    mobileMenu.classList.toggle("hidden");
  });
  console.log("✅ Mobile menu configurado");
} else {
  console.warn("⚠️ Mobile menu elements not found");
}

// Search functionality
const searchInput = document.getElementById("search-input");
const searchButton = document.getElementById("search-button");

if (searchInput && searchButton) {
  searchButton.addEventListener("click", function () {
    const searchTerm = searchInput.value.trim();
    if (searchTerm) {
      window.location.href = `./product_catalog.html?search=${encodeURIComponent(
        searchTerm
      )}`;
    }
  });

  searchInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      searchButton.click();
    }
  });
  console.log("✅ Search configurado");
} else {
  console.warn("⚠️ Search elements not found");
}

// Cart UI update
async function initializeCartUI() {
  if (window.API?.Carrito?.updateCartUI) {
    await window.API.Carrito.updateCartUI();
    console.log("✅ Cart UI inicializado");
  } else {
    console.warn("⚠️ API Carrito no disponible");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  console.log("📄 Script.js inicializado");
  initializeCartUI();
});

// Función para verificar si el usuario está logueado
function isUserLoggedIn() {
  const user = localStorage.getItem("currentUser");
  return !!user;
}

// Función para obtener el usuario actual
function getCurrentUser() {
  const userJson = localStorage.getItem("currentUser");
  return userJson ? JSON.parse(userJson) : null;
}

// Exportar globalmente
window.isUserLoggedIn = isUserLoggedIn;
window.getCurrentUser = getCurrentUser;
window.initializeCartUI = initializeCartUI;

console.log("✅ script.js cargado completamente");

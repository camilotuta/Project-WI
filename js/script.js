// Variables globales
let cart = [];
let cartCount = 0;

// Menú móvil
const menuToggle = document.getElementById("menuToggle");
const mainNav = document.getElementById("mainNav");

menuToggle.addEventListener("click", () => {
  mainNav.classList.toggle("active");
  menuToggle.classList.toggle("active");
});

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

// Funcionalidad de carrito
function updateCartCount() {
  const cartCountElement = document.querySelector(".cart-count");
  cartCountElement.textContent = cartCount;
}

function addToCart(productName, price) {
  cart.push({ name: productName, price: price });
  cartCount++;
  updateCartCount();

  // Mostrar notificación
  showNotification(`${productName} agregado al carrito`);
}

function showNotification(message) {
  const notification = document.createElement("div");
  notification.className = "notification";
  notification.textContent = message;
  notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: var(--accent-color, #10b981);
                color: white;
                padding: 1rem 1.5rem;
                border-radius: 0.5rem;
                z-index: 10000;
                transform: translateX(100%);
                transition: transform 0.3s ease;
            `;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.transform = "translateX(0)";
  }, 100);

  setTimeout(() => {
    notification.style.transform = "translateX(100%)";
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
}

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

// Inicializar carrito
updateCartCount();

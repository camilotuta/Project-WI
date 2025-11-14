// navbar.js - Manejo dinámico del navbar en todas las páginas

// ========== ACTUALIZAR CONTADOR DEL CARRITO ==========
async function updateCartCount() {
  const user = window.API?.Usuarios?.getUser();

  if (!user || !user.id_usuario) {
    // Si no hay usuario, ocultar contador
    const cartBadges = document.querySelectorAll("[data-cart-count]");
    cartBadges.forEach((badge) => {
      if (badge) badge.classList.add("hidden");
    });
    return;
  }

  try {
    const cartItems = await window.API.Carrito.get(user.id_usuario);
    const totalItems = cartItems.reduce(
      (sum, item) => sum + parseInt(item.cantidad || 1),
      0
    );

    // Actualizar todos los badges del carrito
    const cartBadges = document.querySelectorAll("[data-cart-count]");
    cartBadges.forEach((badge) => {
      if (badge) {
        badge.textContent = totalItems;
        if (totalItems > 0) {
          badge.classList.remove("hidden");
        } else {
          badge.classList.add("hidden");
        }
      }
    });

    console.log(`🛒 Contador del carrito actualizado: ${totalItems} items`);
  } catch (error) {
    console.error("❌ Error actualizando contador del carrito:", error);
  }
}

// ========== ACTUALIZAR MENÚ DE USUARIO ==========
function updateUserMenu() {
  const user = window.API?.Usuarios?.getUser();

  const loginButton = document.getElementById("login-button");
  const userDropdown = document.getElementById("user-dropdown");
  const userNameSpan = document.getElementById("user-name");
  const userAvatarInitial = document.getElementById("user-avatar-initial");

  if (!user || !user.id_usuario) {
    // Usuario no logueado - mostrar botón de login
    if (loginButton) loginButton.classList.remove("hidden");
    if (userDropdown) userDropdown.classList.add("hidden");
    return;
  }

  // Usuario logueado - mostrar dropdown
  if (loginButton) loginButton.classList.add("hidden");
  if (userDropdown) userDropdown.classList.remove("hidden");

  // Actualizar nombre de usuario
  if (userNameSpan) {
    userNameSpan.textContent = user.nombre || user.email;
  }

  // Actualizar inicial del avatar
  if (userAvatarInitial) {
    const initial = (user.nombre || user.email || "U")[0].toUpperCase();
    userAvatarInitial.textContent = initial;
  }

  console.log(
    `👤 Menú de usuario actualizado para: ${user.nombre || user.email}`
  );
}

// ========== INICIALIZAR NAVBAR ==========
function initNavbar() {
  console.log("🔧 Inicializando navbar...");

  // Esperar a que API esté disponible
  const checkAPI = setInterval(() => {
    if (
      window.API &&
      window.API.Usuarios &&
      window.API.Carrito &&
      window.API.Favoritos
    ) {
      clearInterval(checkAPI);

      // Actualizar UI
      updateUserMenu();
      updateCartCount();

      // Actualizar contador de favoritos si existe la función
      if (window.API.Favoritos.updateFavoritosCount) {
        window.API.Favoritos.updateFavoritosCount();
      }

      console.log("✅ Navbar inicializado correctamente");
    }
  }, 100);

  // Timeout de seguridad
  setTimeout(() => {
    clearInterval(checkAPI);
  }, 5000);
}

// ========== EXPORTAR FUNCIONES GLOBALMENTE ==========
window.updateCartCount = updateCartCount;
window.updateUserMenu = updateUserMenu;
window.initNavbar = initNavbar;

// ========== AUTO-INICIALIZAR ==========
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initNavbar);
} else {
  initNavbar();
}

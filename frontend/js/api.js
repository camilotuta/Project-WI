// api.js - Módulo para manejar peticiones al backend

// Configuración de la API
const API_CONFIG = {
  BASE_URL: "http://localhost:3000/api",
  TIMEOUT: 10000,
  IMAGE_BASE_URL: "http://localhost:3000",
};

// Función para obtener URL completa de imagen
function getImageUrl(imagePath) {
  // URL de fallback - imagen por defecto desde backend
  const FALLBACK_IMAGE = `${API_CONFIG.IMAGE_BASE_URL}/assets/images/products/default.jpg`;

  // Si no hay ruta, retornar fallback
  if (
    !imagePath ||
    imagePath === "" ||
    imagePath === "null" ||
    imagePath === null
  ) {
    return FALLBACK_IMAGE;
  }

  // Si ya es una URL completa (http o https)
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }

  // Si empieza con /, es ruta relativa - agregar base URL del backend
  if (imagePath.startsWith("/")) {
    return `${API_CONFIG.IMAGE_BASE_URL}${imagePath}`;
  }

  // Si no tiene ningún prefijo, agregar el prefijo completo
  return `${API_CONFIG.IMAGE_BASE_URL}/assets/images/products/${imagePath}`;
}

// Exportar globalmente
window.getImageUrl = getImageUrl;

// ==============================================
// CORRECTOR DE MOJIBAKE — UTF-8 interpretado como Windows-1252
// Cubre tildes, eñes, comillas tipográficas, guiones, grados, etc.
// Ej: "farmacÃ©utico" → "farmacéutico"
//     "0Â°â€"90Â°"  → "0°–90°"
// ==============================================
const _CP1252_TO_UNICODE = {
  0x80: 0x20ac,
  0x82: 0x201a,
  0x83: 0x0192,
  0x84: 0x201e,
  0x85: 0x2026,
  0x86: 0x2020,
  0x87: 0x2021,
  0x88: 0x02c6,
  0x89: 0x2030,
  0x8a: 0x0160,
  0x8b: 0x2039,
  0x8c: 0x0152,
  0x8e: 0x017d,
  0x91: 0x2018,
  0x92: 0x2019,
  0x93: 0x201c,
  0x94: 0x201d,
  0x95: 0x2022,
  0x96: 0x2013,
  0x97: 0x2014,
  0x98: 0x02dc,
  0x99: 0x2122,
  0x9a: 0x0161,
  0x9b: 0x203a,
  0x9c: 0x0153,
  0x9e: 0x017e,
  0x9f: 0x0178,
};
// Mapa inverso: codepoint Unicode → byte Windows-1252
const _UNICODE_TO_CP1252 = Object.fromEntries(
  Object.entries(_CP1252_TO_UNICODE).map(([b, u]) => [u, Number(b)]),
);

function fixMojibake(str) {
  if (typeof str !== "string") return str;
  // Si no hay caracteres altos (>= 0xC0) no hay mojibake posible
  if (!/[\xC0-\xFF]/.test(str)) return str;
  try {
    const bytes = new Uint8Array(str.length);
    for (let i = 0; i < str.length; i++) {
      const code = str.charCodeAt(i);
      if (code < 0x100) {
        bytes[i] = code;
      } else if (_UNICODE_TO_CP1252[code] !== undefined) {
        bytes[i] = _UNICODE_TO_CP1252[code];
      } else {
        // Carácter no reversible → el string ya está correcto
        return str;
      }
    }
    const decoded = new TextDecoder("utf-8").decode(bytes);
    // Si la decodificación produjo caracteres de reemplazo, el string ya era correcto
    if (decoded.includes("\uFFFD")) return str;
    return decoded;
  } catch (e) {
    return str;
  }
}

function fixObjectEncoding(obj) {
  if (typeof obj === "string") return fixMojibake(obj);
  if (Array.isArray(obj)) return obj.map(fixObjectEncoding);
  if (obj && typeof obj === "object") {
    const fixed = {};
    for (const key in obj) fixed[key] = fixObjectEncoding(obj[key]);
    return fixed;
  }
  return obj;
}

// API HTTP helper
const http = {
  async get(endpoint) {
    try {
      const response = await fetch(`http://localhost:3000/api${endpoint}`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return fixObjectEncoding(data);
    } catch (error) {
      console.error(`Error en GET ${endpoint}:`, error);
      throw error;
    }
  },

  async post(endpoint, body) {
    try {
      const response = await fetch(`http://localhost:3000/api${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || `HTTP ${response.status}: ${response.statusText}`,
        );
      }

      return fixObjectEncoding(data);
    } catch (error) {
      console.error(`Error en POST ${endpoint}:`, error);
      throw error;
    }
  },

  async put(endpoint, body) {
    try {
      const response = await fetch(`http://localhost:3000/api${endpoint}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return fixObjectEncoding(data);
    } catch (error) {
      console.error(`Error en PUT ${endpoint}:`, error);
      throw error;
    }
  },

  async delete(endpoint) {
    try {
      const response = await fetch(`http://localhost:3000/api${endpoint}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return fixObjectEncoding(data);
    } catch (error) {
      console.error(`Error en DELETE ${endpoint}:`, error);
      throw error;
    }
  },
};

// API de Productos
const ProductosAPI = {
  async getAll(categoriaSlug = null) {
    try {
      const endpoint =
        categoriaSlug && categoriaSlug !== "all"
          ? `/productos?categoria=${encodeURIComponent(categoriaSlug)}`
          : `/productos`;
      console.log(`📦 GET /api${endpoint}`);
      const response = await http.get(endpoint);

      if (response.success) {
        console.log("✅ Productos obtenidos:", response.data?.length);
        return response;
      }

      return { success: false, data: [] };
    } catch (error) {
      console.error("❌ Error fetching products:", error);
      return { success: false, data: [] };
    }
  },

  async getById(id) {
    try {
      console.log(`📦 GET /api/productos/${id}`);
      const response = await http.get(`/productos/${id}`);
      return response;
    } catch (error) {
      console.error("❌ Error fetching product:", error);
      return { success: false };
    }
  },

  async getRelated(id) {
    try {
      console.log(`📦 GET /api/productos/relacionados/${id}`);
      const response = await http.get(`/productos/relacionados/${id}`);

      if (response.success) {
        return response.data || [];
      }

      return [];
    } catch (error) {
      console.error("❌ Error fetching related products:", error);
      return [];
    }
  },

  async getFeatured(limit = 8) {
    try {
      console.log(`📦 GET /api/productos/destacados?limit=${limit}`);
      const response = await http.get(`/productos/destacados?limit=${limit}`);

      if (response.success) {
        return response;
      }

      return { success: false, data: [] };
    } catch (error) {
      console.error("❌ Error fetching featured products:", error);
      return { success: false, data: [] };
    }
  },

  async getOffers(limit = 12) {
    try {
      console.log(`📦 GET /api/productos/ofertas?limit=${limit}`);
      const response = await http.get(`/productos/ofertas?limit=${limit}`);

      if (response.success) {
        return response;
      }

      return { success: false, data: [] };
    } catch (error) {
      console.error("❌ Error fetching offers:", error);
      return { success: false, data: [] };
    }
  },

  async getNew(limit = 12) {
    try {
      console.log(`📦 GET /api/productos/nuevos?limit=${limit}`);
      const response = await http.get(`/productos/nuevos?limit=${limit}`);

      if (response.success) {
        return response;
      }

      return { success: false, data: [] };
    } catch (error) {
      console.error("❌ Error fetching new products:", error);
      return { success: false, data: [] };
    }
  },
};

// API de Usuarios
const UsuariosAPI = {
  async login(email, password) {
    try {
      console.log(`🔐 Intentando login con email: ${email}`);

      const response = await http.post(`/usuarios/login`, {
        email,
        password,
      });

      console.log("📤 Respuesta del servidor:", response);

      if (response.success) {
        // Guardar usuario completo en localStorage
        const usuario = response.data;
        localStorage.setItem("currentUser", JSON.stringify(usuario));
        localStorage.setItem("userId", usuario.id_usuario);

        console.log(`✅ Usuario guardado en localStorage:`, usuario);

        return usuario;
      }

      throw new Error(response.message || "Error en login");
    } catch (error) {
      console.error("❌ Error en login:", error);
      throw error;
    }
  },

  async register(
    nombre,
    email,
    password,
    telefono,
    direccion,
    ciudad,
    codigo_postal,
    fecha_nacimiento,
  ) {
    try {
      console.log(`📝 Registrando usuario: ${nombre}`);

      const response = await http.post(`/usuarios/register`, {
        nombre,
        email,
        password,
        telefono: telefono || "",
        direccion: direccion || "",
        ciudad: ciudad || "",
        codigo_postal: codigo_postal || "",
        fecha_nacimiento: fecha_nacimiento || null,
      });

      if (response.success) {
        console.log(`✅ Usuario registrado:`, response.data);
        return response.data;
      }

      throw new Error(response.message || "Error en registro");
    } catch (error) {
      console.error("❌ Error en registro:", error);
      throw error;
    }
  },

  // Obtener usuario actual del localStorage
  getUser() {
    try {
      const userJson = localStorage.getItem("currentUser");
      if (userJson) {
        const user = JSON.parse(userJson);
        console.log("✅ Usuario obtenido del localStorage:", user);
        return user;
      }
      return null;
    } catch (error) {
      console.error("❌ Error obteniendo usuario:", error);
      return null;
    }
  },

  // Verificar si hay usuario logueado
  isLoggedIn() {
    return !!this.getUser();
  },

  // Logout - Limpiar localStorage
  logout() {
    console.log("🚪 Cerrando sesión...");
    localStorage.removeItem("currentUser");
    localStorage.removeItem("userId");
    console.log("✅ Sesión cerrada");
  },

  async getById(id) {
    try {
      const response = await http.get(`/usuarios/${id}`);
      return response.success ? response.data : null;
    } catch (error) {
      console.error("Error fetching user:", error);
      return null;
    }
  },

  async update(id, data) {
    try {
      console.log(`📝 Actualizando usuario ${id}:`, data);

      const response = await http.put(`/usuarios/${id}`, data);

      if (response.success) {
        console.log("✅ Usuario actualizado:", response.data);
        return response.data;
      }

      throw new Error(response.message || "Error al actualizar usuario");
    } catch (error) {
      console.error("❌ Error actualizando usuario:", error);
      throw error;
    }
  },
};

// API de Carrito
const CarritoAPI = {
  async add(id_usuario, id_producto, cantidad = 1) {
    try {
      console.log(
        `🛒 POST /api/carrito - Usuario: ${id_usuario}, Producto: ${id_producto}, Cantidad: ${cantidad}`,
      );

      const response = await http.post(`/carrito`, {
        id_usuario,
        id_producto,
        cantidad,
      });

      console.log("📤 Respuesta del servidor:", response);

      if (response.success) {
        this.showNotification(
          `✅ ${response.message || "Producto agregado al carrito"}`,
          "success",
        );
        // Actualizar contador del carrito
        if (window.updateCartCount) {
          window.updateCartCount();
        }
        return response.data;
      }

      throw new Error(response.message || "Error al añadir producto");
    } catch (error) {
      console.error("❌ Error adding to cart:", error);
      this.showNotification(
        `❌ ${error.message || "Error al agregar al carrito"}`,
        "error",
      );
      return null;
    }
  },

  async get(id_usuario) {
    try {
      console.log(`📦 GET /api/carrito/${id_usuario}`);
      const response = await http.get(`/carrito/${id_usuario}`);

      console.log("📤 Respuesta completa del servidor:", response);
      console.log("📤 response.success:", response.success);
      console.log("📤 response.data:", response.data);
      console.log(
        "📤 Array.isArray(response.data):",
        Array.isArray(response.data),
      );

      if (response.success && response.data) {
        console.log("✅ Carrito obtenido, retornando:", response.data);
        return Array.isArray(response.data) ? response.data : [];
      }

      console.warn("⚠️ Respuesta sin success o data, retornando array vacío");
      return [];
    } catch (error) {
      console.error("❌ Error fetching cart:", error);
      return [];
    }
  },

  async updateQuantity(id_carrito, cantidad) {
    try {
      console.log(
        `📝 PUT /api/carrito/${id_carrito} - Nueva cantidad: ${cantidad}`,
      );
      const response = await http.put(`/carrito/${id_carrito}`, { cantidad });

      if (response.success) {
        this.showNotification(
          `✅ ${response.message || "Cantidad actualizada"}`,
          "success",
        );
        // Actualizar contador del carrito
        if (window.updateCartCount) {
          window.updateCartCount();
        }
        return response.data;
      }

      throw new Error(response.message || "Error al actualizar cantidad");
    } catch (error) {
      console.error("❌ Error updating quantity:", error);
      this.showNotification(`❌ ${error.message}`, "error");
      return null;
    }
  },

  async remove(id_carrito) {
    try {
      console.log(`🗑️ DELETE /api/carrito/${id_carrito}`);
      const response = await http.delete(`/carrito/${id_carrito}`);

      if (response.success) {
        this.showNotification(
          `✅ ${response.message || "Producto eliminado del carrito"}`,
          "success",
        );
        // Actualizar contador del carrito
        if (window.updateCartCount) {
          window.updateCartCount();
        }
        return true;
      }

      throw new Error(response.message || "Error al eliminar producto");
    } catch (error) {
      console.error("❌ Error removing from cart:", error);
      this.showNotification(`❌ ${error.message}`, "error");
      return false;
    }
  },

  async clear(id_usuario) {
    try {
      console.log(`🗑️ DELETE /api/carrito/clear/${id_usuario}`);
      const response = await http.delete(`/carrito/clear/${id_usuario}`);

      if (response.success) {
        this.showNotification(
          `✅ ${response.message || "Carrito vaciado"}`,
          "success",
        );
        // Actualizar contador del carrito
        if (window.updateCartCount) {
          window.updateCartCount();
        }
        return true;
      }

      throw new Error(response.message || "Error al vaciar carrito");
    } catch (error) {
      console.error("❌ Error clearing cart:", error);
      this.showNotification(`❌ ${error.message}`, "error");
      return false;
    }
  },

  // Obtener el ID del usuario autenticado
  getCurrentUserId() {
    const user = UsuariosAPI.getUser();
    if (user && user.id_usuario) {
      console.log("✅ User ID from user object:", user.id_usuario);
      return user.id_usuario;
    }

    console.warn("⚠️ No user ID found - Usuario no logueado");
    return null;
  },

  // Agregar producto al carrito
  addItem(product, quantity = 1) {
    const userId = this.getCurrentUserId();

    if (!userId) {
      this.showNotification(
        "⚠️ Debes iniciar sesión para agregar productos",
        "warning",
      );
      setTimeout(() => {
        window.location.href = "../pages/user_login.html";
      }, 1500);
      return;
    }

    if (!product.id_producto) {
      console.error("❌ Producto sin id_producto:", product);
      this.showNotification("❌ Producto inválido", "error");
      return;
    }

    console.log(
      `🛒 Agregando ${product.nombre} (ID: ${product.id_producto}) x${quantity}`,
    );
    this.add(userId, product.id_producto, quantity);
  },

  // Eliminar producto del carrito
  removeItem(id_carrito) {
    this.remove(id_carrito);
  },

  // Actualizar cantidad
  updateItem(id_carrito, cantidad) {
    this.updateQuantity(id_carrito, cantidad);
  },

  // Obtener carrito del usuario
  async fetchCart() {
    const userId = this.getCurrentUserId();
    if (!userId) {
      console.warn("⚠️ No user ID to fetch cart");
      return [];
    }

    const cart = await this.get(userId);
    return Array.isArray(cart) ? cart : [];
  },

  // Actualizar UI del carrito
  async updateCartUI() {
    const cartCount = document.querySelector("[data-cart-count]");
    const cartTotal = document.querySelector("[data-cart-total]");

    const cart = await this.fetchCart();

    const totalItems = cart.reduce(
      (sum, item) => sum + (item.cantidad || 1),
      0,
    );
    const total = cart.reduce(
      (sum, item) => sum + (item.precio || 0) * (item.cantidad || 1),
      0,
    );

    if (cartCount) {
      cartCount.textContent = totalItems;
      cartCount.classList.toggle("hidden", totalItems === 0);
    }

    if (cartTotal) {
      cartTotal.textContent = window.API.formatPrice(total);
    }

    console.log(
      `🛒 Carrito actualizado: ${totalItems} productos, Total: $${total}`,
    );
  },

  // Mostrar notificación
  showNotification(message, type = "info") {
    const notification = document.getElementById("success-notification");
    const notificationText = document.getElementById("notification-text");

    if (!notification) {
      console.warn("⚠️ Notification element not found in DOM");
      console.log("📢", message);
      return;
    }

    // Actualizar texto si existe el elemento
    if (notificationText) {
      notificationText.textContent = message;
    }

    // Remover todas las clases de color previas
    notification.classList.remove(
      "bg-success",
      "bg-error",
      "bg-warning",
      "bg-primary",
    );

    // Agregar color según tipo
    switch (type) {
      case "success":
        notification.classList.add("bg-success");
        break;
      case "error":
        notification.classList.add("bg-error");
        break;
      case "warning":
        notification.classList.add("bg-warning");
        break;
      default:
        notification.classList.add("bg-primary");
    }

    // Mostrar
    notification.classList.remove("translate-x-full");

    // Ocultar después de 3 segundos
    setTimeout(() => {
      notification.classList.add("translate-x-full");
    }, 3000);
  },
};

// ========== DESCUENTOS API ==========
const DescuentosAPI = {
  // Validar código de descuento
  async validarCodigo(codigo, subtotal) {
    try {
      const response = await http.post("/descuentos/validar", {
        codigo: codigo.toUpperCase(),
        subtotal,
      });

      return response;
    } catch (error) {
      console.error("❌ Error validando código:", error);
      throw error;
    }
  },

  // Aplicar descuento (incrementar uso)
  async aplicarDescuento(codigoId) {
    try {
      const response = await http.post("/descuentos/aplicar", {
        codigoId,
      });

      return response;
    } catch (error) {
      console.error("❌ Error aplicando descuento:", error);
      throw error;
    }
  },

  // Obtener todos los cupones (admin)
  async obtenerTodos() {
    try {
      const response = await http.get("/descuentos");
      return response;
    } catch (error) {
      console.error("❌ Error obteniendo descuentos:", error);
      throw error;
    }
  },
};

// ==============================================
// FAVORITOS API
// ==============================================
const FavoritosAPI = {
  // Obtener favoritos del usuario
  async getFavoritos() {
    try {
      const userId = CarritoAPI.getCurrentUserId();
      if (!userId) return [];

      const response = await http.get(`/favoritos/${userId}`);
      return response.data || [];
    } catch (error) {
      console.error("❌ Error al obtener favoritos:", error);
      return [];
    }
  },

  // Toggle favorito (agregar/eliminar)
  async toggleFavorito(productId) {
    try {
      const userId = CarritoAPI.getCurrentUserId();
      if (!userId) {
        throw new Error("Usuario no autenticado");
      }

      const response = await http.post("/favoritos/toggle", {
        userId,
        productId,
      });

      // Actualizar contador de favoritos
      await this.updateFavoritosCount();

      return response;
    } catch (error) {
      console.error("❌ Error al toggle favorito:", error);
      throw error;
    }
  },

  // Verificar si un producto es favorito
  async isFavorito(productId) {
    try {
      const userId = CarritoAPI.getCurrentUserId();
      if (!userId) return false;

      const response = await http.get(
        `/favoritos/${userId}/check/${productId}`,
      );
      return response.isFavorito;
    } catch (error) {
      console.error("❌ Error al verificar favorito:", error);
      return false;
    }
  },

  // Obtener cantidad de favoritos
  async getFavoritosCount() {
    try {
      const userId = CarritoAPI.getCurrentUserId();
      if (!userId) return 0;

      const response = await http.get(`/favoritos/${userId}/count`);
      return response.count || 0;
    } catch (error) {
      console.error("❌ Error al obtener cantidad de favoritos:", error);
      return 0;
    }
  },

  // Actualizar contador de favoritos en el navbar
  async updateFavoritosCount() {
    try {
      const count = await this.getFavoritosCount();
      const badges = document.querySelectorAll("[data-favoritos-count]");

      badges.forEach((badge) => {
        badge.textContent = count;
        badge.style.display = count > 0 ? "flex" : "none";
      });

      return count;
    } catch (error) {
      console.error("❌ Error al actualizar contador de favoritos:", error);
      return 0;
    }
  },

  // Mostrar notificación
  showNotification(message, type = "success") {
    CarritoAPI.showNotification(message, type);
  },
};

// ==============================================
// PEDIDOS API
// ==============================================
const PedidosAPI = {
  /**
   * Confirmar compra: convierte el carrito en un pedido completado
   */
  async checkout(id_usuario) {
    try {
      const response = await http.post("/pedidos", { id_usuario });
      return response;
    } catch (error) {
      console.error("❌ Error en checkout:", error);
      throw error;
    }
  },

  /**
   * Obtener historial de pedidos del usuario
   */
  async getAll({ id_usuario } = {}) {
    try {
      const response = await http.get(`/pedidos/usuario/${id_usuario}`);
      return response;
    } catch (error) {
      console.error("❌ Error obteniendo pedidos:", error);
      throw error;
    }
  },

  /**
   * Verificar si el usuario compró un producto específico
   */
  async verificarCompra(id_usuario, id_producto) {
    try {
      const response = await http.get(
        `/pedidos/verificar-compra?id_usuario=${id_usuario}&id_producto=${id_producto}`,
      );
      return response.data?.compro === true;
    } catch (error) {
      console.error("❌ Error verificando compra:", error);
      return false;
    }
  },
};

// Exportar APIs globalmente
window.API = {
  Usuarios: UsuariosAPI,
  Carrito: CarritoAPI,
  Productos: ProductosAPI,
  Descuentos: DescuentosAPI,
  Favoritos: FavoritosAPI,
  Pedidos: PedidosAPI,
  formatPrice: (price) => {
    const num = parseFloat(price);
    return `$${num.toLocaleString("es-CO")} COP`;
  },
};

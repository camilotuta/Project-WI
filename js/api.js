// ============================================
// API Client para Greenhouse Fitness
// ============================================

const API_BASE_URL = 'http://localhost:3000/api';

// Helper para obtener el token del localStorage
const getToken = () => {
  return localStorage.getItem('gh_token');
};

// Helper para guardar el token
const saveToken = (token) => {
  localStorage.setItem('gh_token', token);
};

// Helper para eliminar el token
const removeToken = () => {
  localStorage.removeItem('gh_token');
  localStorage.removeItem('gh_user');
};

// Helper para obtener el usuario
const getUser = () => {
  const user = localStorage.getItem('gh_user');
  return user ? JSON.parse(user) : null;
};

// Helper para guardar el usuario
const saveUser = (user) => {
  localStorage.setItem('gh_user', JSON.stringify(user));
};

// Configuración base de fetch
const fetchAPI = async (endpoint, options = {}) => {
  const token = getToken();
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error en la petición');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// ============================================
// PRODUCTOS
// ============================================

const ProductosAPI = {
  // Obtener todos los productos
  getAll: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    return fetchAPI(`/productos${params ? `?${params}` : ''}`);
  },

  // Obtener producto por ID
  getById: async (id) => {
    return fetchAPI(`/productos/${id}`);
  },

  // Obtener productos relacionados
  getRelated: async (id, limit = 4) => {
    return fetchAPI(`/productos/${id}/relacionados?limit=${limit}`);
  },

  // Crear producto (requiere autenticación)
  create: async (productoData) => {
    return fetchAPI('/productos', {
      method: 'POST',
      body: JSON.stringify(productoData),
    });
  },

  // Actualizar producto
  update: async (id, productoData) => {
    return fetchAPI(`/productos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productoData),
    });
  },

  // Eliminar producto
  delete: async (id) => {
    return fetchAPI(`/productos/${id}`, {
      method: 'DELETE',
    });
  },
};

// ============================================
// CATEGORÍAS
// ============================================

const CategoriasAPI = {
  getAll: async () => {
    return fetchAPI('/categorias');
  },

  getById: async (id) => {
    return fetchAPI(`/categorias/${id}`);
  },
};

// ============================================
// SUPLEMENTOS
// ============================================

const SuplementosAPI = {
  getAll: async () => {
    return fetchAPI('/suplementos');
  },

  getById: async (id) => {
    return fetchAPI(`/suplementos/${id}`);
  },

  getByProductId: async (id_producto) => {
    return fetchAPI(`/suplementos/producto/${id_producto}`);
  },
};

// ============================================
// USUARIOS / AUTENTICACIÓN
// ============================================

const AuthAPI = {
  // Registrar usuario
  register: async (userData) => {
    const response = await fetchAPI('/usuarios/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    if (response.success && response.token) {
      saveToken(response.token);
      saveUser(response.data);
    }

    return response;
  },

  // Iniciar sesión
  login: async (email, password) => {
    const response = await fetchAPI('/usuarios/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (response.success && response.token) {
      saveToken(response.token);
      saveUser(response.data);
    }

    return response;
  },

  // Cerrar sesión
  logout: () => {
    removeToken();
    window.location.href = '/index.html';
  },

  // Verificar si está autenticado
  isAuthenticated: () => {
    return !!getToken();
  },

  // Obtener perfil
  getProfile: async () => {
    return fetchAPI('/usuarios/profile');
  },

  // Actualizar perfil
  updateProfile: async (id, userData) => {
    return fetchAPI(`/usuarios/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },
};

// ============================================
// CARRITO
// ============================================

const CarritoAPI = {
  // Obtener carrito del usuario
  get: async (id_usuario) => {
    return fetchAPI(`/carrito/${id_usuario}`);
  },

  // Agregar producto al carrito
  add: async (id_usuario, id_producto, cantidad = 1) => {
    return fetchAPI('/carrito', {
      method: 'POST',
      body: JSON.stringify({ id_usuario, id_producto, cantidad }),
    });
  },

  // Actualizar cantidad de un item
  updateQuantity: async (id_carrito, cantidad) => {
    return fetchAPI(`/carrito/${id_carrito}`, {
      method: 'PUT',
      body: JSON.stringify({ cantidad }),
    });
  },

  // Eliminar item del carrito
  remove: async (id_carrito) => {
    return fetchAPI(`/carrito/${id_carrito}`, {
      method: 'DELETE',
    });
  },

  // Vaciar carrito
  clear: async (id_usuario) => {
    return fetchAPI(`/carrito/clear/${id_usuario}`, {
      method: 'DELETE',
    });
  },
};

// ============================================
// PEDIDOS
// ============================================

const PedidosAPI = {
  // Obtener pedidos
  getAll: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    return fetchAPI(`/pedidos${params ? `?${params}` : ''}`);
  },

  // Obtener pedido por ID
  getById: async (id) => {
    return fetchAPI(`/pedidos/${id}`);
  },

  // Crear pedido
  create: async (pedido, items) => {
    return fetchAPI('/pedidos', {
      method: 'POST',
      body: JSON.stringify({ pedido, items }),
    });
  },

  // Actualizar estado del pedido
  updateStatus: async (id, estado) => {
    return fetchAPI(`/pedidos/${id}/estado`, {
      method: 'PATCH',
      body: JSON.stringify({ estado }),
    });
  },

  // Obtener estadísticas
  getStats: async () => {
    return fetchAPI('/pedidos/stats');
  },
};

// ============================================
// VALORACIONES
// ============================================

const ValoracionesAPI = {
  // Obtener valoraciones de un producto
  getByProduct: async (id_producto) => {
    return fetchAPI(`/valoraciones/producto/${id_producto}`);
  },

  // Obtener valoraciones de un usuario
  getByUser: async (id_usuario) => {
    return fetchAPI(`/valoraciones/usuario/${id_usuario}`);
  },

  // Obtener estadísticas de valoraciones
  getStats: async (id_producto) => {
    return fetchAPI(`/valoraciones/stats/${id_producto}`);
  },

  // Crear valoración
  create: async (valoracionData) => {
    return fetchAPI('/valoraciones', {
      method: 'POST',
      body: JSON.stringify(valoracionData),
    });
  },

  // Actualizar valoración
  update: async (id, valoracionData) => {
    return fetchAPI(`/valoraciones/${id}`, {
      method: 'PUT',
      body: JSON.stringify(valoracionData),
    });
  },

  // Eliminar valoración
  delete: async (id) => {
    return fetchAPI(`/valoraciones/${id}`, {
      method: 'DELETE',
    });
  },
};

// ============================================
// HELPER FUNCTIONS
// ============================================

// Mostrar notificación
const showNotification = (message, type = 'success') => {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  notification.style.transform = 'translateX(0)';
  
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.transform = 'translateX(400px)';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
};

// Actualizar contador del carrito en el header
const updateCartCount = async () => {
  const user = getUser();
  if (!user) return;

  try {
    const response = await CarritoAPI.get(user.id_usuario);
    const cartCount = document.querySelector('.cart-count');
    
    if (cartCount && response.data.totales) {
      cartCount.textContent = response.data.totales.total_items || 0;
    }
  } catch (error) {
    console.error('Error actualizando contador del carrito:', error);
  }
};

// Formatear precio
const formatPrice = (price) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(price);
};

// Formatear fecha
const formatDate = (date) => {
  return new Intl.DateTimeFormat('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
};

// Exportar todas las APIs
window.API = {
  Productos: ProductosAPI,
  Categorias: CategoriasAPI,
  Suplementos: SuplementosAPI,
  Auth: AuthAPI,
  Carrito: CarritoAPI,
  Pedidos: PedidosAPI,
  Valoraciones: ValoracionesAPI,
  // Helpers
  showNotification,
  updateCartCount,
  formatPrice,
  formatDate,
  getUser,
  getToken,
};
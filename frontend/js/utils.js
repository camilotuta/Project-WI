// ============================================
// UTILS.JS - Utilidades y Helpers Generales
// ============================================

// ============================================
// FORMATEO
// ============================================

// Formatear precio en pesos colombianos
function formatPrice(price) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

// Formatear fecha
function formatDate(date, options = {}) {
  const defaultOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
    ...options,
  };

  return new Intl.DateTimeFormat("es-CO", defaultOptions).format(
    new Date(date)
  );
}

// Formatear fecha con hora
function formatDateTime(date) {
  return formatDate(date, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Formatear fecha relativa (hace X tiempo)
function formatRelativeTime(date) {
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now - past) / 1000);

  const intervals = {
    año: 31536000,
    mes: 2592000,
    semana: 604800,
    día: 86400,
    hora: 3600,
    minuto: 60,
  };

  for (const [unit, seconds] of Object.entries(intervals)) {
    const interval = Math.floor(diffInSeconds / seconds);
    if (interval >= 1) {
      return `Hace ${interval} ${unit}${interval > 1 ? "s" : ""}`;
    }
  }

  return "Hace un momento";
}

// Formatear número con separadores de miles
function formatNumber(num) {
  return new Intl.NumberFormat("es-CO").format(num);
}

// ============================================
// VALIDACIONES
// ============================================

// Validar email
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// Validar teléfono colombiano
function validatePhone(phone) {
  // Acepta formatos: +57 300 123 4567, 3001234567, 300-123-4567
  const re = /^(\+57)?[\s-]?3\d{2}[\s-]?\d{3}[\s-]?\d{4}$/;
  return re.test(phone);
}

// Validar contraseña (mínimo 6 caracteres)
function validatePassword(password) {
  return password.length >= 6;
}

// Validar fuerza de contraseña
function getPasswordStrength(password) {
  let strength = 0;

  if (password.length >= 6) strength += 25;
  if (password.length >= 8) strength += 25;
  if (/[A-Z]/.test(password)) strength += 25;
  if (/[0-9]/.test(password)) strength += 25;

  return {
    score: strength,
    level: strength < 50 ? "débil" : strength < 75 ? "media" : "fuerte",
    color:
      strength < 50
        ? "var(--error-color)"
        : strength < 75
        ? "var(--warning-color)"
        : "var(--success-color)",
  };
}

// Validar campo requerido
function validateRequired(value) {
  return value && value.trim().length > 0;
}

// ============================================
// MANIPULACIÓN DE DOM
// ============================================

// Crear elemento con atributos
function createElement(tag, attributes = {}, children = []) {
  const element = document.createElement(tag);

  Object.entries(attributes).forEach(([key, value]) => {
    if (key === "className") {
      element.className = value;
    } else if (key === "innerHTML") {
      element.innerHTML = value;
    } else if (key.startsWith("data-")) {
      element.setAttribute(key, value);
    } else {
      element[key] = value;
    }
  });

  children.forEach((child) => {
    if (typeof child === "string") {
      element.appendChild(document.createTextNode(child));
    } else {
      element.appendChild(child);
    }
  });

  return element;
}

// Mostrar/ocultar elemento
function toggleElement(element, show) {
  if (typeof element === "string") {
    element = document.querySelector(element);
  }

  if (element) {
    element.style.display = show ? "" : "none";
  }
}

// Agregar clase
function addClass(element, className) {
  if (typeof element === "string") {
    element = document.querySelector(element);
  }
  element?.classList.add(className);
}

// Remover clase
function removeClass(element, className) {
  if (typeof element === "string") {
    element = document.querySelector(element);
  }
  element?.classList.remove(className);
}

// Toggle clase
function toggleClass(element, className) {
  if (typeof element === "string") {
    element = document.querySelector(element);
  }
  element?.classList.toggle(className);
}

// ============================================
// EVENTOS
// ============================================

// Debounce - retrasar ejecución
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Throttle - limitar frecuencia
function throttle(func, limit) {
  let inThrottle;
  return function (...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// ============================================
// NAVEGACIÓN Y URL
// ============================================

// Obtener parámetros de URL
function getUrlParams() {
  return Object.fromEntries(new URLSearchParams(window.location.search));
}

// Obtener parámetro específico
function getUrlParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

// Actualizar URL sin recargar
function updateUrlParams(params) {
  const url = new URL(window.location);
  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      url.searchParams.set(key, value);
    } else {
      url.searchParams.delete(key);
    }
  });
  window.history.pushState({}, "", url);
}

// Scroll suave a elemento
function scrollToElement(element, offset = 0) {
  if (typeof element === "string") {
    element = document.querySelector(element);
  }

  if (element) {
    const top =
      element.getBoundingClientRect().top + window.pageYOffset - offset;
    window.scrollTo({ top, behavior: "smooth" });
  }
}

// Scroll al inicio
function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ============================================
// STORAGE
// ============================================

// Guardar en localStorage con JSON
function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error("Error guardando en storage:", error);
    return false;
  }
}

// Obtener de localStorage
function getFromStorage(key, defaultValue = null) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error("Error leyendo storage:", error);
    return defaultValue;
  }
}

// Eliminar de localStorage
function removeFromStorage(key) {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error("Error eliminando de storage:", error);
    return false;
  }
}

// Limpiar localStorage
function clearStorage() {
  try {
    localStorage.clear();
    return true;
  } catch (error) {
    console.error("Error limpiando storage:", error);
    return false;
  }
}

// ============================================
// ARRAYS Y OBJETOS
// ============================================

// Eliminar duplicados de array
function uniqueArray(array) {
  return [...new Set(array)];
}

// Agrupar array por propiedad
function groupBy(array, key) {
  return array.reduce((result, item) => {
    const group = item[key];
    result[group] = result[group] || [];
    result[group].push(item);
    return result;
  }, {});
}

// Ordenar array de objetos
function sortBy(array, key, order = "asc") {
  return [...array].sort((a, b) => {
    if (order === "asc") {
      return a[key] > b[key] ? 1 : -1;
    } else {
      return a[key] < b[key] ? 1 : -1;
    }
  });
}

// Clonar objeto profundo
function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

// ============================================
// STRINGS
// ============================================

// Capitalizar primera letra
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

// Capitalizar palabras
function capitalizeWords(str) {
  return str.split(" ").map(capitalize).join(" ");
}

// Slug (URL friendly)
function slugify(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Truncar texto
function truncate(str, length, suffix = "...") {
  if (str.length <= length) return str;
  return str.substring(0, length).trim() + suffix;
}

// ============================================
// NÚMEROS
// ============================================

// Generar número aleatorio en rango
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Redondear a decimales
function roundTo(num, decimals = 2) {
  return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

// Calcular porcentaje
function percentage(value, total) {
  return (value / total) * 100;
}

// Calcular descuento
function calculateDiscount(original, discounted) {
  return roundTo(((original - discounted) / original) * 100);
}

// ============================================
// TIEMPO
// ============================================

// Delay/sleep
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Timeout con Promise
function timeout(ms, promise) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Timeout")), ms)
    ),
  ]);
}

// ============================================
// COPIAR AL PORTAPAPELES
// ============================================

async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    // Fallback para navegadores antiguos
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    const success = document.execCommand("copy");
    document.body.removeChild(textarea);
    return success;
  }
}

// ============================================
// DETECCIÓN DE DISPOSITIVO
// ============================================

const isMobile = () =>
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
const isTablet = () => /iPad|Android/i.test(navigator.userAgent) && !isMobile();
const isDesktop = () => !isMobile() && !isTablet();
const isTouchDevice = () =>
  "ontouchstart" in window || navigator.maxTouchPoints > 0;

// ============================================
// EXPORTAR UTILIDADES
// ============================================

// Si se usa como módulo
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    // Formateo
    formatPrice,
    formatDate,
    formatDateTime,
    formatRelativeTime,
    formatNumber,

    // Validaciones
    validateEmail,
    validatePhone,
    validatePassword,
    getPasswordStrength,
    validateRequired,

    // DOM
    createElement,
    toggleElement,
    addClass,
    removeClass,
    toggleClass,

    // Eventos
    debounce,
    throttle,

    // Navegación
    getUrlParams,
    getUrlParam,
    updateUrlParams,
    scrollToElement,
    scrollToTop,

    // Storage
    saveToStorage,
    getFromStorage,
    removeFromStorage,
    clearStorage,

    // Arrays
    uniqueArray,
    groupBy,
    sortBy,
    deepClone,

    // Strings
    capitalize,
    capitalizeWords,
    slugify,
    truncate,

    // Números
    randomInt,
    roundTo,
    percentage,
    calculateDiscount,

    // Tiempo
    sleep,
    timeout,

    // Otros
    copyToClipboard,
    isMobile,
    isTablet,
    isDesktop,
    isTouchDevice,
  };
}

// Agregar al objeto window para uso global
window.Utils = {
  formatPrice,
  formatDate,
  formatDateTime,
  formatRelativeTime,
  validateEmail,
  validatePhone,
  validatePassword,
  getPasswordStrength,
  scrollToTop,
  copyToClipboard,
  isMobile,
  debounce,
  throttle,
};

// API Configuration
const API_URL =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
    ? "http://localhost:3000/api"
    : "https://tu-api.com/api";

// Utility function for API calls
async function apiCall(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Error en la petición");
    }

    return data;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
}

// Notification System
function showNotification(message, type = "success") {
  const notification = document.getElementById("notification");
  const notificationText = document.getElementById("notification-text");

  if (!notification || !notificationText) return;

  notificationText.textContent = message;

  // Remove previous type classes
  notification.classList.remove("success", "error", "warning");
  notification.classList.add(type);

  // Show notification
  notification.classList.add("show");

  // Hide after 3 seconds
  setTimeout(() => {
    notification.classList.remove("show");
  }, 3000);
}

// Format currency
function formatCurrency(value) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(value);
}

// Format date
function formatDate(dateString) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("es-CO", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

// Logout function
function logout() {
  if (confirm("¿Estás seguro de que deseas cerrar sesión?")) {
    localStorage.removeItem("user");
    window.location.href = "../../frontend/pages/homepage.html";
  }
}

// Export for use in other files
window.API_URL = API_URL;
window.apiCall = apiCall;
window.showNotification = showNotification;
window.formatCurrency = formatCurrency;
window.formatDate = formatDate;
window.logout = logout;

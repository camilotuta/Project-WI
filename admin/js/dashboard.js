// Load dashboard data
async function loadDashboard() {
  try {
    await Promise.all([loadStats(), loadRecentProducts(), loadRecentUsers()]);
  } catch (error) {
    console.error("Error loading dashboard:", error);
    showNotification("Error al cargar el dashboard", "error");
  }
}

// Load stats
async function loadStats() {
  try {
    const [products, users, categories, discounts] = await Promise.all([
      apiCall("/productos"),
      apiCall("/usuarios"),
      apiCall("/categorias"),
      apiCall("/descuentos"),
    ]);

    document.getElementById("stat-products").textContent =
      products.data?.length || 0;
    document.getElementById("stat-users").textContent = users.data?.length || 0;
    document.getElementById("stat-categories").textContent =
      categories.data?.length || 0;

    // Count active discounts
    const activeDiscounts =
      discounts.data?.filter((d) => {
        const now = new Date();
        const endDate = new Date(d.fecha_expiracion);
        return endDate > now && (!d.limite_uso || d.veces_usado < d.limite_uso);
      }).length || 0;

    document.getElementById("stat-discounts").textContent = activeDiscounts;
  } catch (error) {
    console.error("Error loading stats:", error);
  }
}

// Load recent products
async function loadRecentProducts() {
  const tbody = document.getElementById("recent-products");

  try {
    const response = await apiCall("/productos");
    const products = response.data || [];

    if (products.length === 0) {
      tbody.innerHTML =
        '<tr><td colspan="6" style="text-align: center; padding: 2rem;">No hay productos registrados</td></tr>';
      return;
    }

    // Show last 5 products
    const recentProducts = products.slice(-5).reverse();

    tbody.innerHTML = recentProducts
      .map(
        (product) => `
      <tr>
        <td>
          <img src="../../frontend${product.imagen_url}" 
               alt="${product.nombre}" 
               class="table-image"
               onerror="this.src='https://via.placeholder.com/50'">
        </td>
        <td>${product.nombre}</td>
        <td>${product.categoria_nombre || "Sin categoría"}</td>
        <td>${formatCurrency(product.precio)}</td>
        <td>${product.stock_disponible || 0}</td>
        <td>
          ${
            product.destacado
              ? '<span class="badge badge-success">Sí</span>'
              : '<span class="badge badge-error">No</span>'
          }
        </td>
      </tr>
    `
      )
      .join("");
  } catch (error) {
    console.error("Error loading recent products:", error);
    tbody.innerHTML =
      '<tr><td colspan="6" style="text-align: center; padding: 2rem; color: var(--error);">Error al cargar productos</td></tr>';
  }
}

// Load recent users
async function loadRecentUsers() {
  const tbody = document.getElementById("recent-users");

  try {
    const response = await apiCall("/usuarios");
    const users = response.data || [];

    if (users.length === 0) {
      tbody.innerHTML =
        '<tr><td colspan="4" style="text-align: center; padding: 2rem;">No hay usuarios registrados</td></tr>';
      return;
    }

    // Show last 5 users
    const recentUsers = users.slice(-5).reverse();

    tbody.innerHTML = recentUsers
      .map(
        (user) => `
      <tr>
        <td>${user.nombre}</td>
        <td>${user.email}</td>
        <td>${user.telefono || "N/A"}</td>
        <td>${formatDate(user.fecha_registro)}</td>
      </tr>
    `
      )
      .join("");
  } catch (error) {
    console.error("Error loading recent users:", error);
    tbody.innerHTML =
      '<tr><td colspan="4" style="text-align: center; padding: 2rem; color: var(--error);">Error al cargar usuarios</td></tr>';
  }
}

// Initialize dashboard on load
document.addEventListener("DOMContentLoaded", loadDashboard);

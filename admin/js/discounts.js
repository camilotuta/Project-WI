// Global variables
let allDiscounts = [];
let deleteDiscountId = null;

// Load discounts
async function loadDiscounts() {
  const tbody = document.getElementById("discounts-table");

  try {
    const response = await apiCall("/descuentos");
    allDiscounts = response.data || [];

    renderDiscounts(allDiscounts);
  } catch (error) {
    console.error("Error loading discounts:", error);
    tbody.innerHTML =
      '<tr><td colspan="8" style="text-align: center; padding: 2rem; color: var(--error);">Error al cargar descuentos</td></tr>';
  }
}

// Render discounts
function renderDiscounts(discounts) {
  const tbody = document.getElementById("discounts-table");

  if (discounts.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="8" style="text-align: center; padding: 2rem;">No hay descuentos registrados</td></tr>';
    return;
  }

  tbody.innerHTML = discounts
    .map((discount) => {
      const now = new Date();
      const startDate = new Date(discount.fecha_inicio);
      const endDate = new Date(discount.fecha_expiracion);

      let status = "active";
      let statusBadge = "badge-success";
      let statusText = "Activo";

      if (endDate < now) {
        status = "expired";
        statusBadge = "badge-error";
        statusText = "Expirado";
      } else if (startDate > now) {
        status = "pending";
        statusBadge = "badge-warning";
        statusText = "Pendiente";
      } else if (
        discount.limite_uso &&
        discount.veces_usado >= discount.limite_uso
      ) {
        status = "used";
        statusBadge = "badge-error";
        statusText = "Agotado";
      }

      const discountValue =
        discount.tipo_descuento === "percentage"
          ? `${discount.valor_descuento}%`
          : formatCurrency(discount.valor_descuento);

      const usageText = discount.limite_uso
        ? `${discount.veces_usado || 0} / ${discount.limite_uso}`
        : `${discount.veces_usado || 0} / ∞`;

      return `
      <tr>
        <td>${discount.id_descuento}</td>
        <td><strong>${discount.codigo}</strong></td>
        <td>${discountValue}</td>
        <td>${formatCurrency(discount.compra_minima || 0)}</td>
        <td>${usageText}</td>
        <td>
          <div style="font-size: 0.875rem;">
            <div>${formatDate(discount.fecha_inicio)}</div>
            <div style="color: var(--text-secondary);">hasta ${formatDate(
              discount.fecha_expiracion
            )}</div>
          </div>
        </td>
        <td>
          <span class="badge ${statusBadge}">${statusText}</span>
        </td>
        <td class="table-actions">
          <button class="btn btn-sm btn-warning" onclick="editDiscount(${
            discount.id_descuento
          })">
            ✏️ Editar
          </button>
          <button class="btn btn-sm btn-danger" onclick="openDeleteModal(${
            discount.id_descuento
          })">
            🗑️ Eliminar
          </button>
        </td>
      </tr>
    `;
    })
    .join("");
}

// Filter discounts
function filterDiscounts() {
  const search = document.getElementById("search-input").value.toLowerCase();
  const statusFilter = document.getElementById("status-filter").value;

  let filtered = allDiscounts;

  if (search) {
    filtered = filtered.filter(
      (d) =>
        d.codigo.toLowerCase().includes(search) ||
        d.descripcion?.toLowerCase().includes(search)
    );
  }

  if (statusFilter) {
    const now = new Date();
    filtered = filtered.filter((d) => {
      const endDate = new Date(d.fecha_expiracion);
      const startDate = new Date(d.fecha_inicio);

      if (statusFilter === "active") {
        return (
          endDate >= now &&
          startDate <= now &&
          (!d.limite_uso || d.veces_usado < d.limite_uso)
        );
      } else if (statusFilter === "expired") {
        return endDate < now;
      } else if (statusFilter === "used") {
        return d.limite_uso && d.veces_usado >= d.limite_uso;
      }
      return true;
    });
  }

  renderDiscounts(filtered);
}

// Toggle discount type
function toggleDiscountType() {
  const type = document.getElementById("discount-type").value;
  const label = document.getElementById("discount-value-label");

  if (type === "percentage") {
    label.textContent = "Porcentaje de Descuento *";
  } else {
    label.textContent = "Monto Fijo (COP) *";
  }
}

// Open discount modal
function openDiscountModal() {
  document.getElementById("modal-title").textContent = "Nuevo Descuento";
  document.getElementById("discount-form").reset();
  document.getElementById("discount-id").value = "";

  // Set default dates
  const today = new Date().toISOString().split("T")[0];
  document.getElementById("discount-start-date").value = today;

  document.getElementById("discount-modal").classList.add("active");
}

// Close discount modal
function closeDiscountModal() {
  document.getElementById("discount-modal").classList.remove("active");
}

// Edit discount
async function editDiscount(id) {
  try {
    const response = await apiCall(`/descuentos/${id}`);
    const discount = response.data;

    if (!discount) {
      showNotification("Descuento no encontrado", "error");
      return;
    }

    document.getElementById("modal-title").textContent = "Editar Descuento";
    document.getElementById("discount-id").value = discount.id_descuento;
    document.getElementById("discount-code").value = discount.codigo;
    document.getElementById("discount-type").value = discount.tipo_descuento;
    document.getElementById("discount-value").value = discount.valor_descuento;
    document.getElementById("discount-min-purchase").value =
      discount.compra_minima || 0;
    document.getElementById("discount-usage-limit").value =
      discount.limite_uso || "";
    document.getElementById("discount-start-date").value =
      discount.fecha_inicio.split("T")[0];
    document.getElementById("discount-end-date").value =
      discount.fecha_expiracion.split("T")[0];
    document.getElementById("discount-description").value =
      discount.descripcion || "";

    toggleDiscountType();

    document.getElementById("discount-modal").classList.add("active");
  } catch (error) {
    console.error("Error loading discount:", error);
    showNotification("Error al cargar el descuento", "error");
  }
}

// Save discount
async function saveDiscount() {
  const id = document.getElementById("discount-id").value;
  const code = document
    .getElementById("discount-code")
    .value.trim()
    .toUpperCase();
  const type = document.getElementById("discount-type").value;
  const value = parseFloat(document.getElementById("discount-value").value);
  const minPurchase =
    parseFloat(document.getElementById("discount-min-purchase").value) || 0;
  const usageLimit =
    parseInt(document.getElementById("discount-usage-limit").value) || null;
  const startDate = document.getElementById("discount-start-date").value;
  const endDate = document.getElementById("discount-end-date").value;
  const description = document
    .getElementById("discount-description")
    .value.trim();

  // Validation
  if (!code || !value || !startDate || !endDate) {
    showNotification(
      "Por favor completa todos los campos requeridos",
      "warning"
    );
    return;
  }

  if (new Date(endDate) <= new Date(startDate)) {
    showNotification(
      "La fecha de expiración debe ser posterior a la fecha de inicio",
      "warning"
    );
    return;
  }

  if (type === "percentage" && (value <= 0 || value > 100)) {
    showNotification("El porcentaje debe estar entre 1 y 100", "warning");
    return;
  }

  const saveBtn = document.getElementById("save-btn-text");
  const saveLoading = document.getElementById("save-loading");

  saveBtn.style.display = "none";
  saveLoading.style.display = "inline-block";

  try {
    const discountData = {
      codigo: code,
      tipo_descuento: type,
      valor_descuento: value,
      compra_minima: minPurchase,
      limite_uso: usageLimit,
      fecha_inicio: startDate,
      fecha_expiracion: endDate,
      descripcion: description || null,
    };

    // Create or update discount
    let response;
    if (id) {
      response = await apiCall(`/descuentos/${id}`, {
        method: "PUT",
        body: JSON.stringify(discountData),
      });
    } else {
      response = await apiCall("/descuentos", {
        method: "POST",
        body: JSON.stringify(discountData),
      });
    }

    if (response.success) {
      showNotification(
        id
          ? "Descuento actualizado exitosamente"
          : "Descuento creado exitosamente",
        "success"
      );
      closeDiscountModal();
      await loadDiscounts();
    } else {
      throw new Error(response.message || "Error al guardar el descuento");
    }
  } catch (error) {
    console.error("Error saving discount:", error);
    showNotification(error.message || "Error al guardar el descuento", "error");
  } finally {
    saveBtn.style.display = "inline";
    saveLoading.style.display = "none";
  }
}

// Open delete modal
function openDeleteModal(id) {
  deleteDiscountId = id;
  document.getElementById("delete-modal").classList.add("active");
}

// Close delete modal
function closeDeleteModal() {
  deleteDiscountId = null;
  document.getElementById("delete-modal").classList.remove("active");
}

// Confirm delete
async function confirmDelete() {
  if (!deleteDiscountId) return;

  try {
    const response = await apiCall(`/descuentos/${deleteDiscountId}`, {
      method: "DELETE",
    });

    if (response.success) {
      showNotification("Descuento eliminado exitosamente", "success");
      closeDeleteModal();
      await loadDiscounts();
    } else {
      throw new Error(response.message || "Error al eliminar el descuento");
    }
  } catch (error) {
    console.error("Error deleting discount:", error);
    showNotification(
      error.message || "Error al eliminar el descuento",
      "error"
    );
  }
}

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  // Add event listeners for filters
  document
    .getElementById("search-input")
    ?.addEventListener("input", filterDiscounts);
  document
    .getElementById("status-filter")
    ?.addEventListener("change", filterDiscounts);

  // Load initial data
  loadDiscounts();
});

// Expose functions globally
window.toggleDiscountType = toggleDiscountType;
window.openDiscountModal = openDiscountModal;
window.closeDiscountModal = closeDiscountModal;
window.editDiscount = editDiscount;
window.saveDiscount = saveDiscount;
window.openDeleteModal = openDeleteModal;
window.closeDeleteModal = closeDeleteModal;
window.confirmDelete = confirmDelete;

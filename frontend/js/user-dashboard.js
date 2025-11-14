// js/user-dashboard.js

document.addEventListener('DOMContentLoaded', async () => {
    checkAuth();
    await loadUserProfile();
    await loadUserOrders();
});

async function loadUserProfile() {
    try {
        const response = await API.Auth.getProfile();
        const user = response.data;
        
        // Renderizar perfil
        document.getElementById('user-name').textContent = `${user.nombre} ${user.apellido}`;
        document.getElementById('user-email').textContent = user.email;
        document.getElementById('user-phone').textContent = user.telefono || 'No registrado';
        
        // Renderizar estadísticas
        if (user.stats) {
            document.getElementById('total-orders').textContent = user.stats.total_pedidos;
            document.getElementById('total-spent').textContent = API.formatPrice(user.stats.total_gastado);
            document.getElementById('total-reviews').textContent = user.stats.total_valoraciones;
        }
        
    } catch (error) {
        console.error('Error cargando perfil:', error);
        API.showNotification('Error cargando perfil', 'error');
    }
}

async function loadUserOrders() {
    const user = API.getUser();
    
    try {
        const response = await API.Pedidos.getAll({ id_usuario: user.id_usuario });
        const orders = response.data;
        
        const ordersContainer = document.getElementById('user-orders');
        ordersContainer.innerHTML = '';
        
        orders.forEach(order => {
            const orderElement = document.createElement('div');
            orderElement.className = 'order-card';
            orderElement.innerHTML = `
                <div class="order-header">
                    <span class="order-id">Pedido #${order.id_pedido}</span>
                    <span class="order-status status-${order.estado}">${order.estado}</span>
                </div>
                <div class="order-details">
                    <p><strong>Fecha:</strong> ${API.formatDate(order.fecha_pedido)}</p>
                    <p><strong>Total:</strong> ${API.formatPrice(order.total)}</p>
                    <p><strong>Items:</strong> ${order.total_items}</p>
                </div>
                <button class="btn btn-outline" onclick="viewOrder(${order.id_pedido})">
                    Ver Detalles
                </button>
            `;
            ordersContainer.appendChild(orderElement);
        });
        
    } catch (error) {
        console.error('Error cargando pedidos:', error);
        API.showNotification('Error cargando pedidos', 'error');
    }
}

async function viewOrder(id) {
    window.location.href = `/html/order-detail.html?id=${id}`;
}
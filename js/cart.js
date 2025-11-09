// js/cart.js

// Agregar producto al carrito
async function addToCart(id_producto, cantidad = 1) {
    const user = API.getUser();
    
    if (!user) {
        API.showNotification('Debes iniciar sesión para agregar al carrito', 'warning');
        window.location.href = '/html/login.html';
        return;
    }

    try {
        const response = await API.Carrito.add(user.id_usuario, id_producto, cantidad);
        
        if (response.success) {
            API.showNotification('Producto agregado al carrito', 'success');
            await API.updateCartCount();
        }
    } catch (error) {
        API.showNotification(error.message || 'Error agregando al carrito', 'error');
    }
}

// Cargar carrito completo
async function loadCart() {
    const user = API.getUser();
    if (!user) {
        window.location.href = '/html/login.html';
        return;
    }

    try {
        const response = await API.Carrito.get(user.id_usuario);
        const { items, totales } = response.data;
        
        renderCartItems(items);
        renderCartTotals(totales);
        
    } catch (error) {
        console.error('Error cargando carrito:', error);
        API.showNotification('Error cargando carrito', 'error');
    }
}

function renderCartItems(items) {
    const cartContainer = document.getElementById('cart-items');
    cartContainer.innerHTML = '';
    
    if (items.length === 0) {
        cartContainer.innerHTML = '<p class="empty-cart">Tu carrito está vacío</p>';
        return;
    }
    
    items.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'cart-item';
        itemElement.innerHTML = `
            <img src="${item.imagen_url}" alt="${item.nombre}">
            <div class="item-details">
                <h4>${item.nombre}</h4>
                <p>${API.formatPrice(item.precio)}</p>
            </div>
            <div class="item-quantity">
                <button onclick="updateQuantity(${item.id_carrito}, ${item.cantidad - 1})">-</button>
                <span>${item.cantidad}</span>
                <button onclick="updateQuantity(${item.id_carrito}, ${item.cantidad + 1})">+</button>
            </div>
            <div class="item-subtotal">
                ${API.formatPrice(item.subtotal)}
            </div>
            <button class="btn-remove" onclick="removeFromCart(${item.id_carrito})">
                ✕
            </button>
        `;
        cartContainer.appendChild(itemElement);
    });
}

function renderCartTotals(totales) {
    document.getElementById('cart-subtotal').textContent = API.formatPrice(totales.total || 0);
    document.getElementById('cart-total').textContent = API.formatPrice(totales.total || 0);
}

// Actualizar cantidad
async function updateQuantity(id_carrito, nuevaCantidad) {
    if (nuevaCantidad < 1) return;
    
    try {
        await API.Carrito.updateQuantity(id_carrito, nuevaCantidad);
        await loadCart();
    } catch (error) {
        API.showNotification('Error actualizando cantidad', 'error');
    }
}

// Eliminar del carrito
async function removeFromCart(id_carrito) {
    try {
        await API.Carrito.remove(id_carrito);
        API.showNotification('Producto eliminado del carrito', 'success');
        await loadCart();
        await API.updateCartCount();
    } catch (error) {
        API.showNotification('Error eliminando producto', 'error');
    }
}

// Procesar pedido
async function checkout() {
    const user = API.getUser();
    if (!user) return;

    try {
        // Obtener items del carrito
        const cartResponse = await API.Carrito.get(user.id_usuario);
        const { items, totales } = cartResponse.data;
        
        if (items.length === 0) {
            API.showNotification('El carrito está vacío', 'warning');
            return;
        }

        // Preparar datos del pedido
        const pedido = {
            id_usuario: user.id_usuario,
            subtotal: totales.total,
            impuestos: totales.total * 0.19, // 19% IVA
            envio: 15000, // Envío fijo
            total: totales.total * 1.19 + 15000,
            metodo_pago: document.getElementById('payment-method').value,
            direccion_envio: user.direccion,
        };

        const pedidoItems = items.map(item => ({
            id_producto: item.id_producto,
            cantidad: item.cantidad,
            precio_unitario: item.precio,
            subtotal: item.subtotal
        }));

        // Crear pedido
        const response = await API.Pedidos.create(pedido, pedidoItems);
        
        if (response.success) {
            API.showNotification('Pedido realizado exitosamente!', 'success');
            setTimeout(() => {
                window.location.href = `/html/order-confirmation.html?id=${response.data.id_pedido}`;
            }, 2000);
        }
        
    } catch (error) {
        API.showNotification('Error procesando pedido', 'error');
        console.error(error);
    }
}

document.addEventListener('DOMContentLoaded', loadCart);
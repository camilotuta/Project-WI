// js/home.js

// Cargar productos destacados al cargar la página
document.addEventListener('DOMContentLoaded', async () => {
    await loadFeaturedProducts();
    await loadCategories();
});

// Cargar productos destacados
async function loadFeaturedProducts() {
    try {
        const response = await API.Productos.getAll({ 
            destacado: true, 
            limit: 8 
        });
        
        const productsGrid = document.querySelector('.products-grid');
        productsGrid.innerHTML = '';
        
        response.data.forEach(producto => {
            const productCard = createProductCard(producto);
            productsGrid.appendChild(productCard);
        });
        
    } catch (error) {
        console.error('Error cargando productos:', error);
        API.showNotification('Error cargando productos', 'error');
    }
}

// Crear tarjeta de producto
function createProductCard(producto) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
        <div class="product-image">
            <img src="${producto.imagen_url || '/assets/images/placeholder.jpg'}" 
                 alt="${producto.nombre}">
            ${producto.oferta ? '<span class="product-badge">Oferta</span>' : ''}
        </div>
        <div class="product-content">
            <h3>${producto.nombre}</h3>
            <p>${producto.descripcion.substring(0, 100)}...</p>
            <div class="product-price">
                <span class="current-price">${API.formatPrice(producto.precio)}</span>
                ${producto.precio_original ? 
                    `<span class="original-price">${API.formatPrice(producto.precio_original)}</span>` 
                    : ''}
            </div>
            <div class="product-rating">
                ${'⭐'.repeat(Math.round(producto.valoracion_promedio))}
                <span>(${producto.total_valoraciones} reseñas)</span>
            </div>
            <button class="btn btn-primary" onclick="addToCart(${producto.id_producto})">
                Agregar al Carrito
            </button>
            <a href="/html/product-detail.html?id=${producto.id_producto}" class="btn btn-outline">
                Ver Detalles
            </a>
        </div>
    `;
    return card;
}
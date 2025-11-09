// js/product-detail.js

document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    
    if (productId) {
        await loadProductDetails(productId);
        await loadProductReviews(productId);
        await loadRelatedProducts(productId);
    }
});

async function loadProductDetails(id) {
    try {
        const response = await API.Productos.getById(id);
        const producto = response.data;
        
        // Renderizar detalles del producto
        document.getElementById('product-name').textContent = producto.nombre;
        document.getElementById('product-description').textContent = producto.descripcion;
        document.getElementById('product-price').textContent = API.formatPrice(producto.precio);
        document.getElementById('product-image').src = producto.imagen_url || '/assets/images/placeholder.jpg';
        
        // Si es un suplemento, cargar información adicional
        if (producto.id_categoria === 4) { // Categoría suplementos
            await loadSupplementInfo(id);
        }
        
    } catch (error) {
        console.error('Error cargando producto:', error);
        API.showNotification('Error cargando producto', 'error');
    }
}

async function loadSupplementInfo(id_producto) {
    try {
        const response = await API.Suplementos.getByProductId(id_producto);
        const suplemento = response.data;
        
        // Renderizar información del suplemento
        const supplementInfo = document.getElementById('supplement-info');
        supplementInfo.innerHTML = `
            <h3>Información del Suplemento</h3>
            <p><strong>Tipo:</strong> ${suplemento.tipo}</p>
            <p><strong>Dosis recomendada:</strong> ${suplemento.dosis_recomendada}</p>
            <div class="ingredients">
                <strong>Ingredientes:</strong>
                <ul>${suplemento.ingredientes.map(ing => `<li>${ing}</li>`).join('')}</ul>
            </div>
            <div class="benefits">
                <strong>Beneficios:</strong>
                <ul>${suplemento.beneficios.map(ben => `<li>${ben}</li>`).join('')}</ul>
            </div>
            ${suplemento.advertencias ? `<p class="warning">${suplemento.advertencias}</p>` : ''}
        `;
        
    } catch (error) {
        console.error('Error cargando información del suplemento:', error);
    }
}

async function loadProductReviews(id) {
    try {
        const response = await API.Valoraciones.getByProduct(id);
        const reviews = response.data;
        
        const reviewsContainer = document.getElementById('reviews');
        reviewsContainer.innerHTML = '';
        
        reviews.forEach(review => {
            const reviewElement = document.createElement('div');
            reviewElement.className = 'review';
            reviewElement.innerHTML = `
                <div class="review-header">
                    <strong>${review.nombre_usuario}</strong>
                    <span class="review-rating">${'⭐'.repeat(review.puntuacion)}</span>
                </div>
                <p>${review.comentario}</p>
                <span class="review-date">${API.formatDate(review.fecha_valoracion)}</span>
            `;
            reviewsContainer.appendChild(reviewElement);
        });
        
    } catch (error) {
        console.error('Error cargando reseñas:', error);
    }
}

async function loadRelatedProducts(id) {
    try {
        const response = await API.Productos.getRelated(id);
        const related = response.data;
        
        const relatedContainer = document.getElementById('related-products');
        relatedContainer.innerHTML = '';
        
        related.forEach(producto => {
            const card = createProductCard(producto);
            relatedContainer.appendChild(card);
        });
        
    } catch (error) {
        console.error('Error cargando productos relacionados:', error);
    }
}
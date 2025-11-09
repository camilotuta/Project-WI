// js/auth.js

// Manejar registro
document.getElementById('registerForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
        nombre: document.getElementById('nombre').value,
        apellido: document.getElementById('apellido').value,
        email: document.getElementById('email').value,
        password: document.getElementById('password').value,
        telefono: document.getElementById('telefono').value,
        direccion: document.getElementById('direccion').value,
        ciudad: document.getElementById('ciudad').value,
    };

    try {
        const response = await API.Auth.register(formData);
        
        if (response.success) {
            API.showNotification('Registro exitoso! Redirigiendo...', 'success');
            setTimeout(() => {
                window.location.href = '/index.html';
            }, 2000);
        }
    } catch (error) {
        API.showNotification(error.message || 'Error en el registro', 'error');
    }
});

// Manejar login
document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await API.Auth.login(email, password);
        
        if (response.success) {
            API.showNotification('Login exitoso!', 'success');
            await API.updateCartCount();
            setTimeout(() => {
                window.location.href = '/index.html';
            }, 1500);
        }
    } catch (error) {
        API.showNotification(error.message || 'Credenciales inválidas', 'error');
    }
});

// Verificar autenticación en páginas protegidas
function checkAuth() {
    if (!API.Auth.isAuthenticated()) {
        window.location.href = '/html/login.html';
    }
}

// Logout
function logout() {
    API.Auth.logout();
}

// Actualizar UI según autenticación
function updateAuthUI() {
    const user = API.getUser();
    const authButtons = document.querySelector('.auth-buttons');
    
    if (user) {
        authButtons.innerHTML = `
            <span>Hola, ${user.nombre}!</span>
            <button class="btn btn-outline" onclick="logout()">Cerrar Sesión</button>
        `;
    } else {
        authButtons.innerHTML = `
            <a href="/html/login.html" class="btn btn-outline">Iniciar Sesión</a>
            <a href="/html/register.html" class="btn btn-primary">Registrarse</a>
        `;
    }
}

document.addEventListener('DOMContentLoaded', updateAuthUI);
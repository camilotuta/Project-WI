# 🌿 Greenhouse Fitness - E-commerce Platform

Plataforma de comercio electrónico para productos de fitness y suplementos naturales.

## 🚀 Inicio Rápido

### Opción 1: Script Automático (Recomendado)

```powershell
# Ejecutar desde la raíz del proyecto
.\start.ps1
```

Este script:

- ✅ Verifica e instala dependencias automáticamente
- ✅ Inicia el backend (Puerto 3000)
- ✅ Inicia la compilación de Tailwind CSS
- ✅ Muestra instrucciones para abrir el frontend

### Opción 2: Manual

#### Backend

```powershell
cd backend
npm install
npm run dev
```

#### Frontend

```powershell
cd frontend
npm install
npm run watch:css
```

Luego abre `frontend/index.html` con Live Server.

## 📋 Requisitos Previos

- **Node.js** v18 o superior
- **PostgreSQL** instalado y corriendo
- **npm** (incluido con Node.js)
- **VS Code** con extensión Live Server (para frontend)

## 🗄️ Configuración de Base de Datos

1. Crear base de datos PostgreSQL
2. Configurar variables de entorno en `backend/.env`:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=greenhouse_fitness
DB_USER=tu_usuario
DB_PASSWORD=tu_password
JWT_SECRET=tu_secreto_super_seguro
```

## 📁 Estructura del Proyecto

```
Proyecto/
├── backend/          # API REST (Node.js + Express)
├── frontend/         # Cliente web (HTML + CSS + JS)
├── admin/           # Panel administrativo
├── start.ps1        # Script de inicialización
└── README.md        # Este archivo
```

## 🌐 URLs de Acceso

- **Frontend:** http://127.0.0.1:5500 (Live Server)
- **Backend API:** http://localhost:3000/api
- **Admin Panel:** Abrir `admin/index.html` con Live Server

## 🛠️ Tecnologías

### Frontend

- HTML5
- Tailwind CSS 3.4.17
- JavaScript ES6+

### Backend

- Node.js
- Express.js 4.21.2
- PostgreSQL
- JWT + bcrypt

## 📖 Documentación

Ver `DOCUMENTACION_TECNICA.md` para documentación completa del proyecto.

## 👥 Autor

Camilo Tuta - Proyecto Ingeniería Web I

## 📄 Licencia

MIT

# 🌿 Panel de Administración - Greenhouse Fitness

Panel de administración completo para gestionar la tienda online de Greenhouse Fitness.

## 📋 Características

### ✅ Gestión Completa de Datos

- **Productos**: CRUD completo con upload de imágenes automático
- **Usuarios**: Crear, editar y eliminar usuarios
- **Categorías**: Administrar categorías de productos
- **Descuentos**: Gestionar códigos promocionales y descuentos

### 🖼️ Sistema de Imágenes

- Upload automático de imágenes de productos
- Las imágenes se guardan en `frontend/assets/images/products/`
- Previsualización en tiempo real
- Soporte para: png, JPG, PNG, GIF, WEBP
- Límite de tamaño: 5MB por imagen

### 📊 Dashboard

- Estadísticas en tiempo real
- Productos recientes
- Usuarios recientes
- Contador de categorías y descuentos activos

## 🚀 Instalación

### 1. Instalar dependencia para upload de archivos

```bash
cd backend
npm install multer
```

### 2. Estructura de archivos creada

```
admin/
├── css/
│   └── admin.css          # Estilos del admin panel
├── js/
│   ├── api.js             # Configuración API compartida
│   ├── dashboard.js       # Lógica del dashboard
│   ├── products.js        # CRUD de productos
│   ├── users.js           # CRUD de usuarios
│   ├── categories.js      # CRUD de categorías
│   └── discounts.js       # CRUD de descuentos
└── pages/
    ├── dashboard.html     # Página principal
    ├── products.html      # Gestión de productos
    ├── users.html         # Gestión de usuarios
    ├── categories.html    # Gestión de categorías
    └── discounts.html     # Gestión de descuentos
```

### 3. Backend

Se agregaron las siguientes rutas y controladores:

- `backend/controllers/upload.controller.js` - Manejo de uploads
- `backend/routes/upload.routes.js` - Rutas de upload
- Endpoint: `POST /api/upload` - Subir imagen
- Endpoint: `DELETE /api/upload/:filename` - Eliminar imagen

## 💻 Uso

### Acceder al Panel

1. Abrir el archivo: `admin/pages/dashboard.html` en el navegador
2. O usar Live Server en VSCode

### Crear un Producto con Imagen

1. Ir a **Productos** → **Nuevo Producto**
2. Completar todos los campos requeridos
3. Seleccionar una imagen desde tu computadora
4. Ver previsualización de la imagen
5. Click en **Guardar Producto**
6. La imagen se guarda automáticamente en `frontend/assets/images/products/`
7. La ruta se registra en la base de datos

### Gestionar Usuarios

- **Crear**: Todos los campos requeridos + contraseña
- **Editar**: Actualizar datos sin necesidad de contraseña
- **Eliminar**: Confirmación antes de eliminar

### Gestionar Categorías

- Crear categorías para organizar productos
- Editar nombre y descripción
- Vista de tarjetas para fácil visualización

### Gestionar Descuentos

- **Tipos**: Porcentaje o Monto Fijo
- **Configuración**: Compra mínima, límite de usos
- **Vigencia**: Fechas de inicio y expiración
- **Estados**: Activo, Expirado, Agotado, Pendiente

## 🎨 Características de UI

### Diseño Responsive

- Adaptado para desktop y móvil
- Sidebar colapsable en móviles

### Sistema de Notificaciones

- Toast notifications para todas las acciones
- Tipos: Success, Error, Warning
- Auto-desaparece en 3 segundos

### Filtros y Búsqueda

- Búsqueda en tiempo real
- Filtros por categoría, estado, etc.
- Resultados instantáneos

### Modales

- Formularios en modales para mejor UX
- Confirmación antes de eliminar
- Validación de datos en frontend

## 🔐 Seguridad

### Recomendaciones

- Agregar autenticación de admin
- Implementar roles (admin, editor, viewer)
- Agregar middleware de autenticación en las rutas
- Validar permisos antes de operaciones críticas

### Ejemplo de autenticación (agregar después)

```javascript
// En backend/routes/upload.routes.js
import { authMiddleware, adminOnly } from "../middleware/auth.middleware.js";

router.post(
  "/",
  authMiddleware,
  adminOnly,
  upload.single("image"),
  uploadImage,
);
```

## 📝 Estructura de Base de Datos

### Productos

```sql
CREATE TABLE productos (
  id_producto SERIAL PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  precio DECIMAL(10,2) NOT NULL,
  stock_disponible INTEGER,
  imagen_url VARCHAR(500),
  id_categoria INTEGER REFERENCES categorias(id_categoria),
  marca VARCHAR(100),
  destacado BOOLEAN DEFAULT FALSE
);
```

### Usuarios

```sql
CREATE TABLE usuarios (
  id_usuario SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100),
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  telefono VARCHAR(20),
  direccion TEXT,
  ciudad VARCHAR(100),
  codigo_postal VARCHAR(20),
  fecha_nacimiento DATE,
  fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Categorías

```sql
CREATE TABLE categorias (
  id_categoria SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT
);
```

### Descuentos

```sql
CREATE TABLE descuentos (
  id_descuento SERIAL PRIMARY KEY,
  codigo VARCHAR(50) UNIQUE NOT NULL,
  tipo_descuento VARCHAR(20) NOT NULL, -- 'percentage' o 'fixed'
  valor_descuento DECIMAL(10,2) NOT NULL,
  compra_minima DECIMAL(10,2),
  limite_uso INTEGER,
  veces_usado INTEGER DEFAULT 0,
  fecha_inicio DATE NOT NULL,
  fecha_expiracion DATE NOT NULL,
  descripcion TEXT
);
```

## 🐛 Troubleshooting

### Error: Cannot find module 'multer'

```bash
cd backend
npm install multer
npm run dev
```

### Error: ENOENT - no such file or directory

- Verificar que la ruta `frontend/assets/images/products/` existe
- El controlador la crea automáticamente si no existe

### Imágenes no se muestran

- Verificar que la ruta en la BD empiece con `/assets/images/products/`
- Verificar permisos de escritura en la carpeta

### CORS errors

- Verificar que el servidor backend esté corriendo
- Verificar configuración de CORS en `backend/server.js`

## 📚 API Endpoints

### Productos

- `GET /api/productos` - Obtener todos
- `GET /api/productos/:id` - Obtener uno
- `POST /api/productos` - Crear
- `PUT /api/productos/:id` - Actualizar
- `DELETE /api/productos/:id` - Eliminar

### Upload

- `POST /api/upload` - Subir imagen (multipart/form-data)
- `DELETE /api/upload/:filename` - Eliminar imagen

### Usuarios

- `GET /api/usuarios` - Obtener todos
- `GET /api/usuarios/:id` - Obtener uno
- `POST /api/usuarios` - Crear
- `PUT /api/usuarios/:id` - Actualizar
- `DELETE /api/usuarios/:id` - Eliminar

### Categorías

- `GET /api/categorias` - Obtener todas
- `GET /api/categorias/:id` - Obtener una
- `POST /api/categorias` - Crear
- `PUT /api/categorias/:id` - Actualizar
- `DELETE /api/categorias/:id` - Eliminar

### Descuentos

- `GET /api/descuentos` - Obtener todos
- `GET /api/descuentos/:id` - Obtener uno
- `POST /api/descuentos` - Crear
- `PUT /api/descuentos/:id` - Actualizar
- `DELETE /api/descuentos/:id` - Eliminar

## 🎯 Próximos Pasos

1. **Autenticación**: Agregar login de administrador
2. **Roles**: Implementar sistema de roles y permisos
3. **Logs**: Registrar todas las acciones de admin
4. **Backup**: Sistema de respaldo de imágenes
5. **Reportes**: Generar reportes de ventas y productos
6. **Analytics**: Dashboard con gráficas y estadísticas avanzadas

## 💡 Tips

- Las imágenes grandes se optimizan automáticamente
- Usa nombres descriptivos para las imágenes
- Mantén las categorías organizadas
- Revisa los descuentos expirados regularmente
- Haz backup de las imágenes periódicamente

---

✅ **Panel de Administración listo para usar!**

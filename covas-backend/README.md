# COVAS Backend - API REST

Backend para el sistema administrativo de COVAS (Comercializadora Vascular).

## 🚀 Instalación y Configuración

### 1. Instalar dependencias

```bash
cd covas-backend
npm install
```

### 2. Configurar variables de entorno

El archivo `.env` ya está creado con:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/covas
JWT_SECRET=covas_secret_key_2025_change_this_in_production
NODE_ENV=development
```

### 3. Asegúrate que MongoDB esté corriendo

```bash
# En Windows, verifica que el servicio esté activo
# O inicia MongoDB manualmente:
mongod
```

### 4. Inicializar la base de datos

```bash
node seed.js
```

Esto creará:
- ✅ Usuario admin (username: `admin`, password: `admin123`)
- ✅ 6 productos de ejemplo

### 5. Iniciar el servidor

```bash
# Modo desarrollo (con nodemon - reinicia automáticamente)
npm run dev

# O modo producción
npm start
```

El servidor estará corriendo en: **http://localhost:5000**

## 📡 Endpoints de la API

### Autenticación

```http
POST /api/auth/login
Body: { "username": "admin", "password": "admin123" }
Retorna: { token, usuario }

GET /api/auth/me
Headers: Authorization: Bearer {token}
Retorna: Datos del usuario actual

POST /api/auth/verificar
Headers: Authorization: Bearer {token}
Retorna: Validación del token
```

### Mensajes (Contacto)

```http
# Público - Enviar mensaje desde el formulario
POST /api/mensajes
Body: { nombre, email, empresa, telefono, tipoConsulta, mensaje }

# Protegido - Requiere token de admin
GET /api/mensajes
Headers: Authorization: Bearer {token}
Retorna: Lista de todos los mensajes

GET /api/mensajes/:id
Headers: Authorization: Bearer {token}
Retorna: Un mensaje específico

PATCH /api/mensajes/:id
Headers: Authorization: Bearer {token}
Body: { leido, respondido, notas }

DELETE /api/mensajes/:id
Headers: Authorization: Bearer {token}
Elimina un mensaje

DELETE /api/mensajes
Headers: Authorization: Bearer {token}
Elimina todos los mensajes

GET /api/mensajes/admin/stats
Headers: Authorization: Bearer {token}
Retorna: Estadísticas de mensajes
```

### Productos

```http
# Público - Ver productos
GET /api/productos
Query params: ?categoria=quirurgico&activo=true&search=guantes
Retorna: Lista de productos

GET /api/productos/:id
Retorna: Un producto específico

# Protegido - Requiere token de admin
POST /api/productos
Headers: Authorization: Bearer {token}
Body: { nombre, categoria, descripcion, caracteristicas, imagen, emoji, precio, stock }

PUT /api/productos/:id
Headers: Authorization: Bearer {token}
Body: Campos a actualizar

DELETE /api/productos/:id
Headers: Authorization: Bearer {token}
Elimina un producto

GET /api/productos/admin/stats
Headers: Authorization: Bearer {token}
Retorna: Estadísticas de productos
```

## 📁 Estructura del Proyecto

```
covas-backend/
├── server.js              # Servidor principal
├── seed.js                # Inicializar BD
├── package.json           # Dependencias
├── .env                   # Variables de entorno
├── models/
│   ├── Usuario.js         # Modelo de usuarios
│   ├── Mensaje.js         # Modelo de mensajes
│   └── Producto.js        # Modelo de productos
├── routes/
│   ├── auth.js            # Rutas de autenticación
│   ├── mensajes.js        # Rutas de mensajes
│   └── productos.js       # Rutas de productos
└── middleware/
    └── auth.js            # Middleware de autenticación JWT
```

## 🔐 Seguridad

- Las contraseñas se hashean con bcrypt
- Autenticación con JWT (tokens válidos por 7 días)
- Rutas protegidas con middleware de autenticación
- Validación de datos con express-validator
- CORS habilitado para el frontend

## 🛠️ Tecnologías

- **Node.js** v22.16.0
- **Express.js** - Framework web
- **MongoDB** v8.0.10 - Base de datos
- **Mongoose** - ODM para MongoDB
- **JWT** - Autenticación
- **bcryptjs** - Hash de contraseñas

## 📝 Credenciales por defecto

```
Usuario: admin
Contraseña: admin123
```

⚠️ **IMPORTANTE**: Cambia estas credenciales en producción!

## 🐛 Troubleshooting

### MongoDB no se conecta
```bash
# Verifica que MongoDB esté corriendo
mongosh
# O en Windows, verifica el servicio
```

### Puerto 5000 ocupado
Cambia el puerto en el archivo `.env`:
```
PORT=3000
```

### Error de dependencias
```bash
rm -rf node_modules package-lock.json
npm install
```

## 📞 Soporte

Para dudas o problemas, contacta al equipo de desarrollo.

---

**COVAS Backend v1.0.0** - 2025
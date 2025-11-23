/* ==========================================
   COVAS - SERVIDOR BACKEND
   Archivo: server.js
   ========================================== */

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Cargar variables de entorno
dotenv.config();

// Importar rutas
const authRoutes = require('./routes/auth');
const mensajesRoutes = require('./routes/mensajes');
const productosRoutes = require('./routes/productos');

// Crear aplicación Express
const app = express();

// ==========================================
// MIDDLEWARES
// ==========================================
app.use(cors()); // Permitir CORS para el frontend
app.use(express.json()); // Parsear JSON
app.use(express.urlencoded({ extended: true })); // Parsear formularios

// Middleware para logging
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
});

// ==========================================
// CONEXIÓN A MONGODB
// ==========================================
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('✅ Conectado a MongoDB');
    })
    .catch((error) => {
        console.error('❌ Error conectando a MongoDB:', error.message);
        process.exit(1);
    });

// ==========================================
// RUTAS
// ==========================================
app.get('/', (req, res) => {
    res.json({
        message: 'API COVAS funcionando correctamente',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            mensajes: '/api/mensajes',
            productos: '/api/productos'
        }
    });
});

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/mensajes', mensajesRoutes);
app.use('/api/productos', productosRoutes);

// Ruta 404
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Ruta no encontrada'
    });
});

// Manejo de errores global
app.use((err, req, res, next) => {
    console.error('Error:', err.message);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Error del servidor'
    });
});

// ==========================================
// INICIAR SERVIDOR
// ==========================================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`\n🚀 Servidor corriendo en http://localhost:${PORT}`);
    console.log(`📝 Documentación: http://localhost:${PORT}/\n`);
});
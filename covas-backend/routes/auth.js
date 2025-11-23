/* ==========================================
   RUTAS: Autenticación
   ========================================== */

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const Usuario = require('../models/Usuario');
const { verificarToken } = require('../middleware/auth');

// ==========================================
// POST /api/auth/login - Login
// ==========================================
router.post('/login', [
    body('username').trim().notEmpty().withMessage('El username es requerido'),
    body('password').notEmpty().withMessage('La contraseña es requerida')
], async(req, res) => {
    try {
        // Validar errores
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const { username, password } = req.body;

        // Buscar usuario
        const usuario = await Usuario.findOne({ username });

        if (!usuario) {
            return res.status(401).json({
                success: false,
                message: 'Credenciales incorrectas'
            });
        }

        // Verificar contraseña
        const passwordValido = await usuario.compararPassword(password);

        if (!passwordValido) {
            return res.status(401).json({
                success: false,
                message: 'Credenciales incorrectas'
            });
        }

        // Verificar si está activo
        if (!usuario.activo) {
            return res.status(401).json({
                success: false,
                message: 'Usuario inactivo'
            });
        }

        // Actualizar último acceso
        usuario.ultimoAcceso = new Date();
        await usuario.save();

        // Generar token JWT
        const token = jwt.sign({
                id: usuario._id,
                username: usuario.username,
                rol: usuario.rol
            },
            process.env.JWT_SECRET, { expiresIn: '7d' } // Token válido por 7 días
        );

        res.json({
            success: true,
            message: 'Login exitoso',
            token,
            usuario: {
                id: usuario._id,
                username: usuario.username,
                nombre: usuario.nombre,
                email: usuario.email,
                rol: usuario.rol
            }
        });

    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({
            success: false,
            message: 'Error en el servidor'
        });
    }
});

// ==========================================
// GET /api/auth/me - Obtener usuario actual
// ==========================================
router.get('/me', verificarToken, async(req, res) => {
    try {
        res.json({
            success: true,
            usuario: req.usuario
        });
    } catch (error) {
        console.error('Error obteniendo usuario:', error);
        res.status(500).json({
            success: false,
            message: 'Error en el servidor'
        });
    }
});

// ==========================================
// POST /api/auth/verificar - Verificar token
// ==========================================
router.post('/verificar', verificarToken, (req, res) => {
    res.json({
        success: true,
        message: 'Token válido',
        usuario: req.usuario
    });
});

module.exports = router;
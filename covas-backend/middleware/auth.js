/* ==========================================
   MIDDLEWARE: Autenticación JWT
   ========================================== */

const jwt = require('jsonwebtoken');
// Usamos tu corrección con minúscula, ¡perfecto!
const Usuario = require('../models/usuario');

// Verificar token JWT
const verificarToken = async(req, res, next) => {
    try {
        // Obtener token del header
        // ========= ¡ESTA ES LA LÍNEA CORREGIDA! =========
        const token = req.header('Authorization') ? req.header('Authorization').replace('Bearer ', '') : null;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No se proporcionó token de autenticación'
            });
        }

        // Verificar token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Buscar usuario
        const usuario = await Usuario.findById(decoded.id).select('-password');

        if (!usuario) {
            return res.status(401).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        if (!usuario.activo) {
            return res.status(401).json({
                success: false,
                message: 'Usuario inactivo'
            });
        }

        // Agregar usuario al request
        req.usuario = usuario;
        next();

    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Token inválido'
            });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expirado'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error en la autenticación'
        });
    }
};

// Verificar si es superadmin
const esSuperAdmin = (req, res, next) => {
    if (req.usuario.rol !== 'superadmin') {
        return res.status(403).json({
            success: false,
            message: 'No tienes permisos para realizar esta acción'
        });
    }
    next();
};

module.exports = {
    verificarToken,
    esSuperAdmin
};
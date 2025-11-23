/* ==========================================
   RUTAS: Mensajes de Contacto
   ========================================== */

const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Mensaje = require('../models/Mensaje');
const { verificarToken } = require('../middleware/auth');

// ==========================================
// POST /api/mensajes - Crear mensaje (público)
// ==========================================
router.post('/', [
    body('nombre').trim().notEmpty().withMessage('El nombre es requerido'),
    body('email').isEmail().withMessage('Email inválido'),
    body('telefono').trim().notEmpty().withMessage('El teléfono es requerido'),
    body('tipoConsulta').isIn(['cotizacion', 'informacion', 'servicio', 'distribuidor', 'otro']).withMessage('Tipo de consulta inválido'),
    body('mensaje').trim().isLength({ min: 10 }).withMessage('El mensaje debe tener al menos 10 caracteres')
], async(req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const { nombre, email, empresa, telefono, tipoConsulta, mensaje } = req.body;

        const nuevoMensaje = new Mensaje({
            nombre,
            email,
            empresa: empresa || '',
            telefono,
            tipoConsulta,
            mensaje
        });

        await nuevoMensaje.save();

        res.status(201).json({
            success: true,
            message: 'Mensaje enviado correctamente',
            data: nuevoMensaje
        });

    } catch (error) {
        console.error('Error creando mensaje:', error);
        res.status(500).json({
            success: false,
            message: 'Error al enviar el mensaje'
        });
    }
});

// ==========================================
// GET /api/mensajes - Obtener todos los mensajes (protegido)
// ==========================================
router.get('/', verificarToken, async(req, res) => {
    try {
        const { leido, tipoConsulta, limit = 100, page = 1 } = req.query;

        // Construir filtros
        const filtros = {};
        if (leido !== undefined) filtros.leido = leido === 'true';
        if (tipoConsulta) filtros.tipoConsulta = tipoConsulta;

        // Paginación
        const skip = (page - 1) * limit;

        const mensajes = await Mensaje.find(filtros)
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip(skip);

        const total = await Mensaje.countDocuments(filtros);

        res.json({
            success: true,
            data: mensajes,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('Error obteniendo mensajes:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener mensajes'
        });
    }
});

// ==========================================
// GET /api/mensajes/:id - Obtener un mensaje (protegido)
// ==========================================
router.get('/:id', verificarToken, async(req, res) => {
    try {
        const mensaje = await Mensaje.findById(req.params.id);

        if (!mensaje) {
            return res.status(404).json({
                success: false,
                message: 'Mensaje no encontrado'
            });
        }

        // Marcar como leído
        if (!mensaje.leido) {
            mensaje.leido = true;
            await mensaje.save();
        }

        res.json({
            success: true,
            data: mensaje
        });

    } catch (error) {
        console.error('Error obteniendo mensaje:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener mensaje'
        });
    }
});

// ==========================================
// PATCH /api/mensajes/:id - Actualizar mensaje (protegido)
// ==========================================
router.patch('/:id', verificarToken, async(req, res) => {
    try {
        const { leido, respondido, notas } = req.body;

        const mensaje = await Mensaje.findById(req.params.id);

        if (!mensaje) {
            return res.status(404).json({
                success: false,
                message: 'Mensaje no encontrado'
            });
        }

        if (leido !== undefined) mensaje.leido = leido;
        if (respondido !== undefined) mensaje.respondido = respondido;
        if (notas !== undefined) mensaje.notas = notas;

        await mensaje.save();

        res.json({
            success: true,
            message: 'Mensaje actualizado',
            data: mensaje
        });

    } catch (error) {
        console.error('Error actualizando mensaje:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar mensaje'
        });
    }
});

// ==========================================
// DELETE /api/mensajes/:id - Eliminar mensaje (protegido)
// ==========================================
router.delete('/:id', verificarToken, async(req, res) => {
    try {
        const mensaje = await Mensaje.findByIdAndDelete(req.params.id);

        if (!mensaje) {
            return res.status(404).json({
                success: false,
                message: 'Mensaje no encontrado'
            });
        }

        res.json({
            success: true,
            message: 'Mensaje eliminado correctamente'
        });

    } catch (error) {
        console.error('Error eliminando mensaje:', error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar mensaje'
        });
    }
});

// ==========================================
// DELETE /api/mensajes - Eliminar todos los mensajes (protegido)
// ==========================================
router.delete('/', verificarToken, async(req, res) => {
    try {
        const resultado = await Mensaje.deleteMany({});

        res.json({
            success: true,
            message: `${resultado.deletedCount} mensajes eliminados correctamente`
        });

    } catch (error) {
        console.error('Error eliminando mensajes:', error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar mensajes'
        });
    }
});

// ==========================================
// GET /api/mensajes/stats - Estadísticas (protegido)
// ==========================================
router.get('/admin/stats', verificarToken, async(req, res) => {
    try {
        const total = await Mensaje.countDocuments();
        const noLeidos = await Mensaje.countDocuments({ leido: false });
        const porTipo = await Mensaje.aggregate([
            { $group: { _id: '$tipoConsulta', count: { $sum: 1 } } }
        ]);

        res.json({
            success: true,
            data: {
                total,
                noLeidos,
                leidos: total - noLeidos,
                porTipo
            }
        });

    } catch (error) {
        console.error('Error obteniendo estadísticas:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener estadísticas'
        });
    }
});

module.exports = router;
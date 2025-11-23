/* ==========================================
   RUTAS: Productos
   ========================================== */

const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Producto = require('../models/Producto');
const { verificarToken } = require('../middleware/auth');

// ==========================================
// GET /api/productos - Obtener productos (público)
// ==========================================
router.get('/', async(req, res) => {
    try {
        const { categoria, activo = 'true', destacado, search } = req.query;

        // Construir filtros
        const filtros = {};
        if (categoria) filtros.categoria = categoria;
        if (activo !== 'all') filtros.activo = activo === 'true';
        if (destacado) filtros.destacado = destacado === 'true';

        // Búsqueda por texto
        if (search) {
            filtros.$text = { $search: search };
        }

        const productos = await Producto.find(filtros)
            .sort({ orden: 1, createdAt: -1 });

        res.json({
            success: true,
            data: productos,
            total: productos.length
        });

    } catch (error) {
        console.error('Error obteniendo productos:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener productos'
        });
    }
});

// ==========================================
// GET /api/productos/:id - Obtener un producto (público)
// ==========================================
router.get('/:id', async(req, res) => {
    try {
        const producto = await Producto.findById(req.params.id);

        if (!producto) {
            return res.status(404).json({
                success: false,
                message: 'Producto no encontrado'
            });
        }

        res.json({
            success: true,
            data: producto
        });

    } catch (error) {
        console.error('Error obteniendo producto:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener producto'
        });
    }
});

// ==========================================
// POST /api/productos - Crear producto (protegido)
// ==========================================
router.post('/', verificarToken, [
    body('nombre').trim().notEmpty().withMessage('El nombre es requerido'),
    body('categoria').isIn(['quirurgico', 'vascular', 'consumibles', 'curacion']).withMessage('Categoría inválida'),
    body('descripcion').trim().notEmpty().withMessage('La descripción es requerida'),
    body('precio').optional().isFloat({ min: 0 }).withMessage('El precio debe ser mayor o igual a 0')
], async(req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const {
            nombre,
            categoria,
            descripcion,
            caracteristicas,
            imagen,
            emoji,
            precio,
            stock,
            activo,
            destacado,
            orden
        } = req.body;

        const nuevoProducto = new Producto({
            nombre,
            categoria,
            descripcion,
            caracteristicas: caracteristicas || [],
            imagen: imagen || '',
            emoji: emoji || '📦',
            precio: precio || 0,
            stock: stock || 0,
            activo: activo !== undefined ? activo : true,
            destacado: destacado || false,
            orden: orden || 0
        });

        await nuevoProducto.save();

        res.status(201).json({
            success: true,
            message: 'Producto creado correctamente',
            data: nuevoProducto
        });

    } catch (error) {
        console.error('Error creando producto:', error);
        res.status(500).json({
            success: false,
            message: 'Error al crear producto'
        });
    }
});

// ==========================================
// PUT /api/productos/:id - Actualizar producto (protegido)
// ==========================================
router.put('/:id', verificarToken, [
    body('nombre').optional().trim().notEmpty().withMessage('El nombre no puede estar vacío'),
    body('categoria').optional().isIn(['quirurgico', 'vascular', 'consumibles', 'curacion']).withMessage('Categoría inválida'),
    body('descripcion').optional().trim().notEmpty().withMessage('La descripción no puede estar vacía'),
    body('precio').optional().isFloat({ min: 0 }).withMessage('El precio debe ser mayor o igual a 0')
], async(req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const producto = await Producto.findById(req.params.id);

        if (!producto) {
            return res.status(404).json({
                success: false,
                message: 'Producto no encontrado'
            });
        }

        // Actualizar campos
        const camposPermitidos = [
            'nombre', 'categoria', 'descripcion', 'caracteristicas',
            'imagen', 'emoji', 'precio', 'stock', 'activo', 'destacado', 'orden'
        ];

        camposPermitidos.forEach(campo => {
            if (req.body[campo] !== undefined) {
                producto[campo] = req.body[campo];
            }
        });

        await producto.save();

        res.json({
            success: true,
            message: 'Producto actualizado correctamente',
            data: producto
        });

    } catch (error) {
        console.error('Error actualizando producto:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar producto'
        });
    }
});

// ==========================================
// DELETE /api/productos/:id - Eliminar producto (protegido)
// ==========================================
router.delete('/:id', verificarToken, async(req, res) => {
    try {
        const producto = await Producto.findByIdAndDelete(req.params.id);

        if (!producto) {
            return res.status(404).json({
                success: false,
                message: 'Producto no encontrado'
            });
        }

        res.json({
            success: true,
            message: 'Producto eliminado correctamente'
        });

    } catch (error) {
        console.error('Error eliminando producto:', error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar producto'
        });
    }
});

// ==========================================
// GET /api/productos/admin/stats - Estadísticas (protegido)
// ==========================================
router.get('/admin/stats', verificarToken, async(req, res) => {
    try {
        const total = await Producto.countDocuments();
        const activos = await Producto.countDocuments({ activo: true });
        const porCategoria = await Producto.aggregate([
            { $group: { _id: '$categoria', count: { $sum: 1 } } }
        ]);

        res.json({
            success: true,
            data: {
                total,
                activos,
                inactivos: total - activos,
                porCategoria
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
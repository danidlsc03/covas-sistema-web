/* ==========================================
   MODELO: Producto
   ========================================== */

const mongoose = require('mongoose');

const productoSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre es requerido'],
        trim: true
    },
    categoria: {
        type: String,
        enum: ['quirurgico', 'vascular', 'consumibles', 'curacion'],
        required: [true, 'La categoría es requerida']
    },
    descripcion: {
        type: String,
        required: [true, 'La descripción es requerida'],
        trim: true
    },
    caracteristicas: {
        type: [String],
        default: []
    },
    imagen: {
        type: String,
        default: ''
    },
    emoji: {
        type: String,
        default: '📦'
    },
    precio: {
        type: Number,
        default: 0,
        min: [0, 'El precio no puede ser negativo']
    },
    stock: {
        type: Number,
        default: 0,
        min: [0, 'El stock no puede ser negativo']
    },
    activo: {
        type: Boolean,
        default: true
    },
    destacado: {
        type: Boolean,
        default: false
    },
    orden: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Índices para búsquedas
productoSchema.index({ nombre: 'text', descripcion: 'text' });
productoSchema.index({ categoria: 1, activo: 1 });
productoSchema.index({ destacado: 1, orden: 1 });

// Método para obtener URL completa de imagen
productoSchema.methods.getImagenUrl = function() {
    if (this.imagen && !this.imagen.startsWith('http')) {
        return `${process.env.BASE_URL || 'http://localhost:5000'}/uploads/${this.imagen}`;
    }
    return this.imagen || '';
};

module.exports = mongoose.model('Producto', productoSchema);
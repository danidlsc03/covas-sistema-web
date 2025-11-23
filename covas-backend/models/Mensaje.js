/* ==========================================
   MODELO: Mensaje de Contacto
   ========================================== */

const mongoose = require('mongoose');

const mensajeSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre es requerido'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'El email es requerido'],
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Email inválido']
    },
    empresa: {
        type: String,
        trim: true,
        default: ''
    },
    telefono: {
        type: String,
        required: [true, 'El teléfono es requerido'],
        trim: true
    },
    tipoConsulta: {
        type: String,
        enum: ['cotizacion', 'informacion', 'servicio', 'distribuidor', 'otro'],
        required: [true, 'El tipo de consulta es requerido']
    },
    mensaje: {
        type: String,
        required: [true, 'El mensaje es requerido'],
        trim: true,
        minlength: [10, 'El mensaje debe tener al menos 10 caracteres']
    },
    leido: {
        type: Boolean,
        default: false
    },
    respondido: {
        type: Boolean,
        default: false
    },
    notas: {
        type: String,
        default: ''
    }
}, {
    timestamps: true // Crea automáticamente createdAt y updatedAt
});

// Índice para búsquedas más rápidas
mensajeSchema.index({ email: 1, createdAt: -1 });
mensajeSchema.index({ leido: 1 });

module.exports = mongoose.model('Mensaje', mensajeSchema);
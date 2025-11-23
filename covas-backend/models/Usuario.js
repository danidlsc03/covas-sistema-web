/* ==========================================
   MODELO: Usuario (Admin)
   ========================================== */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const usuarioSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'El username es requerido'],
        unique: true,
        trim: true,
        minlength: [3, 'El username debe tener al menos 3 caracteres']
    },
    password: {
        type: String,
        required: [true, 'La contraseña es requerida'],
        minlength: [6, 'La contraseña debe tener al menos 6 caracteres']
    },
    nombre: {
        type: String,
        required: [true, 'El nombre es requerido'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'El email es requerido'],
        unique: true,
        lowercase: true,
        trim: true
    },
    rol: {
        type: String,
        enum: ['admin', 'superadmin'],
        default: 'admin'
    },
    activo: {
        type: Boolean,
        default: true
    },
    ultimoAcceso: {
        type: Date
    }
}, {
    timestamps: true // Crea automáticamente createdAt y updatedAt
});

// Hash de contraseña antes de guardar
usuarioSchema.pre('save', async function(next) {
    // Solo hashear si la contraseña fue modificada
    if (!this.isModified('password')) {
        return next();
    }

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Método para comparar contraseñas
usuarioSchema.methods.compararPassword = async function(passwordIngresado) {
    return await bcrypt.compare(passwordIngresado, this.password);
};

// No devolver el password en las respuestas JSON
usuarioSchema.methods.toJSON = function() {
    const usuario = this.toObject();
    delete usuario.password;
    return usuario;
};

module.exports = mongoose.model('Usuario', usuarioSchema);
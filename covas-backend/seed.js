/* ==========================================
   SEED: Carga Masiva COMPLETA (Corregido)
   Ejecutar: node seed.js
   ========================================== */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Usuario = require('./models/Usuario');
const Producto = require('./models/Producto');

// Nota: Ya no necesitamos bcrypt aquí porque el modelo lo hace solo
// const bcrypt = require('bcryptjs'); 

dotenv.config();

// Datos del Admin
const usuarioAdmin = {
    username: 'admin',
    nombre: 'Administrador',
    email: 'admin@covas.com',
    password: 'CovasMaster2025!', // <--- CONTRASEÑA EN TEXTO PLANO (El modelo la encriptará)
    rol: 'superadmin',
    activo: true
};

const productosCompletos = [
    // =========================================
    // 1. PRODUCTOS REALES (De los PDFs)
    // =========================================
    {
        nombre: "Stent Farmacológico Inspiron",
        categoria: "vascular",
        precio: 15000,
        descripcion: "Stent coronario liberador de fármaco (Sirolimus) con plataforma de Cromo-Cobalto. Recubrimiento de polímero biodegradable abluminal.",
        caracteristicas: ["Material: Aleación CoCr L605", "Fármaco: Sirolimus", "Espesor: 75 µm", "Perfil de cruce: 1.05mm", "Compatibilidad MRI: Sí"],
        imagen: "/img/stent_inspiron.png",
        emoji: "❤️"
    },
    {
        nombre: "Balón de Dilatación Vecchio NC",
        categoria: "vascular",
        precio: 4500,
        descripcion: "Catéter balón no complaciente de alta presión. Expansión precisa con efecto hueso de perro limitado para lesiones calcificadas.",
        caracteristicas: ["Tipo: Balón No Complaciente", "Alta Presión (RBP)", "Crecimiento axial mínimo", "Recubrimiento hidrofílico", "Uso: Post-dilatación"],
        imagen: "/img/vecchio_nc.jpg",
        emoji: "🎈"
    },
    {
        nombre: "Catéter Balón Xperience",
        categoria: "vascular",
        precio: 5500,
        descripcion: "Catéter balón de dilatación coronaria con excelente navegabilidad. Equilibrio óptimo entre empuje y flexibilidad para lesiones tortuosas.",
        caracteristicas: ["Tipo: Rápido Intercambio (RX)", "Perfil de cruce: 0.021-0.027\"", "Recubrimiento: HYDRAX", "Marcas: Tungsteno", "Presión Nominal: 6 atm"],
        imagen: "/img/xperience_balon.png",
        emoji: "🩺"
    },
    {
        nombre: "Balón Liberador de Fármaco Elutax '3'",
        categoria: "vascular",
        precio: 8000,
        descripcion: "Balón liberador de Paclitaxel con matriz de Dextrano. Tecnología de liberación controlada para curación vascular sostenida.",
        caracteristicas: ["Fármaco: Paclitaxel + Dextrano", "Recubrimiento: 360 grados", "Perfil bajo (Vortex Technology)", "Aplicación: Coronario/Periférico/AV", "Liberación hasta 60 días"],
        imagen: "/img/elutax_3.png",
        emoji: "💊"
    },
    {
        nombre: "Catéter PICC Synergy CT",
        categoria: "vascular",
        precio: 3800,
        descripcion: "Catéter central de inserción periférica (PICC) de poliuretano. Power Injectable para medios de contraste a alta presión.",
        caracteristicas: ["Material: Poliuretano radiopaco", "Flujo máx: 5ml/seg (Power)", "Tecnología Reverse Taper", "Monitoreo CVP: Sí", "Lumen: Simple, Doble o Triple"],
        imagen: "/img/synergy_picc.png",
        emoji: "💉"
    },
    {
        nombre: "Catéter Venoso Central (CVC) MEDADV",
        categoria: "vascular",
        precio: 1200,
        descripcion: "Catéter venoso central de poliuretano con punta suave Flex Tip. Triple lumen, estéril y radiopaco.",
        caracteristicas: ["Configuración: 7Fr x 20cm (3 Lumen)", "Material: Poliuretano (PUR)", "Punta: Flex Tip atraumática", "Fijación: Mariposa circular plana", "Incluye kit de inserción completo"],
        imagen: "/img/cvc_medadv.png",
        emoji: "🏥"
    },
    {
        nombre: "Catéter Diálisis High Flow (Joline)",
        categoria: "vascular",
        precio: 2800,
        descripcion: "Catéter de diálisis a corto plazo de poliuretano termosensible. Punta cónica para menor riesgo de trombosis.",
        caracteristicas: ["Material: Tecoflex (Termosensible)", "Configuración: Triple Lumen 13.5Fr", "Punta cónica con orificios frontales", "Kit con guía de Nitinol", "Uso: Agudo / Corto plazo"],
        imagen: "/img/cateter_high_flow.png",
        emoji: "🩸"
    },
    {
        nombre: "Catéter Diálisis Smooth Flow (Joline)",
        categoria: "vascular",
        precio: 4500,
        descripcion: "Catéter de diálisis de larga duración (permanencia). Fabricado en Carbothane resistente y biocompatible.",
        caracteristicas: ["Material: Carbothane", "Diseño: Doble Lumen 15.5 Fr", "Punta simétrica patentada", "Recirculación: < 1%", "Resistencia al acodamiento"],
        imagen: "/img/cateter_smooth_flow.png",
        emoji: "🔁"
    },

    // --- CURACIÓN ---
    {
        nombre: "Apósito Mepilex Border Flex",
        categoria: "curacion",
        precio: 1200,
        descripcion: "Apósito de espuma todo en uno con tecnología Flex 360° y Safetac. Ideal para heridas exudativas en zonas móviles.",
        caracteristicas: ["Tecnología: Flex y Safetac", "Monitor de exudado integrado", "Manejo de bacterias", "Uso: Hasta 7 días", "Indicación: Úlceras por presión/pié diabético"],
        imagen: "/img/mepilex_border_flex.png",
        emoji: "🩹"
    },
    {
        nombre: "Spray Granulox",
        categoria: "curacion",
        precio: 3500,
        descripcion: "Spray de hemoglobina tópica para oxigenar heridas crónicas hipóxicas y acelerar la cicatrización.",
        caracteristicas: ["Principio activo: Hemoglobina", "Función: Transporte de oxígeno", "Formato: Spray portátil", "Aplicación: En cada cambio de apósito", "Indicación: Heridas estancadas"],
        imagen: "/img/granulox_spray.png",
        emoji: "💨"
    },
    {
        nombre: "Aquacel Ag+ Extra",
        categoria: "curacion",
        precio: 1800,
        descripcion: "Apósito de Hidrofibra con plata iónica y tecnología Ag+ reforzada para destruir biofilm en heridas infectadas.",
        caracteristicas: ["Tecnología: Hydrofiber + Ag+", "Acción: Anti-biofilm y antimicrobiano", "Resistencia: 9x mayor", "Absorción superior", "Indicación: Heridas infectadas/quemaduras"],
        imagen: "/img/aquacel_ag_plus.png",
        emoji: "🛡️"
    },
    {
        nombre: "DuoDERM CGF",
        categoria: "curacion",
        precio: 850,
        descripcion: "Apósito hidrocoloide oclusivo con fórmula de gel controlada. Promueve desbridamiento autolítico y granulación.",
        caracteristicas: ["Material: Hidrocoloide (CGF)", "Ambiente: Húmedo y oclusivo", "Impermeable (permite baño)", "Uso: Hasta 7 días", "Indicación: Úlceras grado I-II"],
        imagen: "/img/duoderm_cgf.png",
        emoji: "🔲"
    },

    // =========================================
    // 2. PRODUCTOS BÁSICOS (Ejemplos originales)
    // =========================================
    {
        nombre: 'Guantes Quirúrgicos',
        categoria: 'quirurgico',
        descripcion: 'Alta sensibilidad y resistencia, libres de látex. Ideales para procedimientos quirúrgicos de alta precisión.',
        caracteristicas: ['Libres de látex', 'Alta sensibilidad táctil', 'Diferentes tallas disponibles'],
        imagen: '/img/guantes.png',
        emoji: '🧤',
        precio: 450.00,
        stock: 100,
        activo: true
    },
    {
        nombre: 'Bisturí Quirúrgico',
        categoria: 'quirurgico',
        descripcion: 'Acero inoxidable de alta calidad, esterilizado. Precisión y durabilidad garantizadas.',
        caracteristicas: ['Acero inoxidable quirúrgico', 'Esterilizado individualmente', 'Diferentes hojas disponibles'],
        imagen: '/img/bisturi.jpg',
        emoji: '🔪',
        precio: 85.00,
        stock: 200,
        activo: true
    },
    {
        nombre: 'Gasas Estériles',
        categoria: 'curacion',
        descripcion: 'Perfectas para curaciones y procedimientos menores. Alta absorción y suavidad.',
        caracteristicas: ['100% estériles', 'Alta absorción', 'Diferentes tamaños'],
        imagen: '/img/gasas.jpg',
        emoji: '🩹',
        precio: 35.00,
        stock: 500,
        activo: true
    },
    {
        nombre: 'Material de Curación',
        categoria: 'curacion',
        descripcion: 'Todo tipo de vendas, cintas adhesivas y apósitos médicos. Kit completo para curaciones.',
        caracteristicas: ['Vendas elásticas', 'Cintas adhesivas hipoalergénicas', 'Apósitos diversos tamaños'],
        imagen: '/img/material.jpg',
        emoji: '🏥',
        precio: 250.00,
        stock: 150,
        activo: true
    },
    {
        nombre: 'Consumibles Médicos',
        categoria: 'consumibles',
        descripcion: 'Amplio catálogo de consumibles: jeringas, agujas, mascarillas y más insumos esenciales.',
        caracteristicas: ['Descuentos por volumen', 'Stock permanente', 'Entregas programadas'],
        imagen: '',
        emoji: '📦',
        precio: 180.00,
        stock: 300,
        activo: true
    }
];

// Función principal
async function seed() {
    try {
        console.log('🔄 Conectando a MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Conectado a MongoDB');

        // Limpiar colecciones
        console.log('\n🗑️  Limpiando base de datos...');
        await Usuario.deleteMany({});
        await Producto.deleteMany({});
        console.log('✅ Base de datos limpiada');

        // Crear usuario admin
        console.log('\n👤 Creando usuario administrador...');
        // Simplemente pasamos el objeto con la contraseña en texto plano
        // El modelo de Mongoose se encargará de encriptarla (pre-save hook)
        const admin = await Usuario.create(usuarioAdmin);

        console.log(`✅ Usuario creado: ${admin.username}`);
        console.log(`   Email: ${admin.email}`);
        console.log(`   Password: ${usuarioAdmin.password}`);

        // Crear productos
        console.log('\n📦 Creando productos...');
        const productos = await Producto.insertMany(productosCompletos);
        console.log(`✅ ${productos.length} productos creados`);

        console.log('\n🎉 Base de datos inicializada correctamente!');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.connection.close();
        console.log('\n👋 Desconectado de MongoDB');
        process.exit();
    }
}

// Ejecutar
seed();
/* ==========================================
   SEED: Inicializar Base de Datos
   Ejecutar: node seed.js
   ========================================== */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Usuario = require('./models/usuario');
const Producto = require('./models/Producto');

dotenv.config();

// Datos iniciales
const usuarioAdmin = {
    username: 'admin',
    password: 'admin123',
    nombre: 'Administrador',
    email: 'admin@covas.com',
    rol: 'superadmin',
    activo: true
};

const productosIniciales = [{
        nombre: 'Guantes Quirúrgicos',
        categoria: 'quirurgico',
        descripcion: 'Alta sensibilidad y resistencia, libres de látex. Ideales para procedimientos quirúrgicos de alta precisión.',
        caracteristicas: ['Libres de látex', 'Alta sensibilidad táctil', 'Diferentes tallas disponibles'],
        imagen: '../img/guantes.png',
        emoji: '🧤',
        precio: 450.00,
        stock: 100,
        activo: true,
        orden: 1
    },
    {
        nombre: 'Catéter Venoso',
        categoria: 'vascular',
        descripcion: 'Diseñado para procedimientos vasculares de precisión. Material biocompatible de alta calidad.',
        caracteristicas: ['Material biocompatible', 'Diferentes calibres', 'Certificación FDA'],
        imagen: '../img/cateter.jpg',
        emoji: '💉',
        precio: 1200.00,
        stock: 50,
        activo: true,
        orden: 2
    },
    {
        nombre: 'Bisturí Quirúrgico',
        categoria: 'quirurgico',
        descripcion: 'Acero inoxidable de alta calidad, esterilizado. Precisión y durabilidad garantizadas.',
        caracteristicas: ['Acero inoxidable quirúrgico', 'Esterilizado individualmente', 'Diferentes hojas disponibles'],
        imagen: '../img/bisturi.jpg',
        emoji: '🔪',
        precio: 85.00,
        stock: 200,
        activo: true,
        orden: 3
    },
    {
        nombre: 'Gasas Estériles',
        categoria: 'curacion',
        descripcion: 'Perfectas para curaciones y procedimientos menores. Alta absorción y suavidad.',
        caracteristicas: ['100% estériles', 'Alta absorción', 'Diferentes tamaños'],
        imagen: '../img/gasas.jpg',
        emoji: '🩹',
        precio: 35.00,
        stock: 500,
        activo: true,
        orden: 4
    },
    {
        nombre: 'Material de Curación',
        categoria: 'curacion',
        descripcion: 'Todo tipo de vendas, cintas adhesivas y apósitos médicos. Kit completo para curaciones.',
        caracteristicas: ['Vendas elásticas', 'Cintas adhesivas hipoalergénicas', 'Apósitos diversos tamaños'],
        imagen: '../img/material.jpg',
        emoji: '🏥',
        precio: 250.00,
        stock: 150,
        activo: true,
        orden: 5
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
        activo: true,
        orden: 6
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
        const admin = await Usuario.create(usuarioAdmin);
        console.log(`✅ Usuario creado: ${admin.username}`);
        console.log(`   Email: ${admin.email}`);
        console.log(`   Password: admin123`);

        // Crear productos
        console.log('\n📦 Creando productos...');
        const productos = await Producto.insertMany(productosIniciales);
        console.log(`✅ ${productos.length} productos creados`);

        console.log('\n🎉 Base de datos inicializada correctamente!');
        console.log('\n📝 Credenciales de acceso:');
        console.log('   Usuario: admin');
        console.log('   Contraseña: admin123');
        console.log('\n🚀 Puedes iniciar el servidor con: npm start');

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
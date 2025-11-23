/* ==========================================
   COVAS - JAVASCRIPT PANEL ADMINISTRATIVO
   Archivo: admin/js/admin.js
   ========================================== */

// Variables globales
let mensajes = [];
let productos = [];
let mensajeActualId = null;
let productoActualId = null;

// Configuración de la API (GLOBAL)
// ¡USA ESTA LÍNEA!
const API_URL = 'https://covas-api.onrender.com/api';

// Función para obtener el token
function getToken() {
    return localStorage.getItem('adminToken');
}

// Función para guardar el token
function setToken(token) {
    localStorage.setItem('adminToken', token);
}

// Función para eliminar el token
function removeToken() {
    localStorage.removeItem('adminToken');
}

// Función para hacer peticiones autenticadas
async function fetchAPI(endpoint, options = {}) {
    const token = getToken();

    const config = {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        }
    };

    // Agregar token si existe
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(`${API_URL}${endpoint}`, config);
        const data = await response.json();

        // Si el token expiró o es inválido
        if (response.status === 401) {
            removeToken();
            window.location.href = 'login.html';
            return null;
        }

        if (!response.ok) {
            throw new Error(data.message || 'Error en la petición');
        }

        return data;
    } catch (error) {
        console.error('Error en fetchAPI:', error);
        throw error;
    }
}

// ==========================================
// INICIALIZACIÓN
// ==========================================
document.addEventListener('DOMContentLoaded', function() {

    // Verificar autenticación
    if (window.location.pathname.includes('panel.html')) {
        verificarAutenticacion();
    }

    // ... dentro del DOMContentLoaded ...

    // Toggle Menú Móvil
    const mobileBtn = document.getElementById('mobileMenuBtn');
    const sidebar = document.querySelector('.sidebar');

    if (mobileBtn) {
        mobileBtn.addEventListener('click', function(e) {
            e.stopPropagation(); // Evita que el clic se propague
            sidebar.classList.toggle('active');
        });

        // Cerrar sidebar al hacer clic fuera (en el contenido principal)
        document.addEventListener('click', function(e) {
            // Si el sidebar está abierto Y el clic NO fue en el sidebar NI en el botón
            if (sidebar.classList.contains('active') &&
                !sidebar.contains(e.target) &&
                e.target !== mobileBtn) {
                sidebar.classList.remove('active');
            }
        });
    }

    // Navegación entre secciones
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.getAttribute('data-section');
            cambiarSeccion(section);

            // Actualizar navegación activa
            navItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            if (confirm('¿Está seguro que desea cerrar sesión?')) {
                removeToken();
                window.location.href = 'login.html';
            }
        });
    }

    // Modales
    configurarModales();

    // Búsquedas
    configurarBusquedas();

    // Botones de acción
    configurarBotones();
});

// ==========================================
// VERIFICAR AUTENTICACIÓN
// ==========================================
async function verificarAutenticacion() {
    const token = getToken();

    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    try {
        const response = await fetchAPI('/auth/verificar', {
            method: 'POST'
        });

        if (response && response.success) {
            // Mostrar nombre de usuario
            document.getElementById('adminUserName').textContent = response.usuario.nombre || response.usuario.username;

            // Cargar datos iniciales
            await Promise.all([
                cargarMensajes(),
                cargarProductos()
            ]);

            actualizarEstadisticas();
            mostrarFechaActual();
        } else {
            window.location.href = 'login.html';
        }
    } catch (error) {
        console.error('Error verificando autenticación:', error);
        removeToken();
        window.location.href = 'login.html';
    }
}

// ==========================================
// NAVEGACIÓN
// ==========================================
function cambiarSeccion(seccionNombre) {
    // Ocultar todas las secciones
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });

    // Mostrar sección seleccionada
    document.getElementById('section-' + seccionNombre).classList.add('active');

    // Actualizar título
    const titulos = {
        'dashboard': 'Dashboard',
        'mensajes': 'Mensajes de Contacto',
        'productos': 'Gestión de Productos'
    };
    document.getElementById('pageTitle').textContent = titulos[seccionNombre];
}

// ==========================================
// MENSAJES
// ==========================================
async function cargarMensajes() {
    try {
        const response = await fetchAPI('/mensajes');

        if (response && response.success) {
            mensajes = response.data;
            renderizarMensajes();
        }
    } catch (error) {
        console.error('Error cargando mensajes:', error);
        alert('Error al cargar mensajes');
    }
}

function renderizarMensajes() {
    const tbody = document.getElementById('mensajesTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (mensajes.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 2rem; color: #999;">No hay mensajes</td></tr>';
        return;
    }

    mensajes.forEach(mensaje => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><input type="checkbox" class="mensaje-check" data-id="${mensaje._id}"></td>
            <td><strong>${mensaje.nombre}</strong></td>
            <td>${mensaje.email}</td>
            <td>${mensaje.empresa || '-'}</td>
            <td>${mensaje.telefono}</td>
            <td><span class="badge-tipo">${obtenerTipoConsulta(mensaje.tipoConsulta)}</span></td>
            <td>${formatearFecha(mensaje.createdAt)}</td>
            <td>
                <button class="btn-icon" onclick="verMensaje('${mensaje._id}')" title="Ver">👁️</button>
                <button class="btn-icon" onclick="eliminarMensaje('${mensaje._id}')" title="Eliminar" style="color: var(--danger);">🗑️</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function verMensaje(id) {
    const mensaje = mensajes.find(m => m._id === id);
    if (!mensaje) return;

    mensajeActualId = id;

    const detalles = document.getElementById('mensajeDetalles');
    detalles.innerHTML = `
        <div style="display: grid; gap: 1.5rem;">
            <div>
                <strong>Nombre:</strong>
                <p>${mensaje.nombre}</p>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div>
                    <strong>Email:</strong>
                    <p>${mensaje.email}</p>
                </div>
                <div>
                    <strong>Teléfono:</strong>
                    <p>${mensaje.telefono}</p>
                </div>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div>
                    <strong>Empresa:</strong>
                    <p>${mensaje.empresa || '-'}</p>
                </div>
                <div>
                    <strong>Tipo de Consulta:</strong>
                    <p>${obtenerTipoConsulta(mensaje.tipoConsulta)}</p>
                </div>
            </div>
            <div>
                <strong>Fecha:</strong>
                <p>${formatearFecha(mensaje.createdAt)}</p>
            </div>
            <div>
                <strong>Mensaje:</strong>
                <p style="background: #f8f9fa; padding: 1rem; border-radius: 8px; line-height: 1.6;">${mensaje.mensaje}</p>
            </div>
        </div>
    `;

    mostrarModal('modalVerMensaje');
}

async function eliminarMensaje(id) {
    if (!confirm('¿Está seguro que desea eliminar este mensaje?')) return;

    try {
        const response = await fetchAPI(`/mensajes/${id}`, {
            method: 'DELETE'
        });

        if (response && response.success) {
            alert('Mensaje eliminado correctamente');
            await cargarMensajes();
            cerrarModal('modalVerMensaje');
        }
    } catch (error) {
        console.error('Error eliminando mensaje:', error);
        alert('Error al eliminar el mensaje');
    }
}

function obtenerTipoConsulta(tipo) {
    const tipos = {
        'cotizacion': 'Cotización',
        'informacion': 'Información',
        'servicio': 'Servicio',
        'distribuidor': 'Distribuidor',
        'otro': 'Otro'
    };
    return tipos[tipo] || tipo;
}

// ==========================================
// PRODUCTOS
// ==========================================
async function cargarProductos() {
    try {
        const response = await fetchAPI('/productos?activo=all');

        if (response && response.success) {
            productos = response.data;
            renderizarProductos();
            actualizarEstadisticas();
        }
    } catch (error) {
        console.error('Error cargando productos:', error);
        alert('Error al cargar productos');
    }
}

function renderizarProductos() {
    const grid = document.getElementById('productosGrid');
    if (!grid) return;

    grid.innerHTML = '';

    if (productos.length === 0) {
        grid.innerHTML = '<p style="text-align: center; padding: 2rem; color: #999;">No hay productos</p>';
        return;
    }

    productos.forEach(producto => {
                const card = document.createElement('div');
                card.className = 'product-card';
                card.innerHTML = `
            <div class="product-image">
                ${producto.imagen ? 
                    `<img src="${producto.imagen}" alt="${producto.nombre}" onerror="this.style.display='none'; this.parentElement.innerHTML='<span style=\\'font-size: 3rem;\\'>${producto.emoji}</span>'">` :
                    `<span style="font-size: 3rem;">${producto.emoji}</span>`
                }
            </div>
            <span class="product-category">${producto.categoria}</span>
            <h3 class="product-title">${producto.nombre}</h3>
            <p class="product-description">${producto.descripcion.substring(0, 100)}...</p>
            ${producto.precio ? `<p style="font-size: 1.5rem; color: var(--primary); font-weight: bold; margin-bottom: 1rem;">${producto.precio.toFixed(2)}</p>` : ''}
            <div class="product-actions">
                <button class="btn-primary" onclick="editarProducto('${producto._id}')">✏️ Editar</button>
                <button class="btn-danger" onclick="eliminarProducto('${producto._id}')">🗑️ Eliminar</button>
            </div>
        `;
        grid.appendChild(card);
    });
}

function nuevoProducto() {
    productoActualId = null;
    document.getElementById('modalProductoTitle').textContent = 'Nuevo Producto';
    document.getElementById('productoForm').reset();
    document.getElementById('productoId').value = '';
    mostrarModal('modalProducto');
}

function editarProducto(id) {
    const producto = productos.find(p => p._id === id);
    if (!producto) return;
    
    productoActualId = id;
    document.getElementById('modalProductoTitle').textContent = 'Editar Producto';
    document.getElementById('productoId').value = producto._id;
    document.getElementById('productoNombre').value = producto.nombre;
    document.getElementById('productoCategoria').value = producto.categoria;
    document.getElementById('productoDescripcion').value = producto.descripcion;
    document.getElementById('productoCaracteristicas').value = producto.caracteristicas.join('\n');
    document.getElementById('productoImagen').value = producto.imagen || '';
    document.getElementById('productoEmoji').value = producto.emoji;
    document.getElementById('productoPrecio').value = producto.precio || '';
    
    mostrarModal('modalProducto');
}

async function guardarProducto() {
    const form = document.getElementById('productoForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const caracteristicasText = document.getElementById('productoCaracteristicas').value;
    const caracteristicas = caracteristicasText.split('\n').filter(c => c.trim() !== '');
    
    const productoData = {
        nombre: document.getElementById('productoNombre').value,
        categoria: document.getElementById('productoCategoria').value,
        descripcion: document.getElementById('productoDescripcion').value,
        caracteristicas: caracteristicas,
        imagen: document.getElementById('productoImagen').value,
        emoji: document.getElementById('productoEmoji').value || '📦',
        precio: parseFloat(document.getElementById('productoPrecio').value) || 0
    };
    
    try {
        let response;
        
        if (productoActualId) {
            // Editar existente
            response = await fetchAPI(`/productos/${productoActualId}`, {
                method: 'PUT',
                body: JSON.stringify(productoData)
            });
            alert('Producto actualizado correctamente');
        } else {
            // Crear nuevo
            response = await fetchAPI('/productos', {
                method: 'POST',
                body: JSON.stringify(productoData)
            });
            alert('Producto creado correctamente');
        }
        
        if (response && response.success) {
            await cargarProductos();
            cerrarModal('modalProducto');
        }
    } catch (error) {
        console.error('Error guardando producto:', error);
        alert('Error al guardar el producto: ' + error.message);
    }
}

async function eliminarProducto(id) {
    if (!confirm('¿Está seguro que desea eliminar este producto?')) return;
    
    try {
        const response = await fetchAPI(`/productos/${id}`, {
            method: 'DELETE'
        });
        
        if (response && response.success) {
            alert('Producto eliminado correctamente');
            await cargarProductos();
        }
    } catch (error) {
        console.error('Error eliminando producto:', error);
        alert('Error al eliminar el producto');
    }
}

// ==========================================
// MODALES
// ==========================================
function configurarModales() {
    // Cerrar modales con X
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', function() {
            const modalId = this.getAttribute('data-modal');
            cerrarModal(modalId);
        });
    });
    
    // Cerrar al hacer clic fuera
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                cerrarModal(modal.id);
            }
        });
    });
    
    // Botones secundarios que cierran
    document.querySelectorAll('.btn-secondary[data-modal]').forEach(btn => {
        btn.addEventListener('click', function() {
            const modalId = this.getAttribute('data-modal');
            cerrarModal(modalId);
        });
    });
}

function mostrarModal(id) {
    document.getElementById(id).style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function cerrarModal(id) {
    document.getElementById(id).style.display = 'none';
    document.body.style.overflow = 'auto';
}

// ==========================================
// BÚSQUEDAS
// ==========================================
function configurarBusquedas() {
    const searchMensajes = document.getElementById('searchMensajes');
    if (searchMensajes) {
        searchMensajes.addEventListener('input', function() {
            const term = this.value.toLowerCase();
            const rows = document.querySelectorAll('#mensajesTableBody tr');
            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(term) ? '' : 'none';
            });
        });
    }
    
    const searchProductos = document.getElementById('searchProductos');
    if (searchProductos) {
        searchProductos.addEventListener('input', function() {
            const term = this.value.toLowerCase();
            const cards = document.querySelectorAll('.product-card');
            cards.forEach(card => {
                const text = card.textContent.toLowerCase();
                card.style.display = text.includes(term) ? 'block' : 'none';
            });
        });
    }
}

// ==========================================
// BOTONES
// ==========================================
function configurarBotones() {
    // Eliminar mensaje actual del modal
    const eliminarMensajeBtn = document.getElementById('eliminarMensajeActual');
    if (eliminarMensajeBtn) {
        eliminarMensajeBtn.addEventListener('click', async function() {
            if (mensajeActualId) {
                await eliminarMensaje(mensajeActualId);
            }
        });
    }
    
    // Eliminar todos los mensajes
    const deleteAllBtn = document.getElementById('deleteAllMensajes');
    if (deleteAllBtn) {
        deleteAllBtn.addEventListener('click', async function() {
            if (confirm('¿Está seguro que desea eliminar TODOS los mensajes?')) {
                try {
                    const response = await fetchAPI('/mensajes', {
                        method: 'DELETE'
                    });
                    
                    if (response && response.success) {
                        alert(response.message);
                        await cargarMensajes();
                    }
                } catch (error) {
                    console.error('Error eliminando mensajes:', error);
                    alert('Error al eliminar mensajes');
                }
            }
        });
    }
    
    // Nuevo producto
    const btnNuevo = document.getElementById('btnNuevoProducto');
    if (btnNuevo) {
        btnNuevo.addEventListener('click', nuevoProducto);
    }
    
    // Guardar producto
    const guardarBtn = document.getElementById('guardarProducto');
    if (guardarBtn) {
        guardarBtn.addEventListener('click', guardarProducto);
    }
    
    // Select all mensajes
    const selectAll = document.getElementById('selectAllMensajes');
    if (selectAll) {
        selectAll.addEventListener('change', function() {
            document.querySelectorAll('.mensaje-check').forEach(check => {
                check.checked = this.checked;
            });
        });
    }
}

// ==========================================
// UTILIDADES & DASHBOARD
// ==========================================

function actualizarEstadisticas() {
    // --- 1. DATOS REALES (Base de Datos) ---
    const totalMensajes = mensajes.length;
    const totalProductos = productos.length;

    // Actualizar contadores reales
    if(document.getElementById('statMensajes')) 
        document.getElementById('statMensajes').textContent = totalMensajes;
    
    if(document.getElementById('statProductos')) 
        document.getElementById('statProductos').textContent = totalProductos;
    
    if(document.getElementById('mensajesBadge')) 
        document.getElementById('mensajesBadge').textContent = totalMensajes;


    // --- 2. DATOS SIMULADOS "INTELIGENTES" ---
    
   // A) Visitas "Inteligentes" (Se resetean cada día)
    
    // 1. Obtenemos la fecha de hoy (ej: "21/11/2025")
    const fechaHoy = new Date().toLocaleDateString();
    
    // 2. Obtenemos lo guardado antes
    const ultimaFecha = localStorage.getItem('covas_fecha_visitas');
    let visitasActuales = parseInt(localStorage.getItem('covas_visitas')) || 50; // Tu base de 50

    // 3. Lógica: ¿Es un nuevo día?
    if (ultimaFecha !== fechaHoy) {
        // ¡DÍA NUEVO! Reseteamos
        // Generamos un número base aleatorio para empezar el día (ej. entre 50 y 80)
        visitasActuales = Math.floor(Math.random() * 30) + 50;
        // Guardamos la nueva fecha
        localStorage.setItem('covas_fecha_visitas', fechaHoy);
    } else {
        // MISMO DÍA: Solo sumamos un poquito
        const nuevasVisitas = Math.floor(Math.random() * 3) + 1;
        visitasActuales += nuevasVisitas;
    }
    
    // 4. Guardamos el número actualizado
    localStorage.setItem('covas_visitas', visitasActuales);
    
    // 5. Mostramos en el dashboard
    const elVisitas = document.getElementById('statVisitas');
    if(elVisitas) elVisitas.textContent = visitasActuales;


    // B) Conversión Dinámica (Mensajes Reales vs Visitas Simuladas)
    // Fórmula: (Mensajes / Visitas) * 100
    const rawConversion = visitasActuales > 0 ? (totalMensajes / visitasActuales) * 100 : 0;
    const conversionRate = rawConversion.toFixed(1); // Un decimal (ej. "4.2")
    
    const elConversion = document.getElementById('statConversion');
    if(elConversion) {
        elConversion.textContent = conversionRate + '%';
        
        // CAMBIO DE COLOR SEGÚN DESEMPEÑO
        if (rawConversion >= 3) {
            elConversion.style.color = '#28a745'; // Verde (Éxito)
        } else if (rawConversion >= 1) {
            elConversion.style.color = '#2c3e50'; // Normal (Negro/Azul oscuro)
        } else {
            elConversion.style.color = '#dc3545'; // Rojo (Alerta)
        }
    }
    // --- 3. ACTUALIZAR LISTA DE ACTIVIDAD ---
    renderizarActividadReciente();
}

function renderizarActividadReciente() {
    const activityList = document.querySelector('.activity-list');
    if (!activityList) return;

    activityList.innerHTML = ''; // Limpiar la lista estática anterior

    // Creamos una lista unificada de eventos (Mensajes + Productos)
    const actividades = [];

    // 1. Convertir Mensajes en Actividad
    mensajes.forEach(m => {
        actividades.push({
            tipo: 'mensaje',
            texto: `<strong>Nuevo mensaje</strong> de ${m.nombre}`,
            fecha: new Date(m.createdAt || m.fecha), // Intenta usar createdAt, si no, fecha
            icon: '✉️'
        });
    });

    // 2. Convertir Productos en Actividad
    // (Si tuvieran fecha de creación 'createdAt', la usamos. Si no, usamos una fecha reciente simulada para el demo)
    productos.forEach((p, index) => {
        // Truco: Si no hay fecha real, simulamos que se creó "hace poco" restando minutos según el índice
        const fechaProducto = p.createdAt ? new Date(p.createdAt) : new Date(Date.now() - (index * 10000000));
        
        actividades.push({
            tipo: 'producto',
            texto: `<strong>Nuevo producto</strong>: ${p.nombre}`,
            fecha: fechaProducto,
            icon: '📦'
        });
    });

    // 3. Ordenar por fecha (del más reciente al más antiguo)
    actividades.sort((a, b) => b.fecha - a.fecha);

    // 4. Tomar solo las últimas 5 actividades
    const ultimas = actividades.slice(0, 5);

    if (ultimas.length === 0) {
        activityList.innerHTML = '<p style="color:#999; font-style:italic; padding:1rem;">No hay actividad reciente.</p>';
        return;
    }

    // 5. Renderizar en el HTML
    ultimas.forEach(act => {
        const div = document.createElement('div');
        div.className = 'activity-item'; // Usa tu estilo CSS existente
        div.innerHTML = `
            <span class="activity-icon">${act.icon}</span>
            <div class="activity-details">
                <p>${act.texto}</p>
                <span class="activity-time">${calcularTiempoTranscurrido(act.fecha)}</span>
            </div>
        `;
        activityList.appendChild(div);
    });
}

// Función auxiliar para textos como "Hace 5 min"
function calcularTiempoTranscurrido(fecha) {
    const ahora = new Date();
    const pasado = new Date(fecha);
    const diffMs = ahora - pasado; 
    
    // Si la fecha es inválida o futura, retornamos algo genérico
    if (isNaN(diffMs) || diffMs < 0) return 'Recientemente';

    const diffSeg = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSeg / 60);
    const diffHoras = Math.floor(diffMin / 60);
    const diffDias = Math.floor(diffHoras / 24);

    if (diffSeg < 60) return 'Hace un momento';
    if (diffMin < 60) return `Hace ${diffMin} min`;
    if (diffHoras < 24) return `Hace ${diffHoras} h`;
    return `Hace ${diffDias} días`;
}

function formatearFecha(fecha) {
    const date = new Date(fecha);
    const opciones = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return date.toLocaleDateString('es-MX', opciones);
}

function mostrarFechaActual() {
    const dateElement = document.getElementById('currentDate');
    if (dateElement) {
        const opciones = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        dateElement.textContent = new Date().toLocaleDateString('es-MX', opciones);
    }
}

console.log('Panel Admin COVAS cargado correctamente ✓');
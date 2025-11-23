/* ==========================================
   COVAS - PRODUCTOS PÚBLICOS
   Archivo: js/productos.js
   ========================================== */

// Configuración de la API
const API_URL = 'https://covas-api.onrender.com/api';

// ⚙️ CONFIGURACIÓN DE WHATSAPP
const CONFIG_WHATSAPP = {
    numero: '528128982209', // ⚠️ TU NÚMERO REAL AQUÍ
    mensajeBase: 'Hola, me gustaría más información sobre el producto: '
};

// Variable global para guardar los productos y poder filtrarlos/abrirlos
let productosGlobales = [];

// Cargar productos al iniciar
document.addEventListener('DOMContentLoaded', async function() {
    await cargarProductosPublicos();
    configurarFiltrosPublicos();
    configurarBusquedaPublica();
});

// ==========================================
// CARGAR PRODUCTOS DESDE LA API
// ==========================================
async function cargarProductosPublicos() {
    const grid = document.getElementById('productos-grid'); // Usamos el ID que agregamos al HTML
    if (!grid) return;

    try {
        const response = await fetch(`${API_URL}/productos`);
        const data = await response.json();

        if (data.success && data.data) {
            productosGlobales = data.data; // Guardamos los datos en la variable global
            renderizarProductosPublicos(productosGlobales);
        } else {
            mostrarErrorProductos();
        }
    } catch (error) {
        console.error('Error cargando productos:', error);
        mostrarErrorProductos();
    }
}

// ==========================================
// RENDERIZAR PRODUCTOS (TARJETAS)
// ==========================================
function renderizarProductosPublicos(listaProductos) {
    const grid = document.getElementById('productos-grid');
    if (!grid) return;

    grid.innerHTML = '';

    if (listaProductos.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 2rem; color: #999;">No se encontraron productos.</p>';
        return;
    }

    listaProductos.forEach(producto => {
                // 1. Lógica de Precio Inteligente para la Tarjeta
                let precioHTML = '';
                if (producto.precio && producto.precio > 0) {
                    precioHTML = `<p style="font-weight: bold; color: #0066cc; margin-top:0.5rem;">$${producto.precio.toFixed(2)}</p>`;
                } else {
                    precioHTML = `<p style="font-style: italic; color: #666; margin-top:0.5rem; font-size: 0.9rem;">Cotizar</p>`;
                }

                // 2. Colores por categoría
                const coloresCategoria = {
                    'quirurgico': 'var(--primary-color)',
                    'vascular': 'var(--accent-color)',
                    'consumibles': 'var(--secondary-color)',
                    'curacion': '#28a745'
                };
                const colorCategoria = coloresCategoria[producto.categoria] || '#0066cc';

                // 3. Crear Tarjeta
                const card = document.createElement('div');
                card.className = 'card fade-in';
                // Hacemos que parezca clicable
                card.style.cursor = 'pointer';

                // AL DAR CLIC EN LA TARJETA -> ABRIR MODAL
                card.onclick = function(e) {
                    // Evitar que se abra si el usuario dio clic en un botón específico dentro (opcional)
                    abrirModalDesdeID(producto._id);
                };

                card.innerHTML = `
            <div class="card-header">
                <div style="height: 200px; background: var(--bg-light); border-radius: 10px; display: flex; align-items: center; justify-content: center; margin-bottom: 1rem; overflow: hidden;">
                    ${producto.imagen 
                        ? `<img src="${producto.imagen}" alt="${producto.nombre}" style="max-width: 90%; max-height: 90%; object-fit: contain;" onerror="this.style.display='none'; this.parentElement.innerHTML='<span style=\\'font-size: 4rem;\\'>${producto.emoji || '📦'}</span>'">`
                        : `<span style="font-size: 4rem;">${producto.emoji || '📦'}</span>`
                    }
                </div>
                <h3 class="card-title">${producto.nombre}</h3>
                <span style="display: inline-block; padding: 0.25rem 0.75rem; background: ${colorCategoria}; color: white; border-radius: 20px; font-size: 0.875rem; text-transform: capitalize;">${producto.categoria}</span>
            </div>
            <div class="card-body">
                <p style="color: #555;">${producto.descripcion.length > 100 ? producto.descripcion.substring(0, 100) + '...' : producto.descripcion}</p>
                
                ${precioHTML}

                <button class="btn btn-primary" style="width: 100%; margin-top: 1rem;">Ver Detalles</button>
            </div>
        `;
        grid.appendChild(card);
    });

    // Reactivar animaciones
    const fadeElements = document.querySelectorAll('.fade-in');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('visible');
        });
    }, { threshold: 0.1 });
    fadeElements.forEach(el => observer.observe(el));
}

// ==========================================
// LÓGICA DEL MODAL
// ==========================================
function abrirModalDesdeID(id) {
    const producto = productosGlobales.find(p => p._id === id);
    if (producto) abrirModalDetalle(producto);
}

function abrirModalDetalle(producto) {
    const modal = document.getElementById('modalDetalle');
    
    // Llenar datos
    const img = document.getElementById('m_imagen');
    img.src = producto.imagen || '';
    img.onerror = function() { this.src = ''; this.parentElement.innerHTML = `<div style="height:300px; display:flex; align-items:center; justify-content:center; background:#f0f0f0; border-radius:10px;"><span style="font-size:6rem;">${producto.emoji || '📦'}</span></div>`; };

    document.getElementById('m_categoria').textContent = producto.categoria;
    document.getElementById('m_titulo').textContent = producto.nombre;
    document.getElementById('m_descripcion').textContent = producto.descripcion; // Texto completo

    // Precio en Modal
    const precioContainer = document.getElementById('m_precio_container');
    const precioValor = document.getElementById('m_precio');
    const etiquetaPrecio = document.querySelector('.precio-label');

    if (producto.precio && producto.precio > 0) {
        etiquetaPrecio.style.display = 'inline';
        precioValor.textContent = `$${producto.precio.toFixed(2)} MXN`;
        precioValor.style.color = '#0066cc';
        precioValor.style.fontSize = '1.5rem';
    } else {
        etiquetaPrecio.style.display = 'none'; 
        precioValor.textContent = "Solicitar Cotización";
        precioValor.style.color = '#666';
        precioValor.style.fontSize = '1.2rem';
        precioValor.style.fontStyle = 'italic';
    }

    // Características
    const ul = document.getElementById('m_caracteristicas');
    ul.innerHTML = '';
    if (producto.caracteristicas && producto.caracteristicas.length > 0) {
        producto.caracteristicas.forEach(car => {
            const li = document.createElement('li');
            li.textContent = car;
            li.style.marginBottom = '0.5rem';
            ul.appendChild(li);
        });
    } else {
        ul.innerHTML = '<li>Consulte la ficha técnica para más detalles.</li>';
    }

    // Botón WhatsApp
    const mensaje = encodeURIComponent(`${CONFIG_WHATSAPP.mensajeBase}*${producto.nombre}*.\n\n¿Podrían darme precio y disponibilidad?`);
    const urlWA = `https://wa.me/${CONFIG_WHATSAPP.numero}?text=${mensaje}`;
    
    document.getElementById('m_boton_wa').innerHTML = `
        <a href="${urlWA}" target="_blank" class="btn-modal-wa" style="
            display: block; width: 100%; text-align: center; background-color: #25D366; color: white; padding: 1rem; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 1.1rem; transition: background 0.3s;
        ">💬 Pedir informes por WhatsApp</a>
    `;

    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function cerrarModalDetalle() {
    document.getElementById('modalDetalle').style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Cerrar con clic afuera
const modalElement = document.getElementById('modalDetalle');
if(modalElement) {
    modalElement.addEventListener('click', function(e) {
        if (e.target === this) cerrarModalDetalle();
    });
}

// ==========================================
// FILTROS Y BÚSQUEDA
// ==========================================
function configurarFiltrosPublicos() {
    const botones = document.querySelectorAll('[data-filter]');
    botones.forEach(btn => {
        btn.addEventListener('click', () => {
            botones.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const categoria = btn.getAttribute('data-filter');
            
            if (categoria === 'all') {
                renderizarProductosPublicos(productosGlobales);
            } else {
                const filtrados = productosGlobales.filter(p => p.categoria === categoria);
                renderizarProductosPublicos(filtrados);
            }
        });
    });
}

function configurarBusquedaPublica() {
    const input = document.getElementById('search-input');
    if (input) {
        input.addEventListener('input', (e) => {
            const termino = e.target.value.toLowerCase();
            const filtrados = productosGlobales.filter(p => 
                p.nombre.toLowerCase().includes(termino) || 
                p.descripcion.toLowerCase().includes(termino)
            );
            renderizarProductosPublicos(filtrados);
        });
    }
}

function mostrarErrorProductos() {
    const grid = document.getElementById('productos-grid');
    if (grid) {
        grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 3rem;"><h3>⚠️ Error</h3><p>No se pudo conectar con el catálogo.</p></div>';
    }
}
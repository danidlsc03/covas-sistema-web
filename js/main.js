/* ==========================================
   COVAS - JAVASCRIPT CENTRALIZADO
   Archivo: js/main.js
   ========================================== */

// Esperar a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function() {

    // ==========================================
    // MENÚ HAMBURGUESA
    // ==========================================
    const hamburger = document.querySelector('.hamburger');
    const navLinksMenu = document.querySelector('.nav-links');

    if (hamburger && navLinksMenu) {
        hamburger.addEventListener('click', function(e) {
            e.stopPropagation();
            hamburger.classList.toggle('active');
            navLinksMenu.classList.toggle('active');
        });

        // Cerrar menú al hacer clic en un enlace
        const menuLinks = navLinksMenu.querySelectorAll('a');
        menuLinks.forEach(function(link) {
            link.addEventListener('click', function() {
                hamburger.classList.remove('active');
                navLinksMenu.classList.remove('active');
            });
        });

        // Cerrar menú al hacer clic fuera
        document.addEventListener('click', function(e) {
            if (!hamburger.contains(e.target) && !navLinksMenu.contains(e.target)) {
                hamburger.classList.remove('active');
                navLinksMenu.classList.remove('active');
            }
        });
    }

    // ==========================================
    // EFECTO DE SCROLL EN HEADER
    // ==========================================
    const header = document.getElementById('header');
    if (header) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }

    // ==========================================
    // SMOOTH SCROLLING PARA ENLACES INTERNOS
    // ==========================================
    const internalLinks = document.querySelectorAll('a[href^="#"]');
    internalLinks.forEach(function(anchor) {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const target = document.querySelector(targetId);
            if (target) {
                const headerOffset = 82;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ==========================================
    // ACTIVE LINK EN NAVEGACIÓN
    // ==========================================
    const sections = document.querySelectorAll('section[id]');
    const allNavLinks = document.querySelectorAll('.nav-links a');

    if (sections.length > 0 && allNavLinks.length > 0) {
        window.addEventListener('scroll', function() {
            let current = '';

            sections.forEach(function(section) {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.clientHeight;
                if (window.scrollY >= (sectionTop - 200)) {
                    current = section.getAttribute('id');
                }
            });

            allNavLinks.forEach(function(link) {
                link.classList.remove('active');
                const href = link.getAttribute('href');
                if (href === '#' + current) {
                    link.classList.add('active');
                }
            });
        });
    }

    // Marcar link activo basado en la página actual
    allNavLinks.forEach(function(link) {
        const href = link.getAttribute('href');
        const currentPath = window.location.pathname;

        if (href && href.includes('.html')) {
            // Obtener solo el nombre del archivo
            const hrefFile = href.split('/').pop();
            const currentFile = currentPath.split('/').pop();

            if (hrefFile === currentFile) {
                link.classList.add('active');
            }
        }
    });

    // ==========================================
    // ANIMACIONES AL HACER SCROLL (INTERSECTION OBSERVER)
    // ==========================================
    const fadeElements = document.querySelectorAll('.fade-in, .slide-in-left, .slide-in-right');

    if (fadeElements.length > 0) {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, observerOptions);

        fadeElements.forEach(function(el) {
            observer.observe(el);
        });
    }

    // ==========================================
    // VALIDACIÓN DE FORMULARIOS
    // ==========================================

    /* =================================================================
   NUEVO BLOQUE PARA REEMPLAZAR EN js/main.js
   ================================================================= */

    // ==========================================
    // VALIDACIÓN Y ENVÍO DE FORMULARIOS
    // ==========================================
    const forms = document.querySelectorAll('form[data-validate]');

    forms.forEach(function(form) {
        // Hacemos la función 'async' para poder usar 'await'
        form.addEventListener('submit', async function(e) {
            e.preventDefault();

            let isValid = true;
            const inputs = form.querySelectorAll('input[required], textarea[required], select[required]');

            // Limpiamos errores antiguos
            clearErrors(form);

            inputs.forEach(function(input) {
                // Validar campo vacío
                if (!input.value.trim()) {
                    showError(input, 'Este campo es requerido');
                    isValid = false;
                }

                // Validar email
                if (input.type === 'email' && input.value) {
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(input.value)) {
                        showError(input, 'Email inválido');
                        isValid = false;
                    }
                }

                // Validar teléfono
                if (input.type === 'tel' && input.value) {
                    const phoneRegex = /^[\d\s\-\+\(\)]{10,}$/;
                    if (!phoneRegex.test(input.value)) {
                        showError(input, 'Teléfono inválido');
                        isValid = false;
                    }
                }
            });

            // Si la validación básica NO pasa, nos detenemos.
            if (!isValid) {
                return;
            }

            // ==========================================
            // LÓGICA DE ENVÍO AL BACKEND
            // ==========================================

            // Solo ejecutamos esto si es el formulario de contacto
            if (form.id === 'formContacto') {
                const submitButton = form.querySelector('button[type="submit"]');
                const msgConfirmacion = document.getElementById('msgConfirmacion');

                // Objeto de datos para enviar (nota el mapeo de correo -> email)
                const data = {
                    nombre: document.getElementById('nombre').value,
                    empresa: document.getElementById('empresa').value,
                    email: document.getElementById('correo').value, // El backend espera 'email'
                    telefono: document.getElementById('telefono').value,
                    tipoConsulta: document.getElementById('tipoConsulta').value,
                    mensaje: document.getElementById('mensaje').value
                };

                // Deshabilitamos el botón para evitar envíos duplicados
                submitButton.disabled = true;
                submitButton.textContent = 'Enviando...';

                try {
                    // ¡La llamada FETCH a tu backend!
                    const response = await fetch('https://covas-api.onrender.com/api/mensajes', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(data)
                    });

                    if (response.ok) {
                        // ¡ÉXITO!
                        msgConfirmacion.style.display = 'block';
                        msgConfirmacion.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        form.reset();

                        // Ocultar mensaje después de 5 segundos
                        setTimeout(() => {
                            msgConfirmacion.style.display = 'none';
                        }, 5000);
                    } else {
                        // Error del servidor (ej. 400, 500)
                        const errorData = await response.json();
                        showFormError(form, `Error: ${errorData.message || 'No se pudo enviar el mensaje.'}`);
                    }
                } catch (error) {
                    // Error de red (ej. backend apagado)
                    console.error('Error de red:', error);
                    showFormError(form, 'Error de conexión. Revisa que el servidor esté encendido.');
                } finally {
                    // Volvemos a habilitar el botón
                    submitButton.disabled = false;
                    submitButton.textContent = 'Enviar Mensaje';
                }
            }
        });
    });

    function showError(input, message) {
        input.classList.add('error');
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.style.color = 'red';
        errorDiv.style.fontSize = '0.875rem';
        errorDiv.style.marginTop = '0.25rem';
        errorDiv.textContent = message;
        input.parentElement.appendChild(errorDiv);
    }

    // Nueva función para mostrar errores generales del formulario
    function showFormError(form, message) {
        let errorDiv = form.querySelector('.form-error-general');
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.className = 'form-error-general';
            errorDiv.style.color = 'red';
            errorDiv.style.marginTop = '1rem';
            errorDiv.style.padding = '0.5rem';
            errorDiv.style.border = '1px solid red';
            errorDiv.style.borderRadius = '4px';
            errorDiv.style.background = '#fde8e8';
            form.prepend(errorDiv); // Agrega el error al inicio del form
        }
        errorDiv.textContent = message;
    }

    // Nueva función para limpiar todos los errores
    function clearErrors(form) {
        // Limpiar errores de campos
        const errorMessages = form.querySelectorAll('.error-message');
        errorMessages.forEach(msg => msg.remove());

        const errorInputs = form.querySelectorAll('.error');
        errorInputs.forEach(input => input.classList.remove('error'));

        // Limpiar error general
        const generalError = form.querySelector('.form-error-general');
        if (generalError) {
            generalError.remove();
        }
    }

    /* =================================================================
       FIN DEL BLOQUE PARA REEMPLAZAR
       ================================================================= */

    // ==========================================
    // FILTRADO DE PRODUCTOS
    // ==========================================
    const filterButtons = document.querySelectorAll('[data-filter]');
    const filterItems = document.querySelectorAll('[data-category]');

    if (filterButtons.length > 0 && filterItems.length > 0) {
        filterButtons.forEach(function(button) {
            button.addEventListener('click', function() {
                const filterValue = button.getAttribute('data-filter');

                // Actualizar botones activos
                filterButtons.forEach(function(btn) {
                    btn.classList.remove('active');
                });
                button.classList.add('active');

                // Filtrar items
                filterItems.forEach(function(item) {
                    const category = item.getAttribute('data-category');

                    if (filterValue === 'all' || category === filterValue) {
                        item.style.display = 'block';
                        setTimeout(function() {
                            item.style.opacity = '1';
                            item.style.transform = 'scale(1)';
                        }, 10);
                    } else {
                        item.style.opacity = '0';
                        item.style.transform = 'scale(0.8)';
                        setTimeout(function() {
                            item.style.display = 'none';
                        }, 300);
                    }
                });
            });
        });
    }

    // ==========================================
    // BÚSQUEDA EN TIEMPO REAL
    // ==========================================
    const searchInput = document.getElementById('search-input');
    const searchItems = document.querySelectorAll('[data-searchable]');

    if (searchInput && searchItems.length > 0) {
        searchInput.addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase();

            searchItems.forEach(function(item) {
                const text = item.textContent.toLowerCase();
                if (text.includes(searchTerm)) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    }

    // ==========================================
    // MODAL
    // ==========================================
    const modalTriggers = document.querySelectorAll('[data-modal]');
    const modals = document.querySelectorAll('.modal');
    const modalCloses = document.querySelectorAll('.modal-close');

    modalTriggers.forEach(function(trigger) {
        trigger.addEventListener('click', function() {
            const modalId = trigger.getAttribute('data-modal');
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.style.display = 'flex';
                document.body.style.overflow = 'hidden';
            }
        });
    });

    modalCloses.forEach(function(close) {
        close.addEventListener('click', function() {
            const modal = close.closest('.modal');
            if (modal) {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });
    });

    // Cerrar modal al hacer clic fuera
    modals.forEach(function(modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });
    });

    // ==========================================
    // CONTADOR ANIMADO
    // ==========================================
    const counters = document.querySelectorAll('[data-count]');

    if (counters.length > 0) {
        const observerOptions = {
            threshold: 0.5
        };

        const counterObserver = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
                    const target = parseInt(entry.target.getAttribute('data-count'));
                    const duration = 2000;
                    const step = target / (duration / 16);
                    let current = 0;

                    const updateCounter = function() {
                        current += step;
                        if (current < target) {
                            entry.target.textContent = Math.floor(current);
                            requestAnimationFrame(updateCounter);
                        } else {
                            entry.target.textContent = target;
                        }
                    };

                    updateCounter();
                    entry.target.classList.add('counted');
                }
            });
        }, observerOptions);

        counters.forEach(function(counter) {
            counterObserver.observe(counter);
        });
    }

    // ==========================================
    // LAZY LOADING DE IMÁGENES
    // ==========================================
    const lazyImages = document.querySelectorAll('img[data-src]');

    if (lazyImages.length > 0) {
        const imageObserver = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.getAttribute('data-src');
                    img.removeAttribute('data-src');
                    imageObserver.unobserve(img);
                }
            });
        });

        lazyImages.forEach(function(img) {
            imageObserver.observe(img);
        });
    }

    console.log('COVAS - Scripts cargados correctamente ✓');
});
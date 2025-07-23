const camera = document.getElementById('camera');
const canvas = document.getElementById('canvas-preview');
const ctx = canvas.getContext('2d');
const gallery = document.getElementById('history-grid');
const toast = document.getElementById('status-toast');

let coordenadas = null;

// Inicializar cámara
let cameraStream = null;

// Función para iniciar la cámara
async function iniciarCamara() {
  try {
    // Detener la cámara actual si existe
    await detenerCamara();
    
    // Intentar con cámara trasera primero
    try {
      cameraStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { exact: "environment" } },
        audio: false
      });
    } catch (e) {
      // Si falla, intentar con cualquier cámara
      cameraStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false
      });
    }
    
    if (camera) {
      camera.srcObject = cameraStream;
      // Esperar a que la cámara esté lista
      return new Promise((resolve) => {
        camera.onloadedmetadata = () => {
          camera.play().then(resolve).catch(console.error);
        };
      });
    }
  } catch (err) {
    console.error("Error al acceder a la cámara:", err);
    mostrarEstado("error", "No se pudo acceder a la cámara");
    return Promise.reject(err);
  }
}

// Función para detener la cámara
async function detenerCamara() {
  if (cameraStream) {
    cameraStream.getTracks().forEach(track => track.stop());
    cameraStream = null;
  }
  if (camera) {
    camera.srcObject = null;
  }
  return Promise.resolve();
}

// Iniciar cámara al cargar la página
iniciarCamara().catch(console.error);

// Captura + coordenadas + hora oficial
document.getElementById('capture-btn').addEventListener('click', () => {
  navigator.geolocation.getCurrentPosition(pos => {
    coordenadas = {
      lat: pos.coords.latitude.toFixed(6),
      lon: pos.coords.longitude.toFixed(6)
    };
    generarCaptura();
  }, () => {
    coordenadas = { lat: "?", lon: "?" };
    generarCaptura();
  });
});

function generarCaptura() {
  const horaOficial = new Date().toLocaleTimeString("es-CL", {
    timeZone: "America/Santiago",
    hour12: false
  });
  const fechaCompleta = new Date().toLocaleDateString("es-CL", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  ctx.drawImage(camera, 0, 0, canvas.width, canvas.height * 0.6);

  ctx.fillStyle = "#1e1e1e";
  ctx.fillRect(0, canvas.height * 0.6, canvas.width, canvas.height * 0.4);

  ctx.fillStyle = "#ffffff";
  ctx.font = "18px 'Segoe UI'";
  ctx.fillText(`Hora oficial: ${horaOficial}`, 20, canvas.height * 0.65);
  ctx.fillText(`Fecha: ${fechaCompleta}`, 20, canvas.height * 0.70);
  ctx.fillText(`Fuente: horaoficial.cl`, 20, canvas.height * 0.75);
  ctx.fillText(`Ubicación: ${coordenadas.lat}, ${coordenadas.lon}`, 20, canvas.height * 0.80);

  const imagen = canvas.toDataURL("image/png");

  const captura = {
    timestamp: Date.now(),
    coords: coordenadas,
    src: imagen
  };

  guardarCaptura(captura);
  mostrarEstado("success", "✅ Captura registrada");
}

// Guardado local (usando localStorage)
function guardarCaptura(data) {
  const prev = JSON.parse(localStorage.getItem("capturas") || "[]");
  prev.push(data);
  localStorage.setItem("capturas", JSON.stringify(prev));
}

// Obtener historial de capturas
function obtenerHistorial() {
  try {
    return JSON.parse(localStorage.getItem("capturas") || "[]");
  } catch (error) {
    console.error("Error al obtener el historial:", error);
    return [];
  }
}

// Cargar y mostrar el historial en la galería
function cargarHistorial() {
  const historial = obtenerHistorial();
  const grid = document.getElementById("history-grid");
  
  if (!grid) return;
  
  if (!historial || historial.length === 0) {
    grid.innerHTML = '<p class="no-data">No hay capturas guardadas</p>';
    return;
  }
  
  grid.innerHTML = '';
  
  // Mostrar en orden cronológico inverso (más recientes primero)
  historial.reverse().forEach((captura) => {
    // Crear contenedor para la imagen y el botón
    const itemContainer = document.createElement('div');
    itemContainer.className = 'gallery-item';
    itemContainer.dataset.timestamp = captura.timestamp;
    
    // Crear imagen
    const img = document.createElement('img');
    img.src = captura.src;
    img.alt = `Captura del ${new Date(captura.timestamp).toLocaleString("es-CL")}`;
    img.loading = 'lazy';
    img.className = 'gallery-image';
    img.tabIndex = 0;
    
    // Crear botón de eliminar
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.innerHTML = '🗑️';
    deleteBtn.title = 'Eliminar esta captura';
    deleteBtn.setAttribute('aria-label', `Eliminar captura del ${new Date(captura.timestamp).toLocaleString("es-CL")}`);
    deleteBtn.onclick = (e) => {
      e.stopPropagation();
      eliminarCaptura(captura.timestamp);
    };
    
    // Agregar elementos al contenedor
    itemContainer.appendChild(img);
    itemContainer.appendChild(deleteBtn);
    
    // Configurar el manejador de clic para la imagen
    setupGalleryImageClickHandler(itemContainer, captura);
    
    // Agregar el contenedor al grid
    grid.appendChild(itemContainer);
  });
}

// Función para eliminar una captura
function eliminarCaptura(timestamp) {
  if (!confirm('¿Estás seguro de que deseas eliminar esta captura?')) {
    return;
  }
  
  try {
    let historial = obtenerHistorial();
    historial = historial.filter(item => item.timestamp !== timestamp);
    localStorage.setItem('capturas', JSON.stringify(historial));
    
    // Eliminar el elemento del DOM
    const itemToRemove = document.querySelector(`.gallery-item[data-timestamp="${timestamp}"]`);
    if (itemToRemove) {
      // Agregar animación de salida
      itemToRemove.style.transform = 'scale(0.8)';
      itemToRemove.style.opacity = '0';
      
      // Esperar a que termine la animación antes de eliminar
      setTimeout(() => {
        itemToRemove.remove();
        
        // Verificar si no quedan más elementos
        const grid = document.getElementById("history-grid");
        if (grid && grid.children.length === 0) {
          grid.innerHTML = '<p class="no-data">No hay capturas guardadas</p>';
        }
      }, 300);
    }
    
    mostrarEstado("success", "Captura eliminada correctamente");
    
    // Recargar el historial después de eliminar
    cargarHistorial();
  } catch (error) {
    console.error("Error al eliminar la captura:", error);
    mostrarEstado("error", "Error al eliminar la captura");
  }
}

// Navegación mejorada con accesibilidad
document.addEventListener('DOMContentLoaded', () => {
  // Asegurarse de que solo una vista esté visible al cargar
  const vistas = document.querySelectorAll('.vista');
  const hash = window.location.hash.substring(1);
  const initialSection = ['captura', 'historial'].includes(hash) ? hash : 'captura';
  
  // Ocultar todas las vistas excepto la inicial
  vistas.forEach(vista => {
    if (vista.id === initialSection) {
      vista.style.display = 'block';
      vista.style.opacity = '1';
      vista.style.visibility = 'visible';
      vista.classList.add('visible');
      vista.setAttribute('aria-hidden', 'false');
    } else {
      vista.style.display = 'none';
      vista.style.opacity = '0';
      vista.style.visibility = 'hidden';
      vista.classList.remove('visible');
      vista.setAttribute('aria-hidden', 'true');
    }
  });
});

function mostrarSeccion(id) {
  // Validar ID de sección
  const validSections = ['captura', 'historial'];
  if (!validSections.includes(id)) {
    console.error('Sección no válida:', id);
    return;
  }

  // Obtener la sección actual y la nueva
  const seccionActual = document.querySelector('.vista.visible');
  const seccionNueva = document.getElementById(id);
  
  // Si ya está en la sección solicitada, no hacer nada
  if (seccionActual === seccionNueva) return;
  
  // Configurar la transición
  if (seccionActual) {
    seccionActual.style.opacity = '0';
    seccionActual.classList.remove('visible');
    seccionActual.setAttribute('aria-hidden', 'true');
    
    // Ocultar completamente después de la animación
    setTimeout(() => {
      seccionActual.style.display = 'none';
      seccionActual.style.visibility = 'hidden';
    }, 300); // Coincidir con la duración de la transición CSS
  }
  
  // Mostrar la nueva sección
  if (seccionNueva) {
    // Manejar la cámara según la sección a la que se está cambiando
    if (id === 'captura') {
      // Iniciar la cámara cuando volvemos a la vista de captura
      iniciarCamara().catch(console.error);
    } else if (id === 'historial') {
      // Detener la cámara cuando vamos al historial para ahorrar recursos
      detenerCamara().catch(console.error);
    }
    
    seccionNueva.style.display = 'block';
    seccionNueva.style.visibility = 'visible';
    seccionNueva.setAttribute('aria-hidden', 'false');
    
    // Forzar el reflow para que la animación funcione
    void seccionNueva.offsetHeight;
    
    // Iniciar la animación de entrada
    setTimeout(() => {
      seccionNueva.style.opacity = '1';
      seccionNueva.classList.add('visible');
      
      // Enfocar el primer elemento interactivo
      const focusable = seccionNueva.querySelector('button, [href], [tabindex]:not([tabindex="-1"])');
      if (focusable) {
        focusable.focus({ preventScroll: true });
      }
    }, 10);
  }
  
  // Actualizar pestañas
  const tabs = document.querySelectorAll('.tab[role="tab"]');
  tabs.forEach(tab => {
    const isSelected = tab.getAttribute('aria-controls') === id;
    tab.classList.toggle('active', isSelected);
    tab.setAttribute('aria-selected', isSelected.toString());
    
    if (isSelected) {
      tab.focus({ preventScroll: true });
    }
  });
  
  // Actualizar indicador visual
  const tabIndicator = document.getElementById("tab-indicator");
  const activeTab = document.querySelector(`.tab[aria-controls="${id}"]`);
  if (activeTab && tabIndicator) {
    const tabIndex = Array.from(tabs).indexOf(activeTab);
    tabIndicator.style.transform = `translateX(${tabIndex * 100}%)`;
  }
  
  // Cargar historial si es necesario
  if (id === 'historial') {
    cargarHistorial();
  }
  
  // Actualizar la URL sin recargar la página
  history.pushState({ section: id }, '', `#${id}`);
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
  // Manejar navegación con teclado en las pestañas
  const tabs = document.querySelectorAll('.tab[role="tab"]');
  tabs.forEach(tab => {
    // Navegación con teclado (flechas izquierda/derecha)
    tab.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        const currentIndex = Array.from(tabs).indexOf(tab);
        let nextIndex;
        
        if (e.key === 'ArrowRight') {
          nextIndex = (currentIndex + 1) % tabs.length;
        } else {
          nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
        }
        
        tabs[nextIndex].focus();
        tabs[nextIndex].click();
        e.preventDefault();
      } else if (e.key === 'Home') {
        tabs[0].focus();
        tabs[0].click();
        e.preventDefault();
      } else if (e.key === 'End') {
        tabs[tabs.length - 1].focus();
        tabs[tabs.length - 1].click();
        e.preventDefault();
      }
    });
  });
  
  // Manejar el botón de captura con teclado
  const captureBtn = document.getElementById('capture-btn');
  if (captureBtn) {
    captureBtn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        captureBtn.click();
      }
    });
  }
  
  // Cargar la sección correcta basada en el hash de la URL
  const loadSectionFromHash = () => {
    const hash = window.location.hash.substring(1);
    if (hash && ['captura', 'historial'].includes(hash)) {
      mostrarSeccion(hash);
    } else {
      mostrarSeccion('captura');
    }
  };
  
  // Manejar el botón de retroceso/avance del navegador
  window.addEventListener('popstate', (e) => {
    if (e.state && e.state.section) {
      mostrarSeccion(e.state.section);
    } else {
      loadSectionFromHash();
    }
  });
  
  // Cargar la sección inicial
  loadSectionFromHash();
});

// Estado visual (toast)
function mostrarEstado(tipo = "success", mensaje = "Operación exitosa") {
  toast.className = "";
  toast.classList.add(`toast-${tipo}`);
  toast.textContent = mensaje;
  toast.style.opacity = "1";
  setTimeout(() => {
    toast.style.opacity = "0";
  }, 2500);
}

// Manejo del modal
const modal = document.getElementById("visor-modal");
const modalContent = document.getElementById("visor-contenido");
const closeButton = document.getElementById("cerrar-visor");
const downloadButton = document.getElementById("descargar-img");
let lastFocusedElement = null;
let currentImageSrc = '';

// Cerrar modal
function closeModal() {
  modal.style.display = "none";
  document.body.style.overflow = "auto";
  
  // Restaurar foco al elemento que abrió el modal
  if (lastFocusedElement) {
    lastFocusedElement.focus();
  }
  
  // Eliminar manejadores de eventos
  document.removeEventListener('keydown', handleKeyDown);
  modal.removeEventListener('click', handleOutsideClick);
}

// Manejar teclado
function handleKeyDown(e) {
  if (e.key === 'Escape') {
    closeModal();
  } else if (e.key === 'Tab') {
    // Mantener el foco dentro del modal
    const focusableElements = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (e.shiftKey && document.activeElement === firstElement) {
      e.preventDefault();
      lastElement.focus();
    } else if (!e.shiftKey && document.activeElement === lastElement) {
      e.preventDefault();
      firstElement.focus();
    }
  }
}

// Cerrar al hacer clic fuera del contenido
function handleOutsideClick(e) {
  if (!modalContent.contains(e.target)) {
    closeModal();
  }
}

// Configurar manejadores de eventos del modal
closeButton.addEventListener('click', closeModal);

// Función para descargar la imagen actual
function downloadImage() {
  if (!currentImageSrc) return;
  
  try {
    const link = document.createElement('a');
    link.href = currentImageSrc;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    link.download = `timecam-${timestamp}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    mostrarEstado("success", "✅ Imagen descargada");
  } catch (error) {
    console.error("Error al descargar la imagen:", error);
    mostrarEstado("error", "Error al descargar la imagen");
  }
}

// Función para abrir el modal
function openModal() {
  lastFocusedElement = document.activeElement;
  
  // Forzar el renderizado antes de mostrar para la animación
  modal.style.display = "flex";
  // Pequeño retraso para asegurar que el navegador procese el cambio de display
  requestAnimationFrame(() => {
    modal.style.opacity = "1";
  });
  
  document.body.style.overflow = "hidden";
  
  // Configurar el botón de descarga
  if (downloadButton) {
    downloadButton.onclick = downloadImage;
  }
  
  // Enfocar el primer elemento interactivo
  closeButton.focus();
  
  // Agregar manejadores de eventos
  document.addEventListener('keydown', handleKeyDown);
  modal.addEventListener('click', handleOutsideClick);
}

// Actualizar el manejador de clic en las imágenes de la galería
function setupGalleryImageClickHandler(img, captura) {
  img.onclick = () => {
    const visorImg = document.getElementById("visor-img");
    visorImg.src = captura.src;
    currentImageSrc = captura.src; // Guardar la fuente de la imagen actual
    
    document.getElementById("visor-info").textContent = `
      Fecha: ${new Date(captura.timestamp).toLocaleString("es-CL")}
      Ubicación: ${captura.coords.lat}, ${captura.coords.lon}
    `;
    
    const mapsButton = document.getElementById("maps-btn");
    if (mapsButton) {
      mapsButton.onclick = (e) => {
        e.stopPropagation();
        window.open(`https://maps.google.com/?q=${captura.coords.lat},${captura.coords.lon}`, "_blank");
      };
    }
    
    openModal();
  };
}

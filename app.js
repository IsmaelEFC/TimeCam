const camera = document.getElementById('camera');
const canvas = document.getElementById('canvas-preview');
const ctx = canvas.getContext('2d');
const gallery = document.getElementById('history-grid');
const toast = document.getElementById('status-toast');

let coordenadas = null;

// Activar cámara trasera
navigator.mediaDevices.getUserMedia({
  video: { facingMode: { exact: "environment" } }
}).then(stream => {
  camera.srcObject = stream;
}).catch(() => {
  navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
    camera.srcObject = stream;
  });
});

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

// Galería
function cargarHistorial() {
  try {
    gallery.innerHTML = "";
    const capturas = JSON.parse(localStorage.getItem("capturas") || "[]");
    
    if (capturas.length === 0) {
      mostrarEstado("info", "Aún no hay capturas.");
      return;
    }

    capturas.reverse().forEach((captura, index) => {
      const figure = document.createElement("figure");
      figure.className = "gallery-item";
      
      const img = document.createElement("img");
      img.src = captura.src;
      img.alt = `Captura tomada el ${new Date(captura.timestamp).toLocaleString("es-CL")}`;
      img.loading = "lazy";
      img.className = "gallery-image";
      
      const figcaption = document.createElement("figcaption");
      figcaption.className = "visually-hidden";
      figcaption.textContent = `Captura tomada el ${new Date(captura.timestamp).toLocaleString("es-CL")}`;
      
      // Configurar manejador de clic mejorado
      setupGalleryImageClickHandler(img, captura);
      
      // Hacer la imagen enfocable para navegación por teclado
      img.tabIndex = 0;
      img.setAttribute("role", "button");
      img.setAttribute("aria-label", `Ver captura tomada el ${new Date(captura.timestamp).toLocaleString("es-CL")}`);
      
      // Permitir abrir con la tecla Enter
      img.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setupGalleryImageClickHandler(img, captura)();
        }
      });
      
      figure.appendChild(img);
      figure.appendChild(figcaption);
      gallery.appendChild(figure);
    });
    
    // Enfocar la primera imagen después de cargar
    const firstImage = gallery.querySelector("img");
    if (firstImage) {
      firstImage.focus();
    }
    
  } catch (error) {
    console.error("Error al cargar el historial:", error);
    mostrarEstado("error", "Error al cargar el historial de capturas.");
  }
}

// Navegación mejorada con accesibilidad
function mostrarSeccion(id) {
  // Validar ID de sección
  const validSections = ['captura', 'historial'];
  if (!validSections.includes(id)) {
    console.error('Sección no válida:', id);
    return;
  }

  // Ocultar todas las secciones
  const vistas = document.querySelectorAll('.vista');
  vistas.forEach(sec => {
    sec.classList.remove('visible');
    sec.setAttribute('aria-hidden', 'true');
  });
  
  // Mostrar la sección seleccionada
  const seccionActiva = document.getElementById(id);
  if (seccionActiva) {
    seccionActiva.classList.add('visible');
    seccionActiva.setAttribute('aria-hidden', 'false');
    
    // Hacer que la sección sea enfocable para lectores de pantalla
    seccionActiva.setAttribute('tabindex', '-1');
    seccionActiva.focus({ preventScroll: true });
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
  } else {
    // Enfocar el botón de captura si estamos en la sección de captura
    const captureBtn = document.getElementById('capture-btn');
    if (id === 'captura' && captureBtn) {
      setTimeout(() => {
        captureBtn.focus({ preventScroll: true });
      }, 100);
    }
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
let lastFocusedElement = null;

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

// Función para abrir el modal
function openModal() {
  lastFocusedElement = document.activeElement;
  modal.style.display = "flex";
  document.body.style.overflow = "hidden";
  
  // Enfocar el primer elemento interactivo
  closeButton.focus();
  
  // Agregar manejadores de eventos
  document.addEventListener('keydown', handleKeyDown);
  modal.addEventListener('click', handleOutsideClick);
}

// Actualizar el manejador de clic en las imágenes de la galería
function setupGalleryImageClickHandler(img, captura) {
  img.onclick = () => {
    document.getElementById("visor-img").src = captura.src;
    document.getElementById("visor-info").textContent = `
      Fecha: ${new Date(captura.timestamp).toLocaleString("es-CL")}
      Ubicación: ${captura.coords.lat}, ${captura.coords.lon}
    `;
    
    const mapsButton = document.getElementById("maps-btn");
    mapsButton.onclick = (e) => {
      e.stopPropagation();
      window.open(`https://maps.google.com/?q=${captura.coords.lat},${captura.coords.lon}`, "_blank");
    };
    
    openModal();
  };
}

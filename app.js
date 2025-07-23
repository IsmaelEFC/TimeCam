const camera = document.getElementById('camera');
const iframe = document.getElementById('iframe');
const gallery = document.getElementById('history-grid');
const notificationContainer = document.getElementById('notification-container');

// Initialize database
abrirDB();

// Notification system
class NotificationSystem {
  static show({ message, type = 'info', duration = 5000 }) {
    const icons = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ'
    };

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    notification.innerHTML = `
      <span class="notification-icon">${icons[type] || icons.info}</span>
      <div class="notification-content">${message}</div>
      <button class="notification-close">&times;</button>
    `;

    const closeButton = notification.querySelector('.notification-close');
    closeButton.addEventListener('click', () => this.remove(notification));

    notificationContainer.appendChild(notification);

    // Auto-remove notification after duration
    if (duration > 0) {
      setTimeout(() => this.remove(notification), duration);
    }

    return notification;
  }

  static remove(notification) {
    if (notification) {
      notification.classList.add('notification-slide-out');
      notification.addEventListener('animationend', () => {
        notification.remove();
      });
    }
  }

  static success(message, duration = 5000) {
    return this.show({ message, type: 'success', duration });
  }

  static error(message, duration = 5000) {
    return this.show({ message, type: 'error', duration });
  }

  static warning(message, duration = 5000) {
    return this.show({ message, type: 'warning', duration });
  }

  static info(message, duration = 3000) {
    return this.show({ message, type: 'info', duration });
  }
}

// Usar cámara trasera
navigator.mediaDevices.getUserMedia({
  video: { facingMode: { exact: "environment" } }
}).then(stream => {
  camera.srcObject = stream;
}).catch(() => {
  navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
    camera.srcObject = stream;
  });
});

document.getElementById('capture-btn').addEventListener('click', () => {
  navigator.geolocation.getCurrentPosition(pos => {
    const { latitude, longitude } = pos.coords;

    // Crear un canvas temporal para la cámara
    const cameraCanvas = document.createElement('canvas');
    cameraCanvas.width = camera.videoWidth;
    cameraCanvas.height = camera.videoHeight;
    const cameraCtx = cameraCanvas.getContext('2d');
    cameraCtx.drawImage(camera, 0, 0, cameraCanvas.width, cameraCanvas.height);
    
    // Crear el canvas final
    const canvas = document.createElement('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext('2d');
    
    // Dibujar la cámara (40% superior)
    const cameraAspect = cameraCanvas.width / cameraCanvas.height;
    const cameraHeight = canvas.width / cameraAspect;
    ctx.drawImage(cameraCanvas, 0, 0, canvas.width, canvas.height * 0.4);
    
    // Dibujar el iframe (60% inferior)
    const iframeCanvas = document.createElement('canvas');
    iframeCanvas.width = canvas.width;
    iframeCanvas.height = canvas.height * 0.6;
    const iframeCtx = iframeCanvas.getContext('2d');
    
    // Usamos html2canvas para capturar el iframe
    html2canvas(document.querySelector('iframe')).then(iframeScreenshot => {
      // Dibujar el fondo oscuro
      ctx.fillStyle = "#222";
      ctx.fillRect(0, canvas.height * 0.4, canvas.width, canvas.height * 0.6);
      
      // Dibujar el iframe capturado
      ctx.drawImage(iframeScreenshot, 0, canvas.height * 0.4, canvas.width, canvas.height * 0.6);
      
      // Añadir texto descriptivo
      ctx.fillStyle = "#fff";
      ctx.font = "16px Arial";
      ctx.fillText(`Capturado el: ${new Date().toLocaleString()}`, 20, canvas.height * 0.42 + 25);
      ctx.fillText(`Ubicación: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`, 20, canvas.height * 0.42 + 50);
      
      // Continuar con el proceso de guardado
      const imgData = canvas.toDataURL('image/png');
      
      guardarCaptura({
        id: Date.now(),
        imagen: imgData,
        fecha: new Date().toISOString(),
        coords: { lat: latitude, lon: longitude }
      });

      const a = document.createElement('a');
      a.href = imgData;
      a.download = `captura_${new Date().toISOString().replace(/[:.]/g, '-')}.png`;
      a.click();
      NotificationSystem.success('Captura guardada correctamente');
    });
    
    return; // Salir temprano ya que el guardado se maneja en la promesa

    const imgData = canvas.toDataURL('image/png');

    guardarCaptura({
      id: Date.now(),
      imagen: imgData,
      fecha: new Date().toISOString(),
      coords: { lat: latitude, lon: longitude }
    });

    const a = document.createElement('a');
    a.href = imgData;
    a.download = `captura_${Date.now()}.png`;
    a.click();
    NotificationSystem.success('Captura guardada correctamente');
  }, (error) => {
    console.error('Error al obtener la ubicación:', error);
    NotificationSystem.error('No se pudo obtener la ubicación. Asegúrate de tener activado el GPS.');
  });
});

function mostrarSeccion(id) {
  document.querySelectorAll('section').forEach(sec => sec.style.display = 'none');
  document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
  document.getElementById(id).style.display = 'block';
  document.querySelector(`button[onclick*="${id}"]`).classList.add('active');
  if (id === 'historial') cargarHistorial();
}

// Variables globales para el modal
let currentImageData = null;
let currentCoords = null;

// Inicializar el modal
const modal = document.getElementById('image-modal');
const modalImg = document.getElementById('modal-image');
const closeModal = document.querySelector('.close-modal');
const closeBtn = document.getElementById('close-modal');
const viewLocationBtn = document.getElementById('view-location');

// Cerrar modal al hacer clic en la X
closeModal.onclick = function() {
  modal.style.display = 'none';
  currentImageData = null;
  currentCoords = null;
}

// Cerrar modal al hacer clic en el botón de cerrar
closeBtn.onclick = function() {
  modal.style.display = 'none';
  currentImageData = null;
  currentCoords = null;
}

// Ver ubicación en Google Maps
viewLocationBtn.onclick = function() {
  if (currentCoords) {
    const url = `https://www.google.com/maps?q=${currentCoords.lat},${currentCoords.lon}`;
    window.open(url, '_blank');
  }
}

// Cerrar modal al hacer clic fuera de la imagen
window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = 'none';
    currentImageData = null;
    currentCoords = null;
  }
}

function cargarHistorial() {
  cargarCapturas(registros => {
    gallery.innerHTML = "";
    registros.forEach(r => {
      const imgContainer = document.createElement('div');
      imgContainer.className = 'history-item';
      
      const img = new Image();
      img.src = r.imagen;
      img.className = 'history-image';
      
      const timestamp = document.createElement('div');
      timestamp.className = 'history-timestamp';
      timestamp.textContent = new Date(r.fecha).toLocaleString();
      
      img.onclick = () => {
        currentImageData = r.imagen;
        currentCoords = r.coords;
        modalImg.src = currentImageData;
        modal.style.display = 'block';
      };
      
      imgContainer.appendChild(img);
      imgContainer.appendChild(timestamp);
      gallery.appendChild(imgContainer);
    });
  });
}

// Show toast notification (kept for backward compatibility)
function mostrarToast(mensaje = "✅ Captura guardada") {
  NotificationSystem.show({
    message: mensaje,
    type: mensaje.includes('✅') ? 'success' : 'info',
    duration: 2000
  });
}
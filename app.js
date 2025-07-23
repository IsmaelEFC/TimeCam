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

// Función mejorada para capturar la pantalla
document.getElementById('capture-btn').addEventListener('click', async () => {
  const loadingNotification = NotificationSystem.info('Procesando captura...', 0);
  
  try {
    // Obtener ubicación
    const position = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject);
    });
    
    const { latitude, longitude } = position.coords;
    
    // Crear el canvas final
    const canvas = document.createElement('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext('2d');
    
    // Dibujar fondo negro
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 1. Capturar la cámara (40% superior)
    const cameraAspect = camera.videoWidth / camera.videoHeight;
    const cameraTargetHeight = canvas.height * 0.4;
    const cameraTargetWidth = cameraTargetHeight * cameraAspect;
    const cameraX = (canvas.width - cameraTargetWidth) / 2;
    
    // Dibujar la cámara
    ctx.drawImage(camera, cameraX, 0, cameraTargetWidth, cameraTargetHeight);
    
    // 2. Manejar la captura del iframe (60% inferior)
    const iframe = document.querySelector('iframe');
    const iframeX = 0;
    const iframeY = cameraTargetHeight;
    const iframeWidth = canvas.width;
    const iframeHeight = canvas.height - cameraTargetHeight;
    
    // Dibujar un marcador de posición para el iframe
    ctx.fillStyle = '#222';
    ctx.fillRect(iframeX, iframeY, iframeWidth, iframeHeight);
    
    try {
      // Intentar capturar el iframe directamente con html2canvas
      const iframeCanvas = await html2canvas(iframe, {
        scale: 1,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#222'
      });
      
      // Dibujar la captura del iframe
      ctx.drawImage(iframeCanvas, iframeX, iframeY, iframeWidth, iframeHeight);
    } catch (error) {
      console.warn('No se pudo capturar el iframe, mostrando mensaje de error', error);
      
      // Mostrar mensaje de error en la captura
      ctx.fillStyle = '#333';
      ctx.fillRect(iframeX, iframeY, iframeWidth, iframeHeight);
      
      ctx.fillStyle = '#fff';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      
      // Mensaje dividido en líneas
      const messages = [
        'No se pudo cargar la vista previa de la página web',
        'pero la captura se guardó correctamente.'
      ];
      
      messages.forEach((msg, i) => {
        ctx.fillText(msg, canvas.width / 2, iframeY + (i + 1) * 30);
      });
    }
    
    // Añadir información de la captura
    const infoHeight = 60;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, iframeY, canvas.width, infoHeight);
    
    // Texto informativo
    ctx.fillStyle = '#fff';
    ctx.font = '14px Arial';
    ctx.textAlign = 'left';
    
    // Fecha y hora
    const now = new Date();
    const dateStr = now.toLocaleDateString();
    const timeStr = now.toLocaleTimeString();
    
    // Coordenadas formateadas
    const formatCoord = (coord) => {
      const absCoord = Math.abs(coord);
      const degrees = Math.floor(absCoord);
      const minutesNotTruncated = (absCoord - degrees) * 60;
      const minutes = Math.floor(minutesNotTruncated);
      const seconds = Math.floor((minutesNotTruncated - minutes) * 60);
      return `${degrees}°${minutes}'${seconds}" ${coord >= 0 ? 'N' : 'S'}`;
    };
    
    const latStr = formatCoord(latitude);
    const lngStr = formatCoord(longitude);
    
    // Dibujar información
    ctx.fillText(`Capturado: ${dateStr} ${timeStr}`, 10, iframeY + 20);
    ctx.fillText(`Ubicación: ${latStr}, ${lngStr}`, 10, iframeY + 40);
    
    // Convertir a imagen
    const imgData = canvas.toDataURL('image/png');
    
    // Guardar en la base de datos
    await new Promise((resolve) => {
      guardarCaptura({
        id: Date.now(),
        imagen: imgData,
        fecha: now.toISOString(),
        coords: { lat: latitude, lon: longitude }
      });
      setTimeout(resolve, 100); // Pequeña pausa para asegurar el guardado
    });
    
    // Descargar automáticamente
    const a = document.createElement('a');
    a.href = imgData;
    a.download = `captura_${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}.png`;
    a.click();
    
    // Cerrar notificación de carga
    NotificationSystem.remove(loadingNotification);
    NotificationSystem.success('Captura guardada correctamente');
    
  } catch (error) {
    console.error('Error en la captura:', error);
    
    // Cerrar notificación de carga
    NotificationSystem.remove(loadingNotification);
    
    if (error.code === error.PERMISSION_DENIED) {
      NotificationSystem.error('Se necesita permiso de ubicación para guardar la captura');
    } else {
      NotificationSystem.error('Error al procesar la captura: ' + error.message);
    }
  }
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
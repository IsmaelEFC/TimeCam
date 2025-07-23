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

    const canvas = document.createElement('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(camera, 0, 0, canvas.width, canvas.height * 0.4);
    ctx.fillStyle = "#222";
    ctx.fillRect(0, canvas.height * 0.4, canvas.width, canvas.height * 0.6);
    ctx.fillStyle = "#fff";
    ctx.font = "20px sans-serif";
    ctx.fillText("Sitio: horaoficial.cl", 20, canvas.height * 0.5);

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

function cargarHistorial() {
  cargarCapturas(registros => {
    gallery.innerHTML = "";
    registros.forEach(r => {
      const img = new Image();
      img.src = r.imagen;
      img.title = new Date(r.fecha).toLocaleString();
      img.onclick = () => {
        const url = `https://www.google.com/maps?q=${r.coords.lat},${r.coords.lon}`;
        window.open(url, "_blank");
      };
      gallery.appendChild(img);
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
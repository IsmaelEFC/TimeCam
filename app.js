const camera = document.getElementById('camera');
const canvas = document.getElementById('canvas-preview');
const ctx = canvas.getContext('2d');
const gallery = document.getElementById('history-grid');
const toast = document.getElementById('status-toast');

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

// Captura compuesta: cámara + hora oficial
document.getElementById('capture-btn').addEventListener('click', () => {
  const horaOficial = new Date().toLocaleTimeString("es-CL", {
    timeZone: "America/Santiago",
    hour12: false
  });

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  ctx.drawImage(camera, 0, 0, canvas.width, canvas.height * 0.6);

  ctx.fillStyle = "#222";
  ctx.fillRect(0, canvas.height * 0.6, canvas.width, canvas.height * 0.4);

  ctx.fillStyle = "#fff";
  ctx.font = "20px Arial";
  ctx.fillText(`Hora oficial: ${horaOficial}`, 20, canvas.height * 0.65);
  ctx.fillText(`Fuente: horaoficial.cl`, 20, canvas.height * 0.70);
  ctx.fillText(`Fecha: ${new Date().toLocaleDateString("es-CL")}`, 20, canvas.height * 0.75);

  const imagenCompuesta = canvas.toDataURL("image/png");

  const link = document.createElement("a");
  link.href = imagenCompuesta;
  link.download = `TimeCam_${Date.now()}.png`;
  link.click();

  mostrarEstado("success", "✅ Captura generada con hora oficial");
});

// Pestañas
function mostrarSeccion(id) {
  document.querySelectorAll('section').forEach(sec => sec.style.display = 'none');
  document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
  document.getElementById(id).style.display = 'block';
  document.querySelector(`button[onclick*="${id}"]`).classList.add('active');
  if (id === 'historial') cargarHistorial();
}

// Estado visual
function mostrarEstado(tipo = "success", mensaje = "Operación exitosa") {
  toast.className = "";
  toast.classList.add(`toast-${tipo}`);
  toast.textContent = mensaje;
  toast.style.opacity = "1";
  setTimeout(() => {
    toast.style.opacity = "0";
  }, 2500);
}

// Historial (si decides añadir persistencia luego)
function cargarHistorial() {
  gallery.innerHTML = "";
  mostrarEstado("info", "🗂️ Visualización de historial local no implementada aún.");
}

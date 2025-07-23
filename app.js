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
  gallery.innerHTML = "";
  const capturas = JSON.parse(localStorage.getItem("capturas") || "[]");
  if (capturas.length === 0) {
    mostrarEstado("info", "Aún no hay capturas.");
    return;
  }

  capturas.reverse().forEach(captura => {
    const img = document.createElement("img");
    img.src = captura.src;
    img.alt = "Captura";
    img.title = `Tomada el ${new Date(captura.timestamp).toLocaleString("es-CL")}`;
    img.onclick = () => {
        document.getElementById("visor-img").src = captura.src;
        document.getElementById("visor-info").textContent = `
          Fecha: ${new Date(captura.timestamp).toLocaleString("es-CL")}
          Ubicación: ${captura.coords.lat}, ${captura.coords.lon}
        `;
        document.getElementById("maps-btn").onclick = () => {
          window.open(`https://maps.google.com/?q=${captura.coords.lat},${captura.coords.lon}`, "_blank");
        };
        document.getElementById("visor-modal").style.display = "flex";
      };
      
    gallery.appendChild(img);
  });
}

// Navegación
function mostrarSeccion(id) {
  document.querySelectorAll('section').forEach(sec => sec.style.display = 'none');
  document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
  document.getElementById(id).style.display = 'block';
  document.querySelector(`button[onclick*="${id}"]`).classList.add('active');
  if (id === 'historial') cargarHistorial();
}

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
document.getElementById("cerrar-visor").onclick = () => {
    document.getElementById("visor-modal").style.display = "none";
  };
  
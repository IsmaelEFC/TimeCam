const camera = document.getElementById('camera');
const iframe = document.getElementById('iframe');
const gallery = document.getElementById('history-grid');

abrirDB();

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
    alert("✅ Captura guardada y descargada");
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

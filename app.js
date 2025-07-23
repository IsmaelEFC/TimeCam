const camera = document.getElementById('camera');
const iframe = document.getElementById('iframe');
const gallery = document.getElementById('gallery');

navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
  camera.srcObject = stream;
});

document.getElementById('capture-btn').addEventListener('click', () => {
  navigator.geolocation.getCurrentPosition(pos => {
    const { latitude, longitude } = pos.coords;

    const canvas = document.createElement('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(camera, 0, 0, canvas.width, canvas.height / 2);
    ctx.drawImage(iframe, 0, canvas.height / 2, canvas.width, canvas.height / 2);

    const imgData = canvas.toDataURL('image/png');

    const img = new Image();
    img.src = imgData;
    img.title = `Ubicación: ${latitude}, ${longitude}`;
    img.onclick = () => {
      alert(`Ubicación registrada:\nLatitud: ${latitude}\nLongitud: ${longitude}`);
    };
    gallery.appendChild(img);

    // Descarga opcional
    const a = document.createElement('a');
    a.href = imgData;
    a.download = `captura_${Date.now()}.png`;
    a.click();
  });
});

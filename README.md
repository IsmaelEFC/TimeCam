# TimeCam

**TimeCam** es una aplicación web progresiva (PWA) que permite capturar evidencias sincronizadas de horarios, combinando la imagen de una cámara de seguridad con la hora oficial de Chile, más la ubicación geográfica donde se realiza la captura.

## 🧠 ¿Cómo funciona?

- 📷 Divide la pantalla en dos: cámara trasera + sitio `horaoficial.cl`.
- 🕒 Permite capturar ambas partes en una sola imagen, contrastando los horarios visualmente.
- 🌎 Registra automáticamente la ubicación GPS de la captura.
- 🗂️ Guarda cada imagen en un historial local dentro de la app.
- 📍 Al tocar una imagen guardada, puedes abrir la ubicación exacta en Google Maps.

## 🚀 Características

- ✅ Funciona completamente offline después de instalarse.
- 📁 Galería persistente usando IndexedDB.
- 📌 Instalación como app en Android (PWA).
- 🔐 Capturas guardadas localmente, sin necesidad de servidor externo.
- 🗺️ Integración con Google Maps para visualización de ubicación.

## 📦 Estructura del proyecto
. ├── index.html ├── style.css ├── app.js ├── captura-db.js ├── manifest.json ├── service-worker.js └── icons/ ├── icon-192x192.png └── icon-512x512.png


---

## 🛠️ Requisitos

- Navegador moderno con soporte para PWA  
- Permisos de cámara y geolocalización  
- Conexión HTTPS (automática si usas GitHub Pages)  

---

## ✨ Autor

Creado por **IsmaelEFC**, apasionado por la eficiencia técnica, la automatización y el diseño accesible.  
TimeCam forma parte de un ecosistema de herramientas modernas pensadas para facilitar tareas técnicas y documentar información crítica en campo.

---

## 🧭 Licencia

Este proyecto puede ser reutilizado, adaptado y compartido libremente según tus necesidades.  
¡Agradecimientos siempre bienvenidos!

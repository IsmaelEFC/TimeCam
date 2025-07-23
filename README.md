# TimeCam

**TimeCam** es una aplicación web progresiva (PWA) diseñada para capturar imágenes sincronizadas entre una cámara de seguridad y la hora oficial de Chile, permitiendo verificar discrepancias y registrar la ubicación geográfica de cada evidencia.

---

## 📷 ¿Qué hace TimeCam?

- Divide la pantalla en dos partes:  
  ▸ Cámara trasera del dispositivo móvil  
  ▸ Sitio web `horaoficial.cl` incrustado  
- Captura ambas vistas en una sola imagen  
- Registra automáticamente la ubicación GPS en el momento de la captura  
- Guarda las imágenes en un historial local persistente  
- Permite abrir cada captura en Google Maps para verificar ubicación  

---

## 🚀 Características

- Instalación como PWA en móviles Android  
- Funciona offline tras la instalación  
- Captura combinada (cámara + referencia web)  
- Registro de ubicación geográfica con cada captura  
- Historial con fecha, coordenadas y acceso a Google Maps  
- Descarga automática de las imágenes capturadas  

---

## 📲 Cómo instalar

1. Abre el sitio en tu navegador móvil (Chrome, Edge, Brave).  
2. Presiona “Agregar a pantalla de inicio” en el menú del navegador.  
3. Accede desde el ícono de TimeCam como una app independiente.  

---

## 📁 Estructura del proyecto

```
TimeCam/
├── index.html
├── style.css
├── app.js
├── captura-db.js
├── icons/
│   ├── icon-192x192.png
│   └── icon-512x512.png
├── manifest.json
└── README.md

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

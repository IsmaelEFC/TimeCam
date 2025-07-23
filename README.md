# TimeCam

**TimeCam** es una aplicación web progresiva (PWA) diseñada para capturar imágenes sincronizadas entre una cámara de seguridad y la hora oficial de Chile, permitiendo verificar discrepancias y registrar la ubicación geográfica de cada evidencia.

---

## 📷 ¿Qué hace TimeCam?

- Divide la pantalla en dos partes:  
  - Cámara trasera del dispositivo móvil  
  - Sitio web `horaoficial.cl` incrustado  
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
- Sistema de notificaciones intuitivo  

---

## 📲 Cómo instalar

1. Abre el sitio en tu navegador móvil (Chrome, Edge, Brave)  
2. Presiona "Agregar a pantalla de inicio" en el menú del navegador  
3. Accede desde el ícono de TimeCam como una app independiente  

---

## 📁 Estructura del proyecto

```
TimeCam/
├── index.html          # Punto de entrada de la aplicación
├── style.css           # Estilos de la interfaz
├── app.js              # Lógica principal
├── captura-db.js       # Manejo de base de datos local
├── icons/              # Iconos para PWA
│   ├── icon-192x192.png
│   └── icon-512x512.png
├── manifest.json       # Configuración PWA
├── service-worker.js   # Service Worker para funcionalidad offline
└── README.md           # Documentación
```

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
¡Agradecimientos siempre son bienvenidos!

---

## 🔄 Uso

1. Abre la aplicación y otorga los permisos necesarios
2. Presiona el botón de captura para tomar una foto
3. La imagen se guardará automáticamente con la hora y ubicación
4. Revisa tus capturas en la pestaña de Historial

## 🐛 Reportar problemas

Si encuentras algún problema o tienes sugerencias, por favor abre un [issue](https://github.com/tu-usuario/TimeCam/issues) en el repositorio del proyecto.

## 🚀 v2.1.3 - WhatsApp Web Fix

Esta versión corrige un error crítico de compatibilidad causado por cambios recientes en la plataforma de WhatsApp Web.

### 🔧 Correcciones
- **WhatsApp Web Fix:** Se reemplazó el método interno `sendSeen` por `markSeen` para solucionar el error `TypeError: Cannot read properties of undefined (reading 'markedUnread')`.
- Se aplicó un parche temporal vía `patch-package` mientras se espera la actualización oficial de la librería `whatsapp-web.js`.
- [About Fix Issue](https://github.com/pedroslopez/whatsapp-web.js/commit/dd9df4083accf50c2a69d6942a205465f022dc97)

### 📦 Mejoras Internas
- Actualización de dependencias de construcción para mejorar la estabilidad del ejecutable.
- Limpieza de código y optimización de scripts de inicio.
- Mejor manejo de errores en la comunicación entre el backend y el frontend.
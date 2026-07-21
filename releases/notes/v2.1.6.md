## 🚀 v2.1.6 – WhatsApp UI Refactor & Centralized Release Notes

Esta versión mejora la experiencia de usuario al gestionar la conexión de WhatsApp y estandariza la comunicación de actualizaciones mediante un sistema de notas centralizado.

### 🔧 Cambios

* **WhatsApp Status Modal:**
Se migró toda la lógica visual de conexión (QR, progreso de descarga y errores) a un componente `Dialog` de Shadcn, eliminando el bloqueo total de la interfaz.
* **Sistema de Release Notes Centralizado:**
Se implementó el nuevo componente `ReleaseNotesModal`. Ahora las novedades de la app se renderizan dinámicamente desde Markdown, soportando temas (dark/light) automáticamente y eliminando el contenido hardcodeado en múltiples vistas.

### 🎨 Mejoras de UX/UI

* **Integración de Markdown:** Uso de `@uiw/react-markdown-preview` con estilos nativos de GitHub para una lectura clara de los cambios.
* **Interfaz No Bloqueante:** El usuario ya no queda atrapado en una pantalla de carga; el estado de WhatsApp ahora vive en un diálogo elegante que permite mayor libertad visual.

### 🧹 Mantenimiento

* **Código más limpio:**
Reducción drástica de JSX en el `WhatsAppProvider`.
* **Sincronización de Temas:**
El modal de notas ahora detecta y aplica automáticamente el modo oscuro o claro del sistema.
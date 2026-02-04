## 🚀 v2.1.5 – Dependency Update & Stability Fix

Esta versión simplifica la instalación y mejora la estabilidad general eliminando un parche temporal que ya no es necesario.

### 🔧 Cambios

* **Eliminado parche de `whatsapp-web.js`:**
  Se removió el uso de `patch-package` aplicado sobre la versión `1.34.4`, ya que la aplicación ahora utiliza `whatsapp-web.js@1.34.6`, donde el problema fue corregido oficialmente.
* **Instalación más limpia:**
  Ya no se requiere modificar archivos dentro de `node_modules` durante el `postinstall`.

### 🐛 Corrección de Bug

* **Autenticación bloqueada:**
  La actualización de `whatsapp-web.js` corrige el bug donde la app quedaba atascada en estado *“Authenticating”* y nunca emitía el evento `ready`.

### 🧹 Mantenimiento

* Simplificación del flujo de instalación.
* Menos dependencias parcheadas → menor riesgo en futuras actualizaciones.
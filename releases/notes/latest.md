# 🚀 Release v2.1.1 - Estabilidad y Portabilidad

Esta actualización resuelve problemas críticos de ejecución en sistemas macOS y mejora significativamente la gestión de recursos del sistema. Además, introducimos herramientas de portabilidad para tus automatizaciones.

### 🛠 Correcciones Críticas (Hotfixes)

* **Compatibilidad en macOS:** Se ha corregido el error `incompatible architecture`. La aplicación ahora ofrece soporte nativo tanto en procesadores **Intel (x64)** como en **Apple Silicon (M1/M2/M3)**.
* **Optimización de Carga ASAR:** Se corrigió la ruta de carga del Renderer. Ahora el sistema lee el HTML directamente desde el paquete comprimido (`app.asar`), eliminando errores de "File not found" y mejorando la velocidad de apertura.
* **Fix de Persistencia en Mac:** Se corrigió el error donde el cliente de WhatsApp se quedaba bloqueado en "Autenticando". Ahora la caché de la sesión se guarda correctamente en el directorio `userData`, evitando restricciones de solo lectura del sistema.
* **Limpieza Automática de Navegador:** Implementamos un sistema de purga para versiones antiguas de Chromium. La app ahora detecta y elimina binarios obsoletos, ahorrando cientos de MB de espacio en disco.

### ✨ Nuevas Funciones

* **Importación/Exportación de Crones:** ¡Lleva tus automatizaciones a cualquier lugar!
* Exporta uno o varios crones a un archivo `.json`.
* Importa configuraciones completas con un solo clic.


* **Gestión Masiva:** Nueva interfaz de selección múltiple en la lista de crones para exportar o gestionar lotes de tareas.

### 📦 Mejoras Internas

* **Native Rebuild:** Activamos la reconstrucción automática de dependencias nativas (`better-sqlite3`) durante el despliegue para garantizar compatibilidad total con cada arquitectura.
* **Rendimiento de Base de Datos:** Actualización de dependencias nativas para mejorar el rendimiento de la base de datos SQLite.
* **Ciclo de Vida:** Optimización del ciclo de vida del cliente de WhatsApp para evitar cierres inesperados durante la inicialización.

---

### 📥 ¿Cómo actualizar?

1. Descarga el instalador correspondiente a tu sistema operativo abajo.
2. Si estás en **macOS**, elige la versión según tu procesador (**arm64** para chips M1/M2/M3 o **x64** para Intel) para un rendimiento óptimo.
3. Tus crones y sesiones actuales se mantendrán intactos tras la actualización.
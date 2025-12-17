# Release Notes – v2.0.0

Esta versión **2.0.0** representa una **reconstrucción completa del proyecto**, tanto a nivel técnico como conceptual. No es una simple iteración: es un cambio de paradigma.

Lo que comenzó como un **bot de WhatsApp ejecutado desde consola**, basado en variables de entorno y lógica rígida, evoluciona ahora hacia una **aplicación de escritorio completa**, con interfaz gráfica, persistencia de datos, motor de workflows y ejecución programada avanzada.

---

## 📥 Descargas

| OS | Descarga Directa (Latest) |
| :--- | :--- |
| 🐧 **ALL VERSIONS** | [ALL VERSIONS](https://github.com/BradMoyetones/wweb-worker-standalone/releases/latest) * |

| 🪟 **Windows** | [Descargar .exe](https://github.com/BradMoyetones/wweb-worker-standalone/releases/latest/download/wweb-worker-standalone-Setup-2.0.0.exe) * |
| 🍎 **Mac (Silicon)** | [Descargar arm64.dmg](https://github.com/BradMoyetones/wweb-worker-standalone/releases/latest/download/wweb-worker-standalone-2.0.0-arm64.dmg) * |
| 🍏 **Mac (Intel)** | [Descargar x64.dmg](https://github.com/BradMoyetones/wweb-worker-standalone/releases/latest/download/wweb-worker-standalone-2.0.0-x64.dmg) * |
| 🐧 **Linux** | [Descargar .AppImage](https://github.com/BradMoyetones/wweb-worker-standalone/releases/latest/download/wweb-worker-standalone-2.0.0.AppImage) * |

---

### ✨ Novedad Estelar: Motor de Navegador Autónomo

¡Adiós a los prerequisitos!

* **Cero Dependencias:** La aplicación ya no requiere que el usuario tenga Google Chrome instalado.
* **Auto-Aprovisionamiento:** El sistema detecta automáticamente tu sistema operativo (Windows, Linux, Mac Intel o Mac Silicon) y descarga una versión aislada y optimizada de Chromium en el primer inicio.
* **UI de Progreso:** Se incluye una nueva interfaz de carga que notifica el estado de la descarga de dependencias.

---

### 🚨 Cambio de enfoque (Breaking Change)

En la versión **1.x**, el bot dependía de variables de entorno, ejecución manual y lógica acoplada.

En **v2.0.0**, el proyecto se transforma en:

* Una **aplicación Electron multiplataforma**.
* Con **UI en React + TypeScript**.
* Persistencia con **SQLite + Drizzle ORM**.
* Motor de **cron jobs dinámicos**.
* Ejecutor de **workflows HTTP multi-step**.

---

### 🖥️ Migración a Electron + UI gráfica

El proyecto ahora se construye sobre **Electron** usando **electron-vite**.

* **Frontend:** Desarrollado en **React con TypeScript** para validación robusta y estados sincronizados.
* **Feedback Visual:** Actualización inmediata ante cambios internos (cron running, paused, error, etc.).
* **Comunicación IPC:** Sincronía total entre el proceso de fondo (Node.js) y la interfaz visual.

---

### 🗄️ Persistencia y Cron Jobs Dinámicos

Se incorpora una base de datos local **SQLite** gestionada por **Drizzle ORM**.

* **Adiós .env:** Toda la lógica crítica vive en la base de datos.
* **Motor Cron:** Rediseñado con `node-cron`. Los trabajos se registran, pausan, reanudan y auditan en tiempo real.
* **Watchdog Inteligente:** Nuevo sistema de monitoreo que reinicia automáticamente el cliente de WhatsApp si detecta bloqueos o desconexiones.

---

### 🔁 Motor de Workflows (Core)

Se introduce el concepto de **Workflows HTTP multi-step**. Cada cron ejecuta una secuencia declarativa:

1. Requests HTTP encadenados (GET/POST).
2. Manejo de Cookies y Headers dinámicos entre pasos.
3. Extracción de datos inteligente.
4. Envío del resultado final a grupos de WhatsApp con formato enriquecido.

---

### 📥 Descarga e Instalación

Selecciona el instalador adecuado para tu sistema:

| Sistema Operativo | Archivo a descargar | Notas |
| --- | --- | --- |
| **Windows** | `wweb-worker-standalone-Setup-2.0.0.exe` | Instalador automático. |
| **macOS (M1/M2/M3)** | `wweb-worker-standalone-2.0.0-arm64.dmg` | Para Macs con Apple Silicon. |
| **macOS (Intel)** | `wweb-worker-standalone-2.0.0-x64.dmg` | Para Macs antiguos con chip Intel. |
| **Linux** | `wweb-worker-standalone-2.0.0.AppImage` | Ejecutable universal. |

> **Nota para usuarios de Mac:** Si es la primera vez que instalas, asegúrate de arrastrar la app a la carpeta de Aplicaciones.

---

### 🚀 Conclusión

Se pasó de *“un bot que corre desde consola”* a *“una plataforma de automatización de escritorio”*. Esta versión sienta las bases para un futuro escalable con integraciones ilimitadas.
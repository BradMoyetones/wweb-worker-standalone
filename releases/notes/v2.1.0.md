# Release Notes – v2.1.0

Esta actualización se centra en la **solidez estructural** y la **estabilidad**. Hemos reescrito el núcleo del proceso principal (Main Process) para garantizar que la aplicación sea más rápida, consuma menos recursos y sea mucho más fácil de actualizar en el futuro.

---

## 🎨 Nueva Experiencia de Usuario

### 🔔 Notificaciones de Actualización Pro

Hemos jubilado los avisos genéricos.

* **Update Center:** Nuevo componente visual dedicado para las actualizaciones (adiós a los toasts genéricos).
* **Markdown Support:** Las notas de versión ahora lucen hermosas, con soporte completo para tablas, código resaltado y formato enriquecido.
* **Transparencia total:** Mira el progreso real de la descarga directamente en la interfaz.

---

## 🏗️ Arquitectura Interna (The Big Refactor)

Hemos migrado de un modelo monolítico a una **Arquitectura basada en Controladores**. Esto significa que cada parte de la app ahora tiene un "cerebro" independiente:

* **WhatsAppController:** Rediseñado con una **Máquina de Estados**. El flujo desde la descarga de Chromium hasta el escaneo del QR es ahora mucho más robusto.
* **CronExecutor & WorkflowEngine:** Se ha desacoplado la ejecución de la lógica de persistencia, permitiendo un manejo de errores mucho más fino.
* **Event-Driven System:** Implementación de un `EventEmitter` personalizado que centraliza la comunicación entre el core y la interfaz.

| Módulo | Antes | Ahora |
| --- | --- | --- |
| **Código** | Espagueti (Monolito) | Modular (Controladores) |
| **WhatsApp** | Lógica rígida | Máquina de estados dinámica |
| **Updates** | Toast genérico | Centro de actualizaciones dedicado |
| **Mantenibilidad** | Difícil / Frágil | Alta / Escalable |

---

## 🛠️ Para Desarrolladores (Technical Preview)

Para los entusiastas del código, hemos organizado el directorio `src/main` bajo un patrón de diseño orientado a servicios y controladores. Esto permite una mantenibilidad superior y un testing mucho más sencillo.

### Nueva Estructura de Directorios

```text
./src/main
├── controllers  <-- Lógica de orquestación (WA, DB, Window, Updates)
├── handlers     <-- Registro centralizado de IPCs
├── index.ts     <-- Punto de entrada limpio (Bootstrap)
├── models       <-- Definiciones de esquemas y acceso a datos
└── services     <-- Motores de ejecución (Workflows, Cron, Browser)
```

**Cambios clave:**

* **Inyección de Dependencias:** Los controladores ahora reciben sus dependencias por constructor.
* **IPC Handlers:** Se eliminó la lógica de negocio de los archivos de comunicación.
* **Global States:** Los snapshots de estado ahora viven dentro de sus respectivos controladores.

---

## 🚀 Conclusión

Aunque visualmente la app mantiene su esencia, por dentro tiene un motor completamente nuevo. Esta base nos permite preparar funciones emocionantes que vendrán en las próximas versiones sin comprometer la estabilidad.

---

*Hecho con ❤️ para la comunidad de automatización.*

---
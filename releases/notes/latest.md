## Release Notes – v2.0.0

Esta versión **2.0.0** representa una **reconstrucción completa del proyecto**, tanto a nivel técnico como conceptual. No es una simple iteración: es un cambio de paradigma.

Lo que comenzó como un **bot de WhatsApp ejecutado desde consola**, basado en variables de entorno y lógica rígida, evoluciona ahora hacia una **aplicación de escritorio completa**, con interfaz gráfica, persistencia de datos, motor de workflows y ejecución programada avanzada.

---

### 🚨 Cambio de enfoque (Breaking Change)

En la versión **1.x**, el bot:

* Dependía completamente de variables de entorno (`.env`)
* Ejecutaba una lógica fija y acoplada
* Requería ejecución manual (`npm run dev`)
* No tenía persistencia estructurada
* No permitía múltiples flujos ni configuraciones dinámicas

En **v2.0.0**, el proyecto se transforma en:

* Una **aplicación Electron multiplataforma**
* Con **UI en React + TypeScript**
* Persistencia con **SQLite + Drizzle ORM**
* Motor de **cron jobs dinámicos**
* Ejecutor de **workflows HTTP multi-step**
* Comunicación bidireccional entre backend y frontend
* Actualizaciones automáticas

Este cambio rompe totalmente la compatibilidad con versiones anteriores, de ahí el salto mayor de versión.

---

### 🖥️ Migración a Electron + UI gráfica

El proyecto ahora se construye sobre **Electron** usando **electron-vite**, permitiendo:

* Interfaz gráfica moderna
* Ejecución persistente en segundo plano
* Integración directa con WhatsApp Web
* Manejo visual de crons y workflows
* Comunicación en tiempo real vía IPC

La UI fue desarrollada en **React con TypeScript**, permitiendo:

* Formularios tipados
* Validación robusta
* Estados sincronizados con el backend
* Actualización visual inmediata ante cambios internos (cron running, paused, error, etc.)

---

### 🗄️ Persistencia de datos con SQLite + Drizzle

Se incorpora una base de datos local con **SQLite**, gestionada mediante **Drizzle ORM**, permitiendo:

* Persistir configuraciones de crons
* Persistir workflows con múltiples pasos
* Auditar ejecuciones
* Eliminar la dependencia de `.env` para lógica de negocio
* Facilitar escalabilidad futura

Ahora toda la lógica crítica vive en la base de datos y no en archivos de configuración.

---

### ⏱️ Nuevo sistema de Cron Jobs dinámicos

El motor de ejecución fue rediseñado completamente:

* Uso de `node-cron`
* Registro dinámico de crons desde la DB
* Soporte para:

  * `cronExpression`
  * `timezone`
  * `startAt`
  * `endAt`
  * `isActive`
  * `status` (`idle`, `running`, `error`)
  * `lastRunAt`

Los crons:

* Se registran automáticamente al iniciar la app
* Se pausan o reanudan en tiempo real desde la UI
* Se autodestruyen cuando alcanzan su `endAt`
* No usan `setTimeout` ni polling manual
* Son totalmente event-driven

---

### 🔁 Motor de Workflows (core de v2.0.0)

Se introduce el concepto más importante de esta versión: **Workflows HTTP multi-step**.

Cada cron ahora puede ejecutar una secuencia de pasos declarativos:

* Requests HTTP encadenados
* Métodos configurables (`GET`, `POST`, etc.)
* Soporte para:

  * JSON
  * `application/x-www-form-urlencoded`
  * Headers dinámicos
  * Cookies persistentes entre steps
  * Opciones de request (`redirect: manual`, etc.)
* Extracción declarativa de datos desde respuestas
* Contexto compartido entre pasos (`cookies`, `raw`, `json`, etc.)

Esto reemplaza completamente la lógica rígida previa basada en código hardcodeado.

---

### 📩 Envío de resultados a WhatsApp

El resultado del **último step del workflow** se procesa y se envía automáticamente:

* Al grupo de WhatsApp seleccionado
* Con formato enriquecido
* Incluyendo hora actual con emojis
* Totalmente configurable por cron

La selección del grupo ahora es visual y asistida, con buscador integrado.

---

### 🔄 Comunicación en tiempo real (IPC)

La aplicación ahora mantiene sincronía total entre backend y frontend:

* Eventos push desde el backend al renderer
* Actualización automática del estado de los crons
* Cambios reflejados instantáneamente en la UI
* Sin necesidad de refrescar ni recargar

Esto permite ver:

* Cuándo un cron empieza
* Cuándo termina
* Cuándo falla
* Cuándo se pausa o reanuda

---

### 🔔 Auto Updates

Se integra **electron-updater**, permitiendo:

* Detección automática de nuevas versiones
* Descarga en segundo plano
* Aplicación de updates sin reinstalar manualmente

Esto convierte la app en un producto distribuible real.

---

### 🧱 Arquitectura más sólida y escalable

La nueva estructura permite:

* Agregar nuevos tipos de acciones (webhooks, APIs externas, scraping, etc.)
* Ejecutar workflows independientes
* Reutilizar el motor para otros canales además de WhatsApp
* Integrar lógica condicional en el futuro
* Manejar retries, errores y políticas avanzadas

---

### 🚀 Conclusión

La versión **2.0.0** no es una mejora incremental, es una **reinvención del proyecto**.

Se pasó de:

> *“un bot que corre desde consola”*

a:

> *“una plataforma extensible de automatización basada en workflows, con UI, persistencia y ejecución programada”*

Esta versión sienta las bases para convertir el proyecto en un **motor de automatización real**, y abre la puerta a muchas más integraciones y casos de uso.
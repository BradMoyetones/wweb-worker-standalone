# 🤖 Bot de WhatsApp - Monitor de Visitantes

Bot automatizado de WhatsApp que monitorea y reporta el número de visitantes en tiempo real, con envíos programados y comandos interactivos.

## ✨ Características

- 🔄 **Envío automático programado** - Reportes cada :00 y :30 minutos
- ⏰ **Hora de inicio configurable** - Define cuándo comenzar los envíos automáticos
- 🎯 **Comandos interactivos** - Control del bot mediante comandos con prefijo `!`
- 💾 **Sesión persistente** - No necesitas escanear el QR cada vez
- 🕐 **Formato de hora con emojis** - Visualización clara y atractiva del tiempo
- 🔐 **Autenticación segura** - Login automático a la API externa

## 📋 Requisitos Previos

- Node.js (v14 o superior)
- npm o yarn
- Cuenta de WhatsApp
- Acceso a la API de Parque Jaime Duque

## 🚀 Instalación

1. **Clona el repositorio**
```bash
   git clone https://github.com/BradMoyetones/wweb-worker-standalone.git
   cd wweb-worker-standalone
```

2. **Instala las dependencias**
```bash
   npm install
```

3. **Configura las variables de entorno**
   
   Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
# Nombre del grupo de WhatsApp donde se enviarán los mensajes
GROUP_NAME='Nombre de tu grupo'

# URL de la API para obtener el número de visitantes
API_URL='https://example.com/api/endpoint'

# URL de la API para iniciar sesión
API_LOGIN_URL='https://example.com/api/login'

# Zona horaria (opcional, ej: 'America/Bogota')
TZ='America/Bogota'

# Credenciales de acceso a la API
PJD_USER='tu_usuario'
PJD_PASS='tu_contraseña'
HDN='valor_hdn'

# Hora de inicio de envío automático (formato HH:MM en 24h, ej: '09:00')
# Dejar vacío para iniciar inmediatamente
START_AT='09:00'
```

## 🔧 Configuración

### Variables de Entorno Detalladas

| Variable | Descripción | Ejemplo | Requerida |
|----------|-------------|---------|-----------|
| `GROUP_NAME` | Nombre exacto del grupo de WhatsApp donde se enviarán los mensajes | `'Equipo de Trabajo'` | ✅ Sí |
| `API_URL` | URL completa del endpoint de la API | `'https://example.com/...'` | ✅ Sí |
| `API_LOGIN_URL` | URL completa del endpoint de la API para iniciar sesión | `'https://example.com/...'` | ✅ Sí |
| `TZ` | Zona horaria para los logs y timestamps | `'America/Bogota'` | ⚠️ Opcional |
| `PJD_USER` | Usuario para autenticación en la API | `'admin'` | ✅ Sí |
| `PJD_PASS` | Contraseña para autenticación en la API | `'password123'` | ✅ Sí |
| `HDN` | Valor del campo oculto requerido por el formulario de login | `'1'` | ✅ Sí |
| `START_AT` | Hora de inicio del envío automático (formato 24h: HH:MM) | `'09:00'` | ⚠️ Opcional |

### Notas sobre START_AT

- Si defines `START_AT='09:00'`, el bot esperará hasta las 9:00 AM para comenzar los envíos automáticos
- Si dejas `START_AT` vacío o no lo defines, el bot comenzará a enviar mensajes inmediatamente
- Una vez iniciado, enviará mensajes cada hora en punto (:00) y cada media hora (:30)

## 🎮 Uso

### Iniciar el Bot

```bash
npm start
```

o

```bash
node index.js
```

### Primera Ejecución

1. Al iniciar por primera vez, aparecerá un código QR en la terminal
2. Abre WhatsApp en tu teléfono
3. Ve a **Configuración** → **Dispositivos vinculados** → **Vincular un dispositivo**
4. Escanea el código QR mostrado en la terminal
5. El bot se conectará y guardará la sesión para futuros usos

## 📱 Comandos Disponibles

Todos los comandos deben escribirse en el chat con el prefijo `!`:

| Comando | Descripción | Ejemplo |
|---------|-------------|---------|
| `!help` | Muestra la lista de comandos disponibles | `!help` |
| `!ping` | Verifica que el bot está activo | `!ping` |
| `!id` | Muestra el ID y nombre del chat actual | `!id` |
| `!say <texto>` | El bot repite el texto que escribas | `!say Hola mundo` |
| `!numero` | Consulta y muestra el número actual de visitantes | `!numero` |

### Ejemplos de Uso

```
Usuario: !ping
Bot: pong 🏓

Usuario: !numero
Bot: 02:30 PM 🕝 / *1,234*

Usuario: !say Bienvenidos al parque
Bot: Bienvenidos al parque
```

## 🤖 Funcionamiento Automático

El bot enviará automáticamente el número de visitantes al grupo configurado:

- **Frecuencia**: Cada hora en punto (:00) y cada media hora (:30)
- **Formato del mensaje**: `HH:MM AM/PM 🕐 / *número*`
- **Ejemplo**: `02:30 PM 🕝 / *1,234*`

## 📁 Estructura del Proyecto

```
.
├── index.js              # Archivo principal del bot
├── .env                  # Variables de entorno (no incluir en git)
├── .env.example          # Ejemplo de variables de entorno
├── package.json          # Dependencias del proyecto
├── .wwebjs_auth/         # Carpeta de sesión de WhatsApp (generada automáticamente)
└── README.md             # Este archivo
```

## 🛠️ Dependencias

- `whatsapp-web.js` - Cliente de WhatsApp Web
- `qrcode-terminal` - Generación de códigos QR en la terminal
- `dotenv` - Gestión de variables de entorno
- `node-fetch` - Peticiones HTTP (si usas Node.js < 18)

## ⚠️ Solución de Problemas

### El bot no se conecta

- Verifica que WhatsApp Web funcione en tu navegador
- Elimina la carpeta `.wwebjs_auth` y vuelve a escanear el QR
- Asegúrate de tener conexión a internet estable

### No encuentra el grupo

- Verifica que `GROUP_NAME` coincida exactamente con el nombre del grupo
- El bot debe estar agregado al grupo antes de enviar mensajes
- Revisa que no haya espacios extra en el nombre del grupo

### Error de autenticación en la API

- Verifica que `PJD_USER` y `PJD_PASS` sean correctos
- Confirma que `API_URL` sea la URL completa y correcta
- Confirma que `API_LOGIN_URL` sea la URL completa y correcta de inicio de sesión
- Revisa el valor de `HDN` con el administrador del sistema

### Los mensajes automáticos no se envían

- Verifica que `START_AT` tenga el formato correcto (HH:MM)
- Revisa los logs de la consola para ver si hay errores
- Confirma que el bot esté conectado y activo

## 🔒 Seguridad

- **Nunca compartas tu archivo `.env`** - Contiene credenciales sensibles
- Agrega `.env` a tu `.gitignore`
- No expongas las credenciales en el código
- Mantén actualizado `whatsapp-web.js` para parches de seguridad

## 📝 Archivo .gitignore Recomendado

```gitignore
# Variables de entorno
.env

# Sesión de WhatsApp
.wwebjs_auth/
.wwebjs_cache/

# Node modules
node_modules/

# Logs
*.log
npm-debug.log*
```

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Haz fork del proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Agrega nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👨‍💻 Autor

Desarrollado con ❤️ para automatizar el monitoreo de visitantes

---

**¿Necesitas ayuda?** Abre un issue en el repositorio o contacta al equipo de desarrollo.

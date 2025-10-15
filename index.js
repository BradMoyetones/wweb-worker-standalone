require('dotenv').config();
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

function getCurrentTime() {
    const now = new Date();

    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";

    // convertir a formato 12h
    hours = hours % 12;
    hours = hours ? hours : 12; // el 0 se convierte en 12

    return `${hours.toString().padStart(2, "0")}:${minutes} ${ampm}`;
}

function getCurrentTimeWithEmoji() {
    const now = new Date();

    let hours = now.getHours();
    let minutes = now.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";

    // convertir a 12h
    let displayHour = hours % 12;
    displayHour = displayHour ? displayHour : 12;

    // formato HH:MM
    const formattedTime = `${displayHour.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")} ${ampm}`;

    // --- Mapeo de emojis ---
    const emojis = {
        "1:00": "🕐", "1:30": "🕜",
        "2:00": "🕑", "2:30": "🕝",
        "3:00": "🕒", "3:30": "🕞",
        "4:00": "🕓", "4:30": "🕟",
        "5:00": "🕔", "5:30": "🕠",
        "6:00": "🕕", "6:30": "🕡",
        "7:00": "🕖", "7:30": "🕢",
        "8:00": "🕗", "8:30": "🕣",
        "9:00": "🕘", "9:30": "🕤",
        "10:00": "🕙", "10:30": "🕥",
        "11:00": "🕚", "11:30": "🕦",
        "12:00": "🕛", "12:30": "🕧"
    };

    // decidir si redondear a la hora o media hora
    const closestMinutes = minutes < 30 ? "00" : "30";
    const key = `${displayHour}:${closestMinutes}`;
    const emoji = emojis[key];

    return `${formattedTime} ${emoji}`;
}

// --- Configurar cliente con sesión persistente (carpeta .wwebjs_auth) ---
const client = new Client({
    authStrategy: new LocalAuth({ clientId: 'wweb-worker' }),
    puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    },
});

// --- Utilidad: buscar ID de grupo por nombre ---
async function getGroupIdByName(name) {
    const chats = await client.getChats();
    const group = chats.find(c => c.isGroup && c.name === name);
    if (!group) throw new Error(`No encontré el grupo con nombre: ${name}`);
    return group.id._serialized; // p.ej. "123456789@g.us"
}

// --- Utilidad: enviar mensaje a grupo por nombre ---
async function sendToGroupByName(groupName, message) {
    const chatId = await getGroupIdByName(groupName);
    return client.sendMessage(chatId, message);
}

// --- Comandos del bot (prefijo "!") ---
async function handleCommand(msg) {
    const text = (msg.body || '').trim();
    if (!text.startsWith('!')) return;

    const [rawCmd, ...rest] = text.slice(1).split(/\s+/);
    const cmd = rawCmd.toLowerCase();
    const args = rest;

    try {
        switch (cmd) {
            case 'help':
                await msg.reply([
                    'Comandos:',
                    '• !ping → responde pong',
                    '• !id → devuelve ID y nombre del chat actual',
                    '• !numero → consulta tu API y responde con el número',
                    '• !say <texto> → repite el texto en este chat',
                ].join('\n'));
                break;

            case 'ping':
                await msg.reply('pong 🏓');
                break;

            case 'id': {
                const chat = await msg.getChat();
                await msg.reply(`ID: ${chat.id._serialized}\nNombre: ${chat.name}`);
                break;
            }

            case 'say': {
                const say = args.join(' ').trim();
                if (!say) return msg.reply('Uso: !say <texto>');
                await msg.reply(say);
                break;
            }

            case 'numero': {
                fetchAndSendVisitorCount(msg)
                break;
            }

            default:
                await msg.reply(`Comando no reconocido: !${cmd}\nUsa !help`);
        }
    } catch (err) {
        console.error('Error en comando:', err);
        await msg.reply('Ocurrió un error procesando tu comando.');
    }
}

// --- Eventos clave ---
client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
    console.log('Escanea el QR ↑');
});

client.on('ready', async () => {
    console.log('✅ Bot listo (sesión iniciada).');

    try {
        // await sendToGroupByName(process.env.GROUP_NAME, 'Bot en línea ✅');
        console.log(`Mensaje enviado a "${process.env.GROUP_NAME}".`);
    } catch (err) {
        console.error('No se pudo enviar mensaje inicial:', err.message);
    }

    startAutoNumberJob(process.env.START_AT || null);
});

// --- Importante: escuchar message_create ---
client.on('message_create', async (msg) => {
    console.log('📩 Mensaje detectado:', msg.body, 'fromMe=', msg.fromMe);
    await handleCommand(msg);
});


client.on('disconnected', (reason) => {
    console.error('❌ Desconectado:', reason);
});

client.initialize();


// Extracción de la lógica de !numero en una función reutilizable
async function fetchAndSendVisitorCount(msg) {
    try {
        // 1. Hacemos login (pero NO seguir redirect)
        const loginRes = await fetch("https://secure.parquejaimeduque.com/login.asp", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            redirect: "manual",
            body: new URLSearchParams({
                txtUsuario: process.env.PJD_USER,
                txtClave: process.env.PJD_PASS,
                hdnEnviado: process.env.HDN,
            }),
        });

        // 2. Extraer cookie de headers
        const setCookie = loginRes.headers.get("set-cookie");
        if (!setCookie) throw new Error("No se recibió cookie de sesión");
        const cookie = setCookie.split(";")[0];

        // 3. Ir a la API real usando esa cookie
        const res = await fetch(process.env.API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Cookie": cookie,
            },
        });

        if (!res.ok) throw new Error(`API respondió ${res.status}`);
        const text = (await res.text()).trim();

        const currentTime = getCurrentTimeWithEmoji();
        const message = `${currentTime} / *${text}*`;

        // await msg.reply(message);
        await sendToGroupByName(process.env.GROUP_NAME, message);
        console.log(`✅ Enviado automáticamente: ${message}`);
    } catch (err) {
        console.error("Error obteniendo número:", err);
        // await msg.reply("❌ No se pudo obtener el número de visitantes.");
    }
}

// Función que controla el horario
// function startAutoNumberJob() {
//     console.log(`⏰ AutoJob iniciado a las ${new Date().toLocaleDateString("es-ES", {
//         hour: '2-digit',
//         minute: '2-digit',
//         second: '2-digit'
//     })}: se ejecutará cada :00 y :30`);

//     setInterval(async () => {
//         const now = new Date();
//         const minutes = now.getMinutes();
//         const seconds = now.getSeconds();

//         // Verifica si está justo en :00 o :30
//         if ((minutes === 0 || minutes === 30) && seconds === 0) {
//             console.log("🚀 Ejecutando fetchAndSendVisitorCount()");
//             await fetchAndSendVisitorCount();
//         }
//     }, 1000); // revisar cada segundo para sincronía exacta
// }

// ----- Función que recibe una hora de inicio en formato 'HH:MM'
function startAutoNumberJob(startAt) {
    const now = new Date();
    const startTime = startAt
        ? (() => {
            const [h, m] = startAt.split(":").map(Number);
            const date = new Date();
            date.setHours(h, m, 0, 0);
            // Si la hora ya pasó hoy, programa para mañana
            if (date < now) date.setDate(date.getDate() + 1);
            return date;
        })()
        : null;

    console.log(`⏰ AutoJob iniciado${startAt ? ` (esperando hasta ${startAt})` : ""}. Se ejecutará cada :00 y :30.`);

    const launchJob = async (runImmediate = false) => {
        console.log("🚀 AutoJob activo, ejecutando cada :00 y :30");

        // Si pedimos ejecución inmediata (p. ej. porque startAt llegó), la hacemos ahora
        if (runImmediate) {
            try {
                console.log("🔔 Envío inmediato por startAt");
                await fetchAndSendVisitorCount();
            } catch (err) {
                console.error("Error en envío inmediato:", err);
            }
        }

        // Iniciamos el chequeo por segundos. El primer callback ocurrirá ~1s después,
        // así evitamos que vuelva a ejecutar justo en la misma milésima del envío inmediato.
        setInterval(async () => {
            const current = new Date();
            const minutes = current.getMinutes();
            const seconds = current.getSeconds();

            // Verifica si está justo en :00 o :30
            if ((minutes === 0 || minutes === 30) && seconds === 0) {
                try {
                    console.log("🔁 Ejecutando fetchAndSendVisitorCount() por schedule");
                    await fetchAndSendVisitorCount();
                } catch (err) {
                    console.error("Error en envío programado:", err);
                }
            }
        }, 1000);
    };

    if (startTime) {
        const delay = startTime - now;
        console.log(`🕓 Esperando ${(delay / 1000 / 60).toFixed(1)} minutos para activar el AutoJob (a las ${startTime.toLocaleTimeString()})...`);

        // Cuando llegue startTime, arrancamos el job y hacemos un envío inmediato.
        setTimeout(() => launchJob(true), delay);
    } else {
        // Si no se pasó startAt, activar inmediatamente (sin envío extra inmediato).
        launchJob(false);
    }
}

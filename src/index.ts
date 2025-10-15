import dotenv from 'dotenv';
import qrcode from 'qrcode-terminal';
import { Client, LocalAuth, type Message } from 'whatsapp-web.js';
import { getCurrentTimeWithEmoji } from './utils/helpers';

dotenv.config();

// --- Configurar cliente con sesión persistente (carpeta .wwebjs_auth) ---
const client = new Client({
    authStrategy: new LocalAuth({ clientId: 'wweb-worker' }),
    puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    },
});

// --- Utilidad: buscar ID de grupo por nombre ---
async function getGroupIdByName(name: string) {
    const chats = await client.getChats();
    const group = chats.find(c => c.isGroup && c.name === name);
    if (!group) throw new Error(`No encontré el grupo con nombre: ${name}`);
    return group.id._serialized; // p.ej. "123456789@g.us"
}

// --- Utilidad: enviar mensaje a grupo por nombre ---
async function sendToGroupByName(groupName: string, message: string) {
    const chatId = await getGroupIdByName(groupName);
    return client.sendMessage(chatId, message);
}

// --- Comandos del bot (prefijo "!") ---
async function handleCommand(msg: Message) {
    const text = (msg.body || '').trim();
    if (!text.startsWith('!')) return;

    const [rawCmd, ...rest] = text.slice(1).split(/\s+/);
    const cmd = rawCmd?.toLowerCase();
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
        if (err instanceof Error) {
            console.error('No se pudo enviar mensaje inicial:', err.message);
        } else {
            console.error('No se pudo enviar mensaje inicial:', err);
        }
    }

    startAutoNumberJob(
        process.env.START_AT || null,
        Number(process.env.INTERVAL_MINUTES) || 30
    );
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
async function fetchAndSendVisitorCount(msg?: Message) {
    try {
        // 1. Hacemos login (pero NO seguir redirect)
        const loginRes = await fetch(process.env.API_LOGIN_URL, {
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
        await msg?.reply("❌ No se pudo obtener el número de visitantes.");
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

// ----- Función que recibe hora de inicio y el intervalo en minutos -----
function startAutoNumberJob(startAt: string | null, intervalMinutes: number = 30) {
    const now = new Date();

    // Validar parámetro de intervalo
    if (isNaN(intervalMinutes) || intervalMinutes <= 0) {
        console.warn(`⚠️ Intervalo inválido (${intervalMinutes}), usando 30 minutos por defecto.`);
        intervalMinutes = 30;
    }

    const startTime = startAt
        ? (() => {
            const [h, m] = startAt.split(":").map(Number);
            const date = new Date();
            date.setHours(h, m, 0, 0);
            if (date < now) date.setDate(date.getDate() + 1); // Si ya pasó, programa para mañana
            return date;
        })()
        : null; 

    console.log(
        `⏰ AutoJob iniciado${
            startAt ? ` (esperando hasta ${startAt})` : ""
        }. Se ejecutará cada ${intervalMinutes} minutos.`
    );

    const launchJob = async (runImmediate = false) => {
        console.log(`🚀 AutoJob activo, ejecutando cada ${intervalMinutes} minutos`);

        // Envío inicial inmediato (si se pidió)
        if (runImmediate) {
            try {
                console.log("🔔 Envío inmediato por startAt");
                await fetchAndSendVisitorCount();
            } catch (err) {
                console.error("Error en envío inmediato:", err);
            }
        }

        // Convertimos el intervalo a milisegundos
        const intervalMs = intervalMinutes * 60 * 1000;

        // Iniciamos el intervalo
        setInterval(async () => {
            try {
                console.log("🔁 Ejecutando fetchAndSendVisitorCount() por intervalo programado");
                await fetchAndSendVisitorCount();
            } catch (err) {
                console.error("Error en envío programado:", err);
            }
        }, intervalMs);
    };

    if (startTime) {
        const delay = startTime.getTime() - now.getTime();
        console.log(
            `🕓 Esperando ${(delay / 1000 / 60).toFixed(1)} minutos para activar el AutoJob (a las ${startTime.toLocaleTimeString()})...`
        );

        setTimeout(() => launchJob(true), delay);
    } else {
        launchJob(false);
    }
}

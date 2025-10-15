import { EmojisType } from "../types/index";

export function getCurrentTime() {
    const now = new Date();

    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";

    // convertir a formato 12h
    hours = hours % 12;
    hours = hours ? hours : 12; // el 0 se convierte en 12

    return `${hours.toString().padStart(2, "0")}:${minutes} ${ampm}`;
}

export function getCurrentTimeWithEmoji() {
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
    const emojis: EmojisType = {
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
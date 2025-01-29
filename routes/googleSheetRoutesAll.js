const {google} = require("googleapis");
require("dotenv").config();
const {
    parse,
    isValid,
    startOfMonth,
    startOfWeek,
    isSameWeek,
    isSameMonth,
    differenceInCalendarDays,
    format
} = require("date-fns");

const auth = new google.auth.GoogleAuth({
    credentials: {
        type: process.env.GOOGLE_TYPE,
        project_id: process.env.GOOGLE_PROJECT_ID,
        private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
        private_key: process.env.GOOGLE_PRIVATE_KEY, // Reemplaza los saltos de línea
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        client_id: process.env.GOOGLE_CLIENT_ID,
        auth_uri: process.env.GOOGLE_AUTH_URI,
        token_uri: process.env.GOOGLE_TOKEN_URI,
        auth_provider_x509_cert_url: process.env.GOOGLE_AUTH_PROVIDER_X509_CERT_URL,
        client_x509_cert_url: process.env.GOOGLE_CLIENT_X509_CERT_URL,
        universe_domain: process.env.GOOGLE_UNIVERSE_DOMAI,
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
});

async function getData(spreadsheetId) {
    try {
        const client = await auth.getClient();
        const sheets = google.sheets({version: "v4", auth: client});

        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: "Respuestas de formulario 1!A:A",
        });

        const rows = response.data.values;

        if (!rows || rows.length === 0) {
            return {weeklyCount: 0, monthlyCount: 0, totalCount: 0};
        }

        const today = new Date();
        const timestamps = rows.slice(1).map((row) => row[0]); // Excluir encabezado
        let weeklyCount = 0;
        let monthlyCount = 0;
        let totalCount = 0;

        timestamps.forEach((timestamp) => {
            // Intentar analizar la fecha en formato `DD/MM/YYYY HH:mm:ss` (por ejemplo, "6/1/2025 17:23:13")
            const date = parse(timestamp, "d/M/yyyy HH:mm:ss", new Date());

            // Ignorar fechas no válidas
            if (!isValid(date)) return;

            totalCount++;

            // Contar si está en la misma semana
            if (isSameWeek(date, today)) {
                weeklyCount++;
            }

            // Contar si está en el mismo mes
            if (isSameMonth(date, today)) {
                monthlyCount++;
            }
        });

        return {weeklyCount, monthlyCount, totalCount};
    } catch (error) {
        console.error("Error al obtener los datos:", error);
        throw error;
    }
}

module.exports = {getData};

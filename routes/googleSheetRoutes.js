// routes/googleSheetRoutes.js
const {google} = require("googleapis");
require("dotenv").config();


// Configurar la autenticación de Google
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

// ID del Google Sheet (de la URL)
const spreadsheetId = "1eZvyu8GXV1e7A09n1ZuHJhjmb922qnfmarBcjoJchPI";

// Ruta para obtener los datos de todas las preguntas
async function getData() {
    try {
        const client = await auth.getClient();
        const sheets = google.sheets({version: "v4", auth: client});

        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: "Respuestas de formulario 1", // Cambiar por el nombre de tu hoja
        });

        const rows = response.data.values;

        if (!rows || rows.length === 0) {
            throw new Error("No hay datos en el Sheet.");
        }

        // Encabezados dinámicos
        const headers = rows[0]; // Primera fila como encabezados
        const data = rows.slice(1).map((row) => {
            return headers.reduce((acc, header, index) => {
                acc[header] = row[index] || null; // Asignar respuesta o null si no existe
                return acc;
            }, {});
        });

        return {headers, data}; // Devuelve encabezados y datos procesados
    } catch (error) {
        console.error("Error al obtener los datos:", error);
        throw error;
    }
}


module.exports = {getData};
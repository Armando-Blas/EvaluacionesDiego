// routes/googleSheetRoutes.js
const {google} = require("googleapis");


// Configurar la autenticación de Google
const auth = new google.auth.GoogleAuth({
    keyFile: "C:\\Users\\Seekop\\IdeaProjects\\IA\\EvaluacionesProyectR\\credentials\\evaluacionesResidencia.json", // Ruta al archivo JSON de credenciales
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
});

// ID del Google Sheet (de la URL)
const spreadsheetId = "1eZvyu8GXV1e7A09n1ZuHJhjmb922qnfmarBcjoJchPI";

// Ruta para obtener los datos de todas las preguntas
async function getData() {
    try {
        const client = await auth.getClient();
        const sheets = google.sheets({ version: "v4", auth: client });

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

        return { headers, data }; // Devuelve encabezados y datos procesados
    } catch (error) {
        console.error("Error al obtener los datos:", error);
        throw error;
    }
}



module.exports = { getData };
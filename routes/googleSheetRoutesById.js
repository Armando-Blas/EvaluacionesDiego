// routes/googleSheetRoutes.js
const {google} = require("googleapis");


// Configurar la autenticación de Google
const auth = new google.auth.GoogleAuth({
    keyFile: "C:\\Users\\Seekop\\IdeaProjects\\IA\\EvaluacionesProyectR\\credentials\\evaluacionesResidencia.json", // Ruta al archivo JSON de credenciales
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
});


// Ruta para obtener los datos de todas las preguntas
async function getData(spreadsheetId) {
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
        const preguntas = rows[0];
        const data = rows.slice(1); // Resto de las filas como datos

        // Procesar conteo de respuestas para cada pregunta
        const processedData = headers.map((header, index) => {
            const responses = data.map((row) => row[index]); // Todas las respuestas de esta columna
            const counts = responses.reduce(
                (acc, response) => {
                    if (response === "Sí") acc.yes++;
                    else if (response === "No") acc.no++;
                    return acc;
                },
                {yes: 0, no: 0}
            );

            return {
                title: header, // Encabezado como título
                data: [
                    {value: counts.yes, name: "Sí"},
                    {value: counts.no, name: "No"},
                ],
            };
        });
        console.log(processedData);
        return {preguntas, processedData}; // Devuelve los datos procesados
    } catch (error) {
        console.error("Error al obtener los datos:", error);
        throw error;
    }
}


module.exports = {getData};
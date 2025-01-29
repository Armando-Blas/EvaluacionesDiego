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

        // Encabezados y datos
        const headers = rows[0]; // Primera fila como encabezados
        const data = rows.slice(1); // Resto de las filas como datos

        const isValidDate = (dateString) => {
            try {
                // Expresión regular para validar fechas en formato 'DD/MM/YYYY HH:MM:SS'
                const regex = /^(\d{1,2})\/(\d{1,2})\/(\d{4}) (\d{1,2}):(\d{1,2}):(\d{1,2})$/;
                const match = dateString.match(regex);
                console.log("----------------------------------------------------------------")
                if (!match) return false;
                console.log("----------------------------------------------------------------")


                const [, day, month, year, hour, minute, second] = match;

                // Crear una fecha en formato ISO 8601: 'YYYY-MM-DDTHH:MM:SS'
                const formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${hour.padStart(2, '0')}:${minute.padStart(2, '0')}:${second.padStart(2, '0')}`;

                console.log("Fecha formateada:", formattedDate);

                // Intentar crear una fecha usando Date.parse
                const date = new Date(formattedDate);
                console.log("Fecha final:", date);

                // Si la fecha no es válida, Date() devuelve un "Invalid Date"
                if (isNaN(date.getTime())) {
                    console.log("Fecha no válida:", formattedDate);
                    return false;
                }

                return true;
            } catch (e) {
                return false; // Si ocurre un error, considera que no es válida
            }
        };


        // Procesar las columnas dinámicamente
        const processedData = headers.map((header, index) => {
            const responses = data.map((row) => row[index]); // Todas las respuestas de esta columna
            console.log("responses:" + responses)
            // Verificar tipo de datos

            const isOpenQuestion = responses.some((response) => response && response.length > 30);

            const isDate = responses.every((response) => isValidDate(response));

            if (isDate) {
                // Datos de fechas (para gráfico de línea)
                const dateData = responses
                    .filter((response) => response) // Eliminar valores vacíos
                    .map((response) => {
                        // Suponiendo que la fecha tiene formato 'DD/MM/YYYY HH:MM:SS'
                        const [day, month, yearAndTime] = response.split('/');
                        const [year, time] = yearAndTime.split(' ');
                        const [hour, minute, second] = time.split(':').map(Number);

                        // Crear un formato de fecha compatible con ISO 8601: 'YYYY-MM-DDTHH:MM:SS'
                        const formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:${second.toString().padStart(2, '0')}`;

                        const date = new Date(formattedDate);
                        if (isNaN(date)) {
                            console.error("Fecha inválida:", response);
                        }
                        return date.getTime(); // Convertir a timestamp
                    })
                    .sort((a, b) => a - b); // Ordenar por fecha

                console.log("dateData:", dateData);

                return {
                    title: header,
                    type: "line", // Tipo de gráfico
                    data: dateData.map((value, idx) => ({
                        value: [idx, value],
                        name: new Date(value).toLocaleString(),
                    })), // Formato para gráfico de línea
                };
            } else if (isOpenQuestion) {
                // Datos de preguntas abiertas
                return {
                    title: header,
                    type: "list", // Mostrar como lista
                    data: responses.filter((response) => response), // Solo respuestas no vacías
                };
            } else {
                // Datos de opción múltiple
                const counts = responses.reduce((acc, response) => {
                    if (response) {
                        acc[response] = (acc[response] || 0) + 1;
                    }
                    return acc;
                }, {});

                return {
                    title: header,
                    type: "pie", // Tipo de gráfico
                    data: Object.entries(counts).map(([name, value]) => ({
                        value,
                        name,
                    })),
                };
            }
        });

        console.log(processedData);
        return {preguntas: headers, processedData}; // Devuelve los datos procesados
    } catch (error) {
        console.error("Error al obtener los datos:", error);
        throw error;
    }
}


module.exports = {getData};
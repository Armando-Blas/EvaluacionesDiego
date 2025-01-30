const express = require('express');
const router = express.Router();
const googleSheetRoutes = require("./googleSheetRoutes");
const googleSheetRoutesUnique = require("./googleSheetRoutesUnique");
const googleSheetRoutesAll = require("./googleSheetRoutesAll");
const googleSheetRoutesById = require("./googleSheetRoutesById");
const connection = require('../config/database');


const info = [
    {title: 'Pregunta 1', data: [{value: 40, name: 'Sí'}, {value: 60, name: 'No'}]},
    {title: 'Pregunta 2', data: [{value: 70, name: 'Excelente'}, {value: 30, name: 'Regular'}]},
    {title: 'Pregunta 3', data: [{value: 50, name: 'Aprobado'}, {value: 50, name: 'Reprobado'}]},

    {title: 'Pregunta 2', data: [{value: 70, name: 'Excelente'}, {value: 30, name: 'Regular'}]},
    {title: 'Pregunta 3', data: [{value: 50, name: 'Aprobado'}, {value: 50, name: 'Reprobado'}]},

    {title: 'Pregunta 3', data: [{value: 50, name: 'Aprobado'}, {value: 50, name: 'Reprobado'}]},

    {title: 'Pregunta 3', data: [{value: 50, name: 'Aprobado'}, {value: 50, name: 'Reprobado'}]},

    {title: 'Pregunta 3', data: [{value: 50, name: 'Aprobado'}, {value: 50, name: 'Reprobado'}]},

    {title: 'Pregunta 3', data: [{value: 50, name: 'Aprobado'}, {value: 50, name: 'Reprobado'}]},
    // Agrega más datos según sea necesario
];
let formulariosConImagenes = null;
// Aplicar el middleware a todas las rutas
router.use((req, res, next) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    next();
});

router.get('/', (req, res) => {
    connection.query('SELECT e.id, e.nombre, e.url_imagen, e.url_excel, e.tipo  FROM evaluaciones e ', (err, results) => {
        if (err) {
            console.error('Error en la consulta:', err);
            return res.status(500).send('Error en la base de datos');
        }

        // Mapeamos los resultados para que coincidan con el formato de formulariosConImagenes
        formulariosConImagenes = results.map(row => ({
            id: row.id,
            nombre: row.nombre,
            imagen: row.url_imagen,
            urlExcel: row.url_excel,
            tipo: row.tipo
        }));

        // Pasamos los formulariosConImagenes a la vista
        res.render('home', {
            activePage: 'inicio',
            title: 'EVALUACIONES DOCENTES',
            formulariosConImagenes: formulariosConImagenes,
            info
        });
    });
});

router.get('/inicio', (req, res) => {
    connection.query('SELECT e.id, e.nombre, e.url_imagen, e.url_excel, e.tipo  FROM evaluaciones e ', (err, results) => {
        if (err) {
            console.error('Error en la consulta:', err);
            return res.status(500).send('Error en la base de datos');
        }

        // Mapeamos los resultados para que coincidan con el formato de formulariosConImagenes
        formulariosConImagenes = results.map(row => ({
            id: row.id,
            nombre: row.nombre,
            imagen: row.url_imagen,
            urlExcel: row.url_excel,
            tipo: row.tipo
        }));

        // Pasamos los formulariosConImagenes a la vista
        res.render('home', {
            activePage: 'inicio',
            title: 'EVALUACIONES DOCENTES',
            formulariosConImagenes: formulariosConImagenes,
            info
        });
    });
});

router.get('/usuarios', async (req, res) => {
    try {
        //const response = await googleSheetRoutes.getData(); // Llama a la función para obtener los datos
        res.render('home', {
            activePage: 'usuarios',
            title: 'EVALUACIONES DOCENTES',
            //respuestas: response.data,
            //headers: response.headers,
            formulariosConImagenes: formulariosConImagenes, info
        });
    } catch (error) {
        console.error("Error en la ruta /usuarios:", error);
        res.status(500).send("Error al cargar los datos.");
    }
});

router.get('/encuesta-data', async (req, res) => {
    try {
        const idFormulario = req.query.idFormulario;
        const formulario = formulariosConImagenes.find(f => f.id === Number(idFormulario));  // Convierte idFormulario a número si es un string

        console.log("Formulario encontrado:", formulario);
        console.log(formulario.urlExcel)
        const sheetId = await getSheetIdFromUrl(formulario.urlExcel);
        console.log(sheetId)
        const response = await googleSheetRoutesUnique.getData(sheetId); // Llama a la función para obtener los datos
        res.render('home', {
            activePage: 'encuesta-data',
            title: 'EVALUACIONES DOCENTES',
            respuestas: response.data,
            headers: response.headers,
            formulariosConImagenes: formulariosConImagenes, info
        });
    } catch (error) {
        console.error("Error en la ruta /usuarios:", error);
        res.status(500).send("Error al cargar los datos.");
    }
});


router.get('/AplicarEncuesta', (req, res) => {
    res.render('home', {
        activePage: 'AplicarEncuesta',
        title: 'EVALUACIONES DOCENTES',
        formulariosConImagenes: formulariosConImagenes, info
    });
});

router.get('/estadisticas', (req, res) => {
    res.render('home', {
        activePage: 'estadisticas',
        title: 'EVALUACIONES DOCENTES',
        formulariosConImagenes: formulariosConImagenes, info
    });
});


// Función para extraer el sheetId de la URL
function getSheetIdFromUrl(url) {
    const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
    return match ? match[1] : null;
}

router.get('/reportes', async (req, res) => {
    try {
        // Crear una copia de `formulariosConImagenes` y agregar los conteos
        const formCount = await Promise.all(
            formulariosConImagenes.map(async (formulario) => {
                const sheetId = getSheetIdFromUrl(formulario.urlExcel);
                if (!sheetId) {
                    console.error(`No se pudo extraer el sheetId de la URL: ${formulario.urlExcel}`);
                    return {...formulario, conteos: null};
                }

                // Obtener los datos del sheet y calcular los conteos
                try {
                    const {weeklyCount, monthlyCount, totalCount} = await googleSheetRoutesAll.getData(sheetId);
                    console.log({...formulario, weeklyCount, monthlyCount, totalCount})
                    let maximo = 10;
                    let porcentaje = (totalCount / maximo) * 100;
                    return {...formulario, weeklyCount, monthlyCount, totalCount, maximo, porcentaje};
                } catch (error) {
                    console.error(`Error al obtener datos para el sheetId ${sheetId}:`, error);
                    return {...formulario, conteos: null};
                }
            })
        );

        // Renderizar la vista con los formularios y sus conteos
        res.render('home', {
            activePage: 'reportes',
            title: 'EVALUACIONES DOCENTES',
            formulariosConImagenes: formCount, info
        });
    } catch (error) {
        console.error("Error en la ruta /reportes:", error);
        res.status(500).send("Error al cargar los datos.");
    }
});

router.get('/metricas', async (req, res) => {
    const idFormulario = req.query.idFormulario; // Obtener el parámetro "nombre" de la URL
    const formulario = formulariosConImagenes.find(f => f.id === Number(idFormulario));  // Convierte idFormulario a número si es un string
    console.log(req.query.idFormulario)
    console.log("Formulario encontrado:", formulario);
    console.log(formulario.urlExcel)

    const sheetId = await getSheetIdFromUrl(formulario.urlExcel);
    console.log(sheetId)
    const response = await googleSheetRoutesById.getData(sheetId); // Llama a la función para obtener los datos
    console.log(response.processedData)
    console.log("preguntas: " + response.preguntas);

    res.render('home', {
        activePage: 'metricas',
        title: `Detalles de ${formulario.nombre}`,
        headers: response.preguntas,
        info: response.processedData,
        idFormulario: idFormulario,
        nombreFormulario: formulario.nombre,
    });
});

module.exports = router;

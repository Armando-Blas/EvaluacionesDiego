const express = require('express');
const router = express.Router();
const googleSheetRoutes = require("./googleSheetRoutes");
const googleSheetRoutesAll = require("./googleSheetRoutesAll");
const connection = require('../config/database'); // Importa la conexión

router.use((req, res, next) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    next();
});

// Función para extraer el sheetId de la URL
function getSheetIdFromUrl(url) {
    const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
    return match ? match[1] : null;
}

router.get('/data', async (req, res) => {
    try {
        const {id} = req.query;

        const {weeklyCount, monthlyCount, totalCount} = await googleSheetRoutes.getData(sheetId);

        // Renderizar la vista con los formularios y sus conteos
        res.render('home', {
            activePage: 'reportes',
            title: 'EVALUACIONES DOCENTES',
            formulariosConImagenes: formCount
        });
    } catch (error) {
        console.error("Error en la ruta /reportes:", error);
        res.status(500).send("Error al cargar los datos.");
    }
});

// Obtener información de una evaluación por ID
router.get('/evaluacion/:id', (req, res) => {
    const {id} = req.params;

    if (!id) {
        return res.status(400).send('Falta el ID de la evaluación');
    }

    const query = 'SELECT * FROM evaluaciones WHERE id = ?';

    connection.query(query, [id], (err, results) => {
        if (err) {
            console.error('Error al obtener la evaluación:', err);
            return res.status(500).send('Hubo un error al obtener la evaluación');
        }

        if (results.length === 0) {
            return res.status(404).send('Evaluación no encontrada');
        }

        res.status(200).json(results[0]); // Devolvemos la evaluación encontrada
    });
});

// Editar evaluación existente
router.put('/editar-evaluacion', (req, res) => {
    const {id, nombre, urlImagen, urlExcel, tipo} = req.body;

    // Comprobamos que los datos sean válidos
    if (!id || !nombre || !urlImagen || !urlExcel || tipo === undefined) {
        return res.status(400).send('Faltan datos requeridos');
    }

    const query = `
        UPDATE evaluaciones
        SET nombre     = ?,
            url_imagen = ?,
            url_excel  = ?,
            tipo       = ?
        WHERE id = ?
    `;

    connection.query(query, [nombre, urlImagen, urlExcel, tipo, id], (err, result) => {
        if (err) {
            console.error('Error al actualizar la evaluación:', err);
            return res.status(500).send('Hubo un error al actualizar la evaluación');
        }

        if (result.affectedRows === 0) {
            return res.status(404).send('Evaluación no encontrada');
        }

        res.status(200).send('Evaluación actualizada exitosamente');
    });
});

router.post('/guardar-evaluacion', async (req, res) => {
    const {nombre, urlImagen, urlExcel, tipo} = req.body;
    console.log(req.body);
    // Comprobamos que los datos sean válidos
    if (!nombre || !urlImagen || !urlExcel || tipo === undefined) {
        return res.status(400).send('Faltan datos requeridos');
    }

    // Crear la consulta para insertar la evaluación en la base de datos
    const query = 'INSERT INTO evaluaciones (nombre, url_imagen, url_excel, tipo) VALUES (?, ?, ?, ?)';

    connection.query(query, [nombre, urlImagen, urlExcel, tipo], (err, result) => {
        if (err) {
            console.error('Error al guardar la evaluación:', err);
            return res.status(500).send('Hubo un error al guardar la evaluación');
        }

        // Si la inserción es exitosa, respondemos con un mensaje de éxito
        res.status(200).send('Evaluación guardada exitosamente');
    });
});
// Ruta para procesar la solicitud POST de eliminar evaluación
router.delete('/delete-evaluacion', async (req, res) => {
    const {idFormulario} = req.body;

    // Validar el ID recibido
    if (!idFormulario) {
        return res.status(400).send('Falta el ID de la evaluación');
    }

    const query = 'DELETE FROM evaluaciones WHERE id = ?';

    connection.query(query, [idFormulario], (err, result) => {
        if (err) {
            console.error('Error al eliminar la evaluación:', err);
            return res.status(500).send('Hubo un error al eliminar la evaluación');
        }

        res.status(200).send('Evaluación eliminada exitosamente');
    });
});


module.exports = router;

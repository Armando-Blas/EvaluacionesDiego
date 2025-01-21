const express = require('express');
const router = express.Router();
const googleSheetRoutes = require("./googleSheetRoutes");
const googleSheetRoutesAll = require("./googleSheetRoutesAll");

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
        const { id } = req.query;

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


module.exports = router;

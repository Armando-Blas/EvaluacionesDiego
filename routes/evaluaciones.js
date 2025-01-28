const express = require('express');
const router = express.Router();
const connection = require('../config/database');

const googleSheetRoutes = require("./googleSheetRoutes");
const googleSheetRoutesAll = require("./googleSheetRoutesAll");
const googleSheetRoutesById = require("./googleSheetRoutesById");
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
const formulariosConImagenes = [
    {
        nombre: " profesores",
        imagen: "/images/1.jpeg",
        urlExcel: "https://docs.google.com/spreadsheets/d/1eZvyu8GXV1e7A09n1ZuHJhjmb922qnfmarBcjoJchPI/edit?resourcekey=&gid=13827301#gid=13827301"
    },
    {
        nombre: " servicio de computo y telemática",
        imagen: "/images/2.jpeg",
        urlExcel: "https://docs.google.com/spreadsheets/d/1rqpwElJwcT1twYYPKorNjXM6kNLVjUzVomtxIEpfWu4/edit?resourcekey&usp=forms_web_b&urp=linked#gid=120663220"
    },
    {
        nombre: " caja",
        imagen: "/images/3.jpeg",
        urlExcel: "https://docs.google.com/spreadsheets/d/1hUnzuqjnzeCDBnEZ5mLSQGnchYo8EHVDKELfR6UR-1g/edit?resourcekey=&gid=1759457532#gid=1759457532"
    },
    {
        nombre: " departamento de vinculación y extensión",
        imagen: "/images/4.jpeg",
        urlExcel: "https://docs.google.com/spreadsheets/d/1-hHlnAUN--GFniU3k3JSX_jk4NEFI-rv8W9oFpePV6E/edit?resourcekey=&gid=1404084976#gid=1404084976"
    },
    {
        nombre: " departamento de control escolar",
        imagen: "/images/5.jpeg",
        urlExcel: "https://docs.google.com/spreadsheets/d/1kQILoCOCNIjRFwtE5J28FXILr197cXwfHZu3Zq5la3E/edit?resourcekey=&gid=2010871211#gid=2010871211"
    },
    {
        nombre: " departamento de titulación",
        imagen: "/images/6.jpeg",
        urlExcel: "https://docs.google.com/spreadsheets/d/12oehtbBPyTIi72haaJTbWkXRmogFgTPwGGcDiQl9X78/edit?resourcekey=&gid=834547658#gid=834547658"
    },
    {
        nombre: " servicio de biblioteca",
        imagen: "/images/7.jpeg",
        urlExcel: "https://docs.google.com/spreadsheets/d/1GvBCB0FcOuXz7AlRYZulHaGAM4fUhg3dJYVMsRfVGB8/edit?resourcekey=&gid=1690136402#gid=1690136402"
    },
    {
        nombre: " servicio de ingles",
        imagen: "/images/8.jpeg",
        urlExcel: "https://docs.google.com/spreadsheets/d/1tq45QVXw1QZKmqsBjaWyP9ElIJkZB_e8BIv2uBSi6s0/edit?resourcekey=&gid=582083439#gid=582083439"
    },
    {
        nombre: " limpieza y mantenimiento",
        imagen: "/images/9.jpeg",
        urlExcel: "https://docs.google.com/spreadsheets/d/1ajEVjDBsFesggnSg6-z4BQhtBrZXbRjnZnqsIncX-wI/edit?resourcekey=&gid=1827280342#gid=1827280342"
    },
    {
        nombre: " servicio de cafetería",
        imagen: "/images/10.jpeg",
        urlExcel: "https://docs.google.com/spreadsheets/d/1qnP1s1Y0MfnrB7sAnsFtVVb-lpaRKpbTp4wN8Pc3vdU/edit?resourcekey=&gid=452037938#gid=452037938"
    },
    {
        nombre: " jefes de división",
        imagen: "/images/11.jpeg",
        urlExcel: "https://docs.google.com/spreadsheets/d/1inA0feM4XMK3msnF7D-L6afYLORiDmMGaoyVRGj7chM/edit?resourcekey=&gid=1582620017#gid=1582620017"
    },
    {
        nombre: " servicio de tutoría/psicológica",
        imagen: "/images/12.jpeg",
        urlExcel: "https://docs.google.com/spreadsheets/d/1P-8K1iXsvH8w2IsyZh6C4H6N6tze6E6ktz3ofrmCzjY/edit?resourcekey=&gid=45063646#gid=45063646"
    },
    {
        nombre: " servicio de almacén",
        imagen: "/images/13.jpeg",
        urlExcel: "https://docs.google.com/spreadsheets/d/17z9B3MM-SLbHJ9k0pP4obmdW4CQOn5LFj5YaJBXXEXk/edit?resourcekey=&gid=728291848#gid=728291848"
    },
    {
        nombre: " departamento de vinculación y seguimiento de egresados",
        imagen: "/images/14.jpeg",
        urlExcel: "https://docs.google.com/spreadsheets/d/1_zHBvXMHtNgRFVMcWHnZXFZ7KrvQ7PiuV-K-WkVX-dM/edit?resourcekey=&gid=902750189#gid=902750189"
    },
    {
        nombre: " profesores de ingles",
        imagen: "/images/15.jpeg",
        urlExcel: "https://docs.google.com/spreadsheets/d/1RZlwB7e9PLNofRV3MZmfcz5q_v3BvYxwztaEdz1Oa2A/edit?resourcekey=&gid=1617608728#gid=1617608728"
    },
    {
        nombre: " departamento de educación continua",
        imagen: "/images/16.jpeg",
        urlExcel: "https://docs.google.com/spreadsheets/d/1AnmgOcEaFA9BB9ZMO1KuEBhHxRGJVQf-q0n4y6R4T6w/edit?resourcekey&usp=forms_web_b&urp=initialLink#gid=2127229100"
    }
];
// Aplicar el middleware a todas las rutas
router.use((req, res, next) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    next();
});

router.get('/', (req, res) => {
    res.render('home', {
        activePage: 'inicio',
        title: 'EVALUACIONES DOCENTES',
        formulariosConImagenes: formulariosConImagenes
    });
});

router.get('/save', (req, res) => {
    res.render('evaluaciones', {
        activePage: 'save',
        title: 'guardar encuesta',
        formulariosConImagenes: formulariosConImagenes
    });
});
router.get('/info/', (req, res) => {
    const idFormulario = req.query.id;
    const nombre = req.query.nombre;
    const query = 'SELECT * FROM evaluaciones WHERE id = ?';
    connection.query(query, [idFormulario], (err, results) => {
        if (err) {
            console.error('Error al obtener los datos de la evaluación:', err);
            return res.status(500).send('Hubo un error al obtener los datos de la evaluación.');
        }

        if (results.length === 0) {
            return res.status(404).send('No se encontró la evaluación con el ID especificado.');
        }

        const evaluacion = results[0]; // Obtenemos la evaluación encontrada

        res.render('evaluaciones', {
            activePage: 'info',
            title: 'info encuestas',
            formulariosConImagenes: formulariosConImagenes,
            nombre: nombre,
            idFormulario: idFormulario,
            evaluacion: evaluacion
        });
    });
});

router.get('/edit', (req, res) => {
    const idFormulario = req.query.id;

    // Consulta para obtener los datos de la evaluación
    const query = 'SELECT * FROM evaluaciones WHERE id = ?';

    connection.query(query, [idFormulario], (err, results) => {
        if (err) {
            console.error('Error al obtener los datos de la evaluación:', err);
            return res.status(500).send('Hubo un error al obtener los datos de la evaluación.');
        }

        if (results.length === 0) {
            return res.status(404).send('No se encontró la evaluación con el ID especificado.');
        }

        const evaluacion = results[0]; // Obtenemos la evaluación encontrada

        res.render('evaluaciones', {
            activePage: 'edit', // Cambiamos la página activa para cargar el formulario de edición
            title: 'Editar Evaluación',
            evaluacion: evaluacion,
            idFormulario: idFormulario
        });
    });
});

module.exports = router;

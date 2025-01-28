var express = require('express');
var router = express.Router();
const pool = require('../config/database');
let idFormulario=1;
/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'EVALUACIONES DOCENTES' });
});
router.post('/', (req, res) => {
    const { username, password } = req.body;
    if (username === 'admin' && password === '12345') {
        req.session.user = username;
        return res.redirect('/home');
    } else {
        res.status(401).send('Credenciales inválidas.');
    }
});
module.exports = router;

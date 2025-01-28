var express = require('express');
var router = express.Router();
let idFormulario=1;
router.get('/', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  res.redirect('/home');
});

router.get('/logout', (req, res) => {
  if (req.session) {
    // Destruir toda la sesión
    req.session.destroy(err => {
      if (err) {
        res.status(500).json({ success: false, message: 'Error al cerrar la sesión.' });
      } else {
        // Redirigir después de cerrar sesión
        res.redirect('/login'); // O cualquier otra página a la que quieras redirigir
      }
    });
  } else {
    // Si no hay sesión activa
    res.redirect('/login');
  }
});

module.exports = router;

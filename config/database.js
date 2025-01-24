// config/db.js
const mysql = require('mysql2');

// Crear la conexión a la base de datos
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'evaluaciones'
});

// Conexión abierta con éxito
connection.connect(err => {
    if (err) {
        console.error('Error al conectar a la base de datos:', err.stack);
        return;
    }
    console.log('Conexión a la base de datos establecida con ID ' + connection.threadId);
});

module.exports = connection;

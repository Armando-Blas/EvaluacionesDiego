// config/db.js
const mysql = require('mysql2');
require('dotenv').config();

// Crear la conexión a la base de datos
const connection = mysql.createConnection({
    host: process.env.MYSQLHOST,
    port: process.env.MYSQLPORT,
    user: process.env.MYSQLUSER,
    password: process.env.MYSQL_ROOT_PASSWORD,
    database: process.env.MYSQL_DATABASE
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

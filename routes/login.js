const express = require('express');
const body_parser = require('body-parser')
const bcrypt = require('bcrypt');
const Usuario = require('../models/usuario');
const controlador = require('../controllers/customerController');
const app = express();

app.use(myConnection(mysql, {
    host: 'localhost',
    user: 'root',
    password: 'ajSE18!',
    port: 3306,
    database: 'software_estructural'
}, 'single'));
app.use(express.urlencoded({ extended: false }));

app.use(body_parser.urlencoded({ extended: true }));

app.post('/login', (req, res) => {

    let body = req.body;
    console.log(body);

    //Prueba de un parcial
    req.getConnection((err, conn) => {
        conn.query('SELECT * FROM user', (err, customers) => {
            if (err) {
                res.json(err);
            }
            console.log(customers);

            res.json({
                customers,
                token: '123'
            })

        });
    });

    ///fin prueba de un parcial

    // res.json({
    //     ok: true,
    //     comentario: 'Llegó a login.js'
    // })

});



module.exports = app;
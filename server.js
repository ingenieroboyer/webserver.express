const express = require('express');
const hbs = require('hbs');
require('./hbs/helpers');

path = require('path'),
    morgan = require('morgan'),
    mysql = require('mysql'),
    myConnection = require('express-myconnection');
require('./routes/directory.js');
const app = express();



const port = process.env.PORT || 3000;

app.use(express.static(__dirname + '/public'));

app.use(require('./routes/login'));
// app.use(require('./routes/usuario'));

app.set('view engine', 'hbs');

// middlewares
app.use(morgan('dev'));
app.use(myConnection(mysql, {
    host: 'localhost',
    user: 'root',
    password: 'ajSE18!',
    port: 3306,
    database: 'software_estructural'
}, 'single'));
app.use(express.urlencoded({ extended: false }));


// Express HBS engine
hbs.registerPartials(__dirname + '/views/parciales');
app.get('/', (req, res) => {
    res.render('home', {
        nombre: 'leonardo',
        anio: new Date().getFullYear()
    });
});

//Prueba de un parcial
app.get('/list', (req, res) => {
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
});
///fin prueba de un parcial






app.get('/about', (req, res) => {
    res.render('about', {
        anio: new Date().getFullYear()
    });
});


app.post('/../../routes/login', (req, res) => {
    res.render('/../../login', {
        anio: new Date().getFullYear()
    });
});

app.get('/login', (req, res) => {
    res.render('login', {
        anio: new Date().getFullYear()
    });
});


app.listen(port, () => {
    console.log(`Escuchando peticiones en el puerto ${port}`);
});
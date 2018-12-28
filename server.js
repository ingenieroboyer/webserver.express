const express = require('express');
const customerController = require('./controllers/customerController');
const { verificaToken } = require('./middleware/autentication');
const { verificaAdmin_Role } = require('./middleware/autentication');
const hbs = require('hbs');
require('./hbs/helpers');

const directory = require('./routes/directory');
path = require('path'),
    morgan = require('morgan'),
    mysql = require('mysql'),
    myConnection = require('express-myconnection');
require('./routes/directory.js');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.static(__dirname + '/public'));
app.set('view engine', 'hbs');

// middlewares
app.use(morgan('dev'));
app.use('/', directory);
app.use('/about', directory);

// Express HBS engine
hbs.registerPartials(__dirname + '/views/parciales');
app.get('/pruebalistar', customerController.list);

// ///prueba
// app.get('/usuario', [verificaToken, verificaAdmin_Role], (req, res) => {
//     var posiciones = JSON.parse(req.body);
//     console.log(posiciones);
//     res.render('usuarioValidado');
// });
// ///

app.listen(port, () => {
    console.log(`Escuchando peticiones en el puerto ${port}`);
});
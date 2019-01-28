const express = require('express');
const router = require('express').Router();
path = require('path'),
    morgan = require('morgan'),
    mysql = require('mysql'),
    myConnection = require('express-myconnection');

const { verificaToken } = require('../middleware/autentication');
const { verificaAdmin_Role } = require('../middleware/autentication');

const customerController = require('../controllers/customerController');
const business = require('../models/business');


router.use(express.static(__dirname + '/public'));

router.use(myConnection(mysql, {
    host: 'localhost',
    user: 'root',
    password: 'Ajsoftwarestructural2019!',
    port: 3306,
    database: 'ajss'
}, 'pool'));

router.use(express.urlencoded({ extended: false }));

router.get('/', (req, res) => {
    res.render('home', {
        nombre: 'leonardo',
        anio: new Date().getFullYear()
    });
});

router.get('/about', (req, res) => {
    res.render('about', {
        nombre: 'leonardo',
        anio: new Date().getFullYear()
    });
});

router.post('/login', [customerController.valid], (req, res) => {
    res.render('logeado', {
        anio: new Date().getFullYear()
    });
});

// router.post('/resultadoAS', [customerController.analyAST60], (req, res) => {
//     res.render('resultadoAS', {
//         anio: new Date().getFullYear()
//     });
// });
router.post('/resultadoAS_pruebas', [business.calculoAgnos], (req, res) => {
    res.render('resultadoAS_pruebas', {
        anio: new Date().getFullYear()
    });
});

router.get('/login', (req, res) => {
    res.render('login', {
        anio: new Date().getFullYear()
    });
});

router.get('/estudioAS', (req, res) => {
    res.render('estudioAS', {
        anio: new Date().getFullYear()
    });
});
router.get('/prueba', (req, res) => {
    res.render('prueba', {
        anio: new Date().getFullYear()
    });
});
router.get('/administrarAntenas', (req, res) => {
    res.render('administrarAntenas', {
        anio: new Date().getFullYear()
    });
});
router.post('/dashCliente', [customerController.dash], (req, res) => { ///Debo añadir el midleware que valida el token del localstorage
    console.log('Estamos en el enrutador, pasado el midleware :' + req.body.sitio);
    console.log('res :' + res);

    res.render('dashCliente', {
        res: res,
        anio: new Date().getFullYear()
    });
});



module.exports = router;

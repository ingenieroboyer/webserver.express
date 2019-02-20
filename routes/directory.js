const express = require('express');

var bodyParser = require('body-parser');

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

router.use(bodyParser.json()); // support json encoded bodies
router.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies


router.use(myConnection(mysql, {
    host: 'localhost',
    user: 'root',
    password: 'Ajsoftwarestructural2019!',
    port: 3306,
    database: 'software_estructural'
}, 'pool'));

// router.use(express.urlencoded({ extended: false }));

router.get('/', (req, res) => {
    res.render('home', {
        nombre: 'leonardo',
        anio: new Date().getFullYear()
    });
});
router.post('/home', (req, res) => {
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


router.post('/resultadoAS_pruebas', [business.calculoAgnos], (req, res) => { /////AQUÍ ES DONDE SE TOMAN LOS DATOS DEL FOMULARIO DINÁMICO
    var paraver = req.body;
    console.log("Antes de enviarlo al calculoAgnos" + paraver.armando);
    res.render('resultadoAS', {
        nomb: req.body.name,
        anio: new Date().getFullYear()
    });
});

router.post('/resultadoAS', [business.calculoAgnos], (req, res) => {
    res.render('resultadoAS', {
        anio: new Date().getFullYear()
    });
});



router.post('/test', [verificaToken], (req, res) => {
    console.log(" antes del render home" + JSON.stringify(req.body));
    res.render('home', {
        anio: new Date().getFullYear()
    });
});



router.get('/login', (req, res) => {
    res.render('login', {
        anio: new Date().getFullYear()
    });
});

router.get('/vistaInforme', (req, res) => {
    res.render('vistaInforme', {
        anio: new Date().getFullYear()
    });
});

router.get('/estudioAS', (req, res) => {
    res.render('estudioAS', {
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

router.post('/dashCliente_prueba', [customerController.dash], (req, res) => { ///Debo añadir el midleware que valida el token del localstorage
    console.log('Estamos en el enrutador, pasado el midleware :' + req.body.sitio);
    console.log('res :' + res);

    res.render('dashCliente', {
        res: res,
        anio: new Date().getFullYear()
    });
});

module.exports = router;
const express = require('express');
const router = require('express').Router();

// const { verificaToken } = require('../middleware/autentication');
// const customerController = require('../controllers/customerController');


// router.get('/list', customerController.list);
// router.post('/login', customerController.valid);
// router.post('/add', customerController.save);
// router.get('/update/:id', customerController.edit);
// router.post('/update/:id', customerController.update);
// router.get('/delete/:id', customerController.delete);

// router.get('/loco', customerController.list);

router.get('/', (req, res) => {
    res.render('home', {
        nombre: 'leonardo',
        anio: new Date().getFullYear()
    });
});

// router.get('/usuario', verificaToken, (req, res) => {
//     var posiciones = JSON.parse(req.body);
//     console.log(posiciones);
//     res.render('usuarioValidado', { posicionesJson: posiciones });
// });

module.exports = router;
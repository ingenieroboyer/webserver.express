const controller = {};
const jwt = require('jsonwebtoken');
path = require('path'),
    morgan = require('morgan'),
    // mysql = require('mysql'),
    // myConnection = require('express-myconnection');


    require('../config/config');

const { datosSitios } = require('../middleware/datosSitios');
const { dashboardCliente } = require('../middleware/dashboardCliente');
const { TodosLosSitios } = require('../middleware/TodosLosSitios');
var lista = new Array();



controller.dash = (req, res) => {
    console.log(' Ingresa en el controller.dash');
    let dashwaite1 = async(req, res) => {
        console.log(' Ingresa en el dashwaite1 ');
        let dashwaite2 = await dashboardCliente(req, res, (err, band) => {
            if (err) {
                console.log('En daswaite  :' + err);
            } else {
                console.log('Ingreso al final de el controlador antes de pasar a la vista');
                var anio = new Date().getFullYear();
                res.render('dashCliente_prueba', {
                    anio: anio,
                    band: band
                });
            }
        });
        // dashwaite2(req, res);
    }
    dashwaite1(req, res);
}

controller.clasifica = (req, res) => {
    console.log(' Ingresa en el controller.clasifica');
    let dashwaite1 = async(req, res) => {
        console.log(' Ingresa en el dashwaite1 ');
        let dashwaite2 = TodosLosSitios(req, res, (err, datoTodosLosSitios) => {
            if (err) {
                console.log('En TodosLosSitios  :' + err);
            } else {
                console.log('Ingreso al final de el controlador  TodosLosSitios antes de pasar a la vista');
                var anio = new Date().getFullYear();
                res.render('clasifica', {
                    anio: anio,
                    datoTodosLosSitios: datoTodosLosSitios
                });
            }
        });
        // dashwaite2(req, res);
    }
    dashwaite1(req, res);
}


controller.valid = (req, res) => {
    req.getConnection((err, conn) => {
        var email = req.body.email;
        var password = req.body.password;
        // console.log(email);
        // console.log(password);
        conn.query('SELECT * FROM user WHERE email1 = ?', [email], function(err, results, fields) {
            if (err) {
                console.log("error ocurred", error);
                res.send({
                    "code": 400,
                    "failed": "pilas con la cantidad de variables que envias"
                })
            } else {

                console.log(" el rol =" + results[0].role);


                if (results.length > 0) {
                    if (results[0].password == password && results[0].email1 == email) {
                        const role = results[0].role;
                        const pass = results[0].password;
                        const nombre = results[0].name1;
                        const org = results[0].organitation;

                        let token = jwt.sign({
                            role: role,
                            nombre: nombre,
                            email: email,
                        }, 'este-es-el-seed-desarrollo', { expiresIn: 60 * 60 });

                        if (role === 'ADMIN_ROLE') {
                            res.render('usuarioAdmin', { token, role, nombre });
                        }

                        if (role === 'CLIENT_ROLE') {
                            async function vista(conn, req, res, org) {
                                var band = await datosSitios(conn, nombre, token, req, res, org);

                                return band;

                            }

                            vista(conn, req, res, org).then(band => {
                                console.log("El timer cuando viene de datosSitios " + JSON.stringify(band));
                            });
                        }

                        if (role === 'USER_ROLE' || role === 'ANALYST_ROLE') {
                            res.render('usuarioUser', { token, role, nombre });
                        }

                    } else {
                        console.log('El usuario no introdujo un password válido')
                        res.send({
                            "code": 204,
                            "success": "Email y password no coinciden",

                        });
                    }
                }
            }

        });
    });
};



let final = async(req) => {
    var estudio = req.body.mem_cal;
    let calculoSta = await calcStateSolic(req);
    console.log('Resultado: ' + calculoSta);
}


module.exports = controller;
const controller = {};
const jwt = require('jsonwebtoken');
path = require('path'),
    morgan = require('morgan'),
    // mysql = require('mysql'),
    myConnection = require('express-myconnection');


require('../config/config');



controller.list = (req, res) => {
    req.getConnection((err, conn) => {
        conn.query('SELECT * FROM user', (err, customers) => {
            if (err) {
                res.json(err);
            }
            res.json(customers);

        });
        // connnection.release();
    });
};

controller.save = (req, res) => {
    const data = req.body;
    console.log(req.body)
    req.getConnection((err, connection) => {
        const query = connection.query('INSERT INTO customer set ?', data, (err, customer) => {
            console.log(customer)
            res.redirect('/');
        })
    })
};

controller.edit = (req, res) => {
    const { id } = req.params;
    req.getConnection((err, conn) => {
        conn.query("SELECT * FROM customer WHERE id = ?", [id], (err, rows) => {
            res.render('customers_edit', {
                data: rows[0]
            })
        });
    });
};

controller.update = (req, res) => {
    const { id } = req.params;
    const newCustomer = req.body;
    req.getConnection((err, conn) => {

        conn.query('UPDATE customer set ? where id = ?', [newCustomer, id], (err, rows) => {
            res.redirect('/');
        });
    });
};

controller.valid = (req, res) => {
    req.getConnection((err, conn) => {
        var email = req.body.email;
        var password = req.body.password;
        console.log(email);
        console.log(password);
        conn.query('SELECT * FROM user WHERE email1 = ?', [email], function(error, results, fields) {
            if (error) {
                console.log("error ocurred", error);
                res.send({
                    "code": 400,
                    "failed": "pilas con la cantidad de variables que envias"
                })
            } else {
                // console.log('The solution is: ', results);
                if (results.length > 0) {
                    if (results[0].password == password && results[0].email1 == email) {
                        const role = results[0].role;
                        const pass = results[0].password;
                        const nombre = results[0].name1;

                        let token = jwt.sign({
                            role: role,
                            nombre: nombre
                        }, 'este-es-el-seed-desarrollo', { expiresIn: 60 * 60 * 24 });
                        console.log(role);
                        console.log(pass);
                        console.log(nombre);

                        if (role === 'ADMIN_ROLE') {
                            res.render('usuarioAdmin', { token, role, nombre });
                        }

                        if (role === 'CLIENT_ROLE') {
                            res.render('usuarioClient', { token, role, nombre });
                        }

                        if (role === 'USER_ROLE' || role === 'ANALYST_ROLE') {
                            res.render('usuarioUser', { token, role, nombre });
                        }
                        // if (role === 'ANALYST_ROLE') {
                        //     res.render('usuarioAnalyst', { token, role });
                        // }


                    } else {
                        console.log(role, nombre)
                        res.send({
                            "code": 204,
                            "success": "Email y password no coinciden",

                        });
                    }
                } else {
                    res.send({
                        "code": 204,
                        "success": "Email o clave no existen"
                    });
                }
            }
        });
    });
};

controller.analyAST60 = function(req, res) {
    // var valorJason = JSON.stringify(req.body);
    const indexEst_id = 1;
    const mem_cal = req.body.mem_cal;
    const q = req.body.viento;

    let mom_basal = req.body.moment_basal;
    const mom_cort = req.body.moment_corte;

    const antena1 = req.body.antena1;
    const antena2 = req.body.antena2;
    const antena3 = req.body.antena3;
    const antena4 = req.body.antenaSect1;

    const altura1 = req.body.alturaAntena1;
    const altura2 = req.body.alturaAntena2;
    const altura3 = req.body.alturaAntena3;
    const altura4 = req.body.alturaAntenaSect1;

    const n1 = 1;
    const n2 = 1;
    const n3 = 1;
    const n4 = req.body.cantAntSect1;


    let calcStateSolic = async(req, indexEst_id) => {
        ////////////////////////////////////////////////////////
        /////// AQUÍ COMIENZA EL CÓDIGO CONGELADO///////////////
        ////////////////////////////////////////////////////////

        req.getConnection((err, conn) => {
            conn.query("SELECT * FROM antenas WHERE descripcion = ?", [req.body.alturaAntena1], (err, results, fields) => {
                if (err) {
                    throw new Error(`Hay un problema a nivel de del query antena1`);
                }
                if (results.length > 0) {
                    global.coma = ",";
                    global.punto = ".";
                    global.coef_forma1 = results[0].coe_antena;

                    global.coef_antena1 = parseFloat(coef_forma1.replace(coma, punto));

                    global.area1 = results[0].area_antena;
                    global.areatutu1 = area1.replace(coma, punto);
                    global.areaFloat1 = parseFloat(areatutu1.replace(coma, punto));

                    global.fuerza1 = areaFloat1 * n1 * coef_antena1 * q;
                    global.mom_basal1 = fuerza1 * parseInt(altura1);
                    global.mom_acum1 = mom_basal1 + parseInt(mom_basal);

                    global.cort_acum1 = fuerza1 + parseInt(mom_cort);
                    global.coef_mom1 = mom_acum1 / parseInt(mom_basal);
                    global.coef_cort1 = cort_acum1 / parseInt(mom_cort);

                    var VALORES = [
                        [indexEst_id, altura1, areaFloat1, n1, coef_antena1, q, fuerza1, mom_basal1, mom_acum1, cort_acum1, coef_mom1, coef_cort1]
                    ];
                    conn.query("INSERT INTO estsolic (indexEst_id,altura,area,cantidad,coef_forma,q,fuerza,mom_basal,mom_acum,cort_acum,coef_mom,coef_corte) VALUES  ?", [VALORES], (err, results, fields) => {
                        if (err) {
                            throw new Error(`Hay un problema a nivel de del query ingreso a estsolic1 `);
                        };
                    });
                } else {
                    console.log("parece que no tenemos un modelo de antena parecido");
                }

            });
        });



        req.getConnection((err, conn) => {
            conn.query("SELECT * FROM antenas WHERE descripcion = ?", [req.body.alturaAntena2], (err, results, fields) => {
                if (err) {
                    console.log("error ocurred", err);
                    res.send({
                        "code": 400,
                        "failed": "pilas con la cantidad de variables que envias"
                    })
                }
                if (results.length > 0) {
                    const coma = ",";
                    const punto = ".";

                    const coef_forma2 = results[0].coe_antena;
                    const coef_antena2 = parseFloat(coef_forma2.replace(coma, punto));

                    const area2 = results[0].area_antena;
                    const areatutu2 = area2.replace(coma, punto);
                    const areaFloat2 = parseFloat(areatutu2.replace(coma, punto));

                    const fuerza2 = areaFloat2 * n2 * coef_antena2 * q;
                    global.mom_basal2 = fuerza2 * parseInt(altura2);
                    global.mom_acum2 = mom_acum1 + mom_basal2;
                    global.cort_acum2 = cort_acum1 + fuerza2;
                    const coef_mom2 = mom_acum2 / mom_acum1;
                    const coef_cort2 = cort_acum2 / cort_acum1;

                    var VALORES2 = [
                        [indexEst_id, altura2, areaFloat2, n2, coef_antena2, q, fuerza2, mom_basal2, mom_acum2, cort_acum2, coef_mom2, coef_cort2]
                    ];
                    conn.query("INSERT INTO estsolic (indexEst_id,altura,area,cantidad,coef_forma,q,fuerza,mom_basal,mom_acum,cort_acum,coef_mom,coef_corte) VALUES  ?", [VALORES2], (err, results, fields) => {


                        if (err) {
                            console.log("error ocurred", err);
                            res.send({
                                "code": 400,
                                "failed": "pilas con la cantidad de variables que envias"
                            })
                        };
                    });
                } else {
                    console.log("parece que no tenemos un modelo de antena parecido");
                }
                if (err) {
                    console.log("error ocurred", err);
                    res.send({
                        "code": 400,
                        "failed": "no encontró la antena"
                    })
                }
            });
        });




        req.getConnection((err, conn) => {
            conn.query("SELECT * FROM antenas WHERE descripcion = ?", [req.body.alturaAntena3], (err, results, fields) => {

                if (err) {
                    console.log("error ocurred", err);
                    res.send({
                        "code": 400,
                        "failed": "pilas con la cantidad de variables que envias"
                    })
                }
                if (results.length > 0) {
                    const coma = ",";
                    const punto = ".";

                    const coef_forma3 = results[0].coe_antena;
                    const coef_antena3 = parseFloat(coef_forma3.replace(coma, punto));

                    const area3 = results[0].area_antena;
                    const areatutu3 = area3.replace(coma, punto);
                    const areaFloat3 = parseFloat(areatutu3.replace(coma, punto));

                    const fuerza3 = areaFloat3 * n3 * coef_antena3 * q;
                    global.mom_basal3 = fuerza3 * parseInt(altura3);
                    global.mom_acum3 = mom_acum2 + mom_basal3;
                    global.cort_acum3 = cort_acum2 + fuerza3;
                    const coef_mom3 = mom_acum3 / mom_acum2;
                    const coef_cort3 = cort_acum3 / cort_acum2;




                    var VALORES3 = [
                        [indexEst_id, altura3, areaFloat3, n3, coef_antena3, q, fuerza3, mom_basal3, mom_acum3, cort_acum3, coef_mom3, coef_cort3]
                    ];

                    conn.query("INSERT INTO estsolic (indexEst_id,altura,area,cantidad,coef_forma,q,fuerza,mom_basal,mom_acum,cort_acum,coef_mom,coef_corte) VALUES  ?", [VALORES3], (err, results, fields) => {
                        if (err) {
                            console.log("error ocurred", err);
                            res.send({
                                "code": 400,
                                "failed": "pilas con la cantidad de variables que envias"
                            })
                        };
                    });
                } else {
                    console.log("parece que no tenemos un modelo de antena parecido");
                }
                if (err) {
                    console.log("error ocurred", err);
                    res.send({
                        "code": 400,
                        "failed": "no encontró la antena"
                    })
                }
            });

            ///
        });



        req.getConnection((err, conn) => {
            conn.query("SELECT * FROM antenas WHERE descripcion = ?", [req.body.alturaAntena4], (err, results, fields) => {
                if (err) {
                    console.log("error ocurred", err);
                    res.send({
                        "code": 400,
                        "failed": "pilas con la cantidad de variables que envias"
                    })
                }
                if (results.length > 0) {
                    const coma = ",";
                    const punto = ".";

                    const coef_forma4 = results[0].coe_antena;
                    const coef_antena4 = parseFloat(coef_forma4.replace(coma, punto));

                    const area4 = results[0].area_antena;
                    const areatutu4 = area4.replace(coma, punto);
                    const areaFloat4 = parseFloat(areatutu4.replace(coma, punto));

                    const fuerza4 = areaFloat4 * n4 * coef_antena4 * q;
                    global.mom_basal4 = fuerza4 * parseInt(altura4);
                    global.mom_acum4 = mom_acum3 + mom_basal4;
                    global.cort_acum4 = cort_acum3 + fuerza4;
                    const coef_mom4 = mom_acum4 / mom_acum3;
                    const coef_cort4 = cort_acum4 / cort_acum3;




                    var VALORES4 = [
                        [indexEst_id, altura4, areaFloat4, n4, coef_antena4, q, fuerza4, mom_basal4, mom_acum4, cort_acum4, coef_mom4, coef_cort4]
                    ];

                    conn.query("INSERT INTO estsolic (indexEst_id,altura,area,cantidad,coef_forma,q,fuerza,mom_basal,mom_acum,cort_acum,coef_mom,coef_corte) VALUES  ?", [VALORES4], (err, results, fields) => {
                        if (err) {

                            console.log("error ocurred", err);
                            res.send({
                                "code": 400,
                                "failed": "pilas con la cantidad de variables que envias"
                            })
                        };
                    });
                } else {
                    console.log("parece que no tenemos un modelo de antena parecido");
                }
                if (err) {
                    console.log("error ocurred", err);
                    res.send({
                        "code": 400,
                        "failed": "no encontró la antena"
                    })
                }
            });
        });
        ////////////////////////////////////////////////////////
        /////// AQUÍ TERMINA EL CÓDIGO CONGELADO///////////////
        ////////////////////////////////////////////////////////
    }



    //************************************************************************//
    //************  AHORA SACAMOS LOS FACTORES DE AMPLIFICACIÓN   ************//
    //************************************************************************//
    // req.getConnection((err, conn) => {
    //     conn.query("SELECT * FROM estsolic WHERE indexEst_id = ?", [indexEst_id], (err, results, fields) => {
    //         const n = 10; //Máxima cantidad de tramos
    //         const altEstructura = 60; //Altura de la estructura

    //         var alturaTopeTramo = 0;
    //         var factor = 1; //variable que tendrá el valor del momento luego del condicional de las alturas
    //         var factorCorte = 1;
    //         const m = results.length; ///es el número de antenas que se instala en la estructura
    //         var nuevo = new Array(n);
    //         var nuevoFactAmp = new Array(m, 1);
    //         // const revisando = results[0].coef_mom;
    //         var factAmp = 1;
    //         var factAmpCorte = 1;

    //         for (var i = 0; i < n; i++) {
    //             // nuevoFactAmp[i] = new Array(m);
    //             alturaTopeTramo = alturaTopeTramo + 6;
    //             factAmp = 1;
    //             factAmpCorte = 1;

    //             for (var j = 0; j < results.length; j++) {
    //                 ///Condicional de las alturas
    //                 if ((results[j].altura) > (alturaTopeTramo - 6)) {
    //                     factor = results[j].coef_mom;
    //                     factorCorte = results[j].coef_corte;
    //                     console.log("se cumple condicion alturas con : " + results[j].altura + "y  " + alturaTopeTramo);
    //                 } else factor = 1;

    //                 factAmp = factAmp * factor;
    //                 factAmpCorte = factAmpCorte * factorCorte;
    //                 // console.log("Factor : " + factor);
    //             }


    //             var valorFacAmp = [
    //                 [indexEst_id, i + 1, alturaTopeTramo, factAmp, factAmpCorte]
    //             ];
    //             conn.query("INSERT INTO resestfacamp (indexEst_id,tramo,altura_tramo ,mom_fact_amp,corte_fact_amp ) VALUES  ?", [valorFacAmp], (err, results, fields) => {

    //                 if (err) {

    //                     console.log("error ocurred", err);
    //                     res.send({
    //                         "code": 400,
    //                         "failed": "pilas con la cantidad de variables que envias"
    //                     })
    //                 } else {
    //                     console.log("parece que ocurrio algo en la inserción");
    //                 }

    //             });


    //             console.log("Factor  amp mom acumulativo  " + factAmp);
    //             console.log("Factor  amp corte acumulativo  " + factAmpCorte);

    //         }
    //     });
    //     // myConnection.release();
    // });

    // // conn.end();  // Quiero eliminar la conexión a la base de datos
    //************************************************************************************//
    //*************  AQUÍ TERMINA EL CÁLCULO DE LOS FACTORES DE AMPLIFICACIÓN ************//
    //************************************************************************************//




    ///////////////////////////////////////////////////////////////////
    //////  COMIENZA  EL CALCULO DE LOS FACTORES DE UTILIZACIÓN ///////
    ///////////////////////////////////////////////////////////////////


    //     req.getConnection((err, conn) => {
    //         conn.query("SELECT * FROM antenas WHERE descripcion = ?", [antena1], (err, results, fields) => {
    //             if (err) {
    //                 console.log("error ocurred", err);
    //                 res.send({
    //                     "code": 400,
    //                     "failed": "pilas con la cantidad de variables que envias"
    //                 })
    //             }
    //             if (results.length > 0) {
    //                 const coma = ",";
    //                 const punto = ".";
    //                 const coef_forma1 = results[0].coe_antena;

    //                 const coef_antena1 = parseFloat(coef_forma1.replace(coma, punto));

    //                 const area1 = results[0].area_antena;
    //                 const areatutu1 = area1.replace(coma, punto);
    //                 const areaFloat1 = parseFloat(areatutu1.replace(coma, punto));
    // /*  */
    //                 const fuerza1 = areaFloat1 * n1 * coef_antena1 * q;
    //                 global.mom_basal1 = fuerza1 * parseInt(altura1);
    //                 global.mom_acum1 = mom_basal1 + parseInt(mom_basal);

    //                 global.cort_acum1 = fuerza1 + parseInt(mom_cort);
    //                 const coef_mom1 = mom_acum1 / parseInt(mom_basal);
    //                 const coef_cort1 = cort_acum1 / parseInt(mom_cort);

    //                 var VALORES = [
    //                     [indexEst_id, altura1, areaFloat1, n1, coef_antena1, q, fuerza1, mom_basal1, mom_acum1, cort_acum1, coef_mom1, coef_cort1]
    //                 ];
    //                 conn.query("INSERT INTO estsolic (indexEst_id,altura,area,cantidad,coef_forma,q,fuerza,mom_basal,mom_acum,cort_acum,coef_mom,coef_corte) VALUES  ?", [VALORES], (err, results, fields) => {
    //                     if (err) {
    //                         console.log("error ocurred", err);
    //                         res.send({
    //                             "code": 400,
    //                             "failed": "pilas con la cantidad de variables que envias"
    //                         })
    //                     };
    //                 });
    //             } else {
    //                 console.log("parece que no tenemos un modelo de antena parecido");
    //             }
    //             if (err) {
    //                 console.log("error ocurred", err);
    //                 res.send({
    //                     "code": 400,
    //                     "failed": "no encontró la antena"
    //                 })
    //             }
    //         });
    //     });

    //     ///
    //     req.getConnection((err, conn) => {
    //         conn.query("SELECT * FROM antenas WHERE descripcion = ?", [antena2], (err, results, fields) => {
    //             if (err) {
    //                 console.log("error ocurred", err);
    //                 res.send({
    //                     "code": 400,
    //                     "failed": "pilas con la cantidad de variables que envias"
    //                 })
    //             }
    //             if (results.length > 0) {
    //                 const coma = ",";
    //                 const punto = ".";

    //                 const coef_forma2 = results[0].coe_antena;
    //                 const coef_antena2 = parseFloat(coef_forma2.replace(coma, punto));

    //                 const area2 = results[0].area_antena;
    //                 const areatutu2 = area2.replace(coma, punto);
    //                 const areaFloat2 = parseFloat(areatutu2.replace(coma, punto));

    //                 const fuerza2 = areaFloat2 * n2 * coef_antena2 * q;
    //                 global.mom_basal2 = fuerza2 * parseInt(altura2);
    //                 global.mom_acum2 = mom_acum1 + mom_basal2;
    //                 global.cort_acum2 = cort_acum1 + fuerza2;
    //                 const coef_mom2 = mom_acum2 / mom_acum1;
    //                 const coef_cort2 = cort_acum2 / cort_acum1;

    //                 var VALORES2 = [
    //                     [indexEst_id, altura2, areaFloat2, n2, coef_antena2, q, fuerza2, mom_basal2, mom_acum2, cort_acum2, coef_mom2, coef_cort2]
    //                 ];
    //                 conn.query("INSERT INTO estsolic (indexEst_id,altura,area,cantidad,coef_forma,q,fuerza,mom_basal,mom_acum,cort_acum,coef_mom,coef_corte) VALUES  ?", [VALORES2], (err, results, fields) => {


    //                     if (err) {
    //                         console.log("error ocurred", err);
    //                         res.send({
    //                             "code": 400,
    //                             "failed": "pilas con la cantidad de variables que envias"
    //                         })
    //                     };
    //                 });
    //             } else {
    //                 console.log("parece que no tenemos un modelo de antena parecido");
    //             }
    //             if (err) {
    //                 console.log("error ocurred", err);
    //                 res.send({
    //                     "code": 400,
    //                     "failed": "no encontró la antena"
    //                 })
    //             }
    //         });
    //     });




    //     req.getConnection((err, conn) => {
    //         conn.query("SELECT * FROM antenas WHERE descripcion = ?", [antena3], (err, results, fields) => {

    //             if (err) {
    //                 console.log("error ocurred", err);
    //                 res.send({
    //                     "code": 400,
    //                     "failed": "pilas con la cantidad de variables que envias"
    //                 })
    //             }
    //             if (results.length > 0) {
    //                 const coma = ",";
    //                 const punto = ".";

    //                 const coef_forma3 = results[0].coe_antena;
    //                 const coef_antena3 = parseFloat(coef_forma3.replace(coma, punto));

    //                 const area3 = results[0].area_antena;
    //                 const areatutu3 = area3.replace(coma, punto);
    //                 const areaFloat3 = parseFloat(areatutu3.replace(coma, punto));

    //                 const fuerza3 = areaFloat3 * n3 * coef_antena3 * q;
    //                 global.mom_basal3 = fuerza3 * parseInt(altura3);
    //                 global.mom_acum3 = mom_acum2 + mom_basal3;
    //                 global.cort_acum3 = cort_acum2 + fuerza3;
    //                 const coef_mom3 = mom_acum3 / mom_acum2;
    //                 const coef_cort3 = cort_acum3 / cort_acum2;




    //                 var VALORES3 = [
    //                     [indexEst_id, altura3, areaFloat3, n3, coef_antena3, q, fuerza3, mom_basal3, mom_acum3, cort_acum3, coef_mom3, coef_cort3]
    //                 ];

    //                 conn.query("INSERT INTO estsolic (indexEst_id,altura,area,cantidad,coef_forma,q,fuerza,mom_basal,mom_acum,cort_acum,coef_mom,coef_corte) VALUES  ?", [VALORES3], (err, results, fields) => {
    //                     if (err) {
    //                         console.log("error ocurred", err);
    //                         res.send({
    //                             "code": 400,
    //                             "failed": "pilas con la cantidad de variables que envias"
    //                         })
    //                     };
    //                 });
    //             } else {
    //                 console.log("parece que no tenemos un modelo de antena parecido");
    //             }
    //             if (err) {
    //                 console.log("error ocurred", err);
    //                 res.send({
    //                     "code": 400,
    //                     "failed": "no encontró la antena"
    //                 })
    //             }
    //         });

    //         ///
    //     });



    //     req.getConnection((err, conn) => {
    //         conn.query("SELECT * FROM antenas WHERE descripcion = ?", [antena4], (err, results, fields) => {
    //             if (err) {
    //                 console.log("error ocurred", err);
    //                 res.send({
    //                     "code": 400,
    //                     "failed": "pilas con la cantidad de variables que envias"
    //                 })
    //             }
    //             if (results.length > 0) {
    //                 const coma = ",";
    //                 const punto = ".";

    //                 const coef_forma4 = results[0].coe_antena;
    //                 const coef_antena4 = parseFloat(coef_forma4.replace(coma, punto));

    //                 const area4 = results[0].area_antena;
    //                 const areatutu4 = area4.replace(coma, punto);
    //                 const areaFloat4 = parseFloat(areatutu4.replace(coma, punto));

    //                 const fuerza4 = areaFloat4 * n4 * coef_antena4 * q;
    //                 global.mom_basal4 = fuerza4 * parseInt(altura4);
    //                 global.mom_acum4 = mom_acum3 + mom_basal4;
    //                 global.cort_acum4 = cort_acum3 + fuerza4;
    //                 const coef_mom4 = mom_acum4 / mom_acum3;
    //                 const coef_cort4 = cort_acum4 / cort_acum3;




    //                 var VALORES4 = [
    //                     [indexEst_id, altura4, areaFloat4, n4, coef_antena4, q, fuerza4, mom_basal4, mom_acum4, cort_acum4, coef_mom4, coef_cort4]
    //                 ];

    //                 conn.query("INSERT INTO estsolic (indexEst_id,altura,area,cantidad,coef_forma,q,fuerza,mom_basal,mom_acum,cort_acum,coef_mom,coef_corte) VALUES  ?", [VALORES4], (err, results, fields) => {
    //                     if (err) {

    //                         console.log("error ocurred", err);
    //                         res.send({
    //                             "code": 400,
    //                             "failed": "pilas con la cantidad de variables que envias"
    //                         })
    //                     };
    //                 });
    //             } else {
    //                 console.log("parece que no tenemos un modelo de antena parecido");
    //             }
    //             if (err) {
    //                 console.log("error ocurred", err);
    //                 res.send({
    //                     "code": 400,
    //                     "failed": "no encontró la antena"
    //                 })
    //             }
    //         });
    //     });

    ///////////////////////////////////////////////////////////////////
    //////FIN DEL CALCULO DE LOS FACTORES DE UTILIZACIÓN //////////////
    ///////////////////////////////////////////////////////////////////



    // /////////////////////////////////////////////////////////////////////
    // ////////  COMIENZA  el RESULTADO FINAL     //////
    // /////////////////////////////////////////////////////////////////////

    // req.getConnection((err, conn) => { ///Aquí debaría guardar el resultado en alguna variable para que esta exista fuera de la gestión del query en si

    //     conn.query("SELECT * FROM resestfacamp WHERE indexEst_id = ?", [indexEst_id], (err, results5, fields) => {
    //         if (err) {
    //             console.log("error ocurred", err);
    //             res.send({
    //                 "code": 400,
    //                 "failed": "pilas con la cantidad de variables que envias"
    //             })
    //         }
    //         if (results5.length > 0) {
    //             global.results5 = results5;
    //         } else {
    //             console.log("algo está muy mal en el Query");
    //         }
    //     });



    //     conn.query("SELECT * FROM fact_util_tramo WHERE hist_mc_id = ?", [indexEst_id], (err, results6, fields) => {
    //         if (err) {
    //             console.log("error ocurred", err);
    //             res.send({
    //                 "code": 400,
    //                 "failed": "pilas con la cantidad de variables que envias"
    //             })
    //         }
    //         if (results6.length > 0) {
    //             global.results6 = results6;
    //             global.filas2 = results6.length;

    //         } else {
    //             console.log("algo está muy mal en el Query");
    //         }


    //     });

    //     conn.query("SELECT * FROM fact_util_trayecto WHERE hist_mc_id = ?", [indexEst_id], (err, results7, fields) => {
    //         if (err) {
    //             console.log("error ocurred", err);
    //             res.send({
    //                 "code": 400,
    //                 "failed": "pilas con la cantidad de variables que envias"
    //             })
    //         }
    //         if (results7.length > 0) {
    //             global.filas3 = results7.length;
    //             // global.facUtilTrayecto = JSON.stringify(results7[0].pernos);
    //             global.results7 = results7;


    //             // console.log(pruebaLETTER)
    //         } else {
    //             console.log("algo está muy mal en el Query");
    //         }

    //         var fuCantonero = [];
    //         var fuDiagonales = [];
    //         var fuMontantes = [];
    //         var fuconex_diag_pernos = [];
    //         var fuconex_diag_planchas = [];
    //         var fuconex_mont_pernos = [];
    //         var fuconex_mont_planchas = [];

    //         var fupernos = [];
    //         var fubridas = [];



    //         for (i = 0; i < results5.length; i++) {
    //             var desp = i + 1;

    //             fuCantonero.push(parseFloat(results5[i].mom_fact_amp.replace(",", ".")) * parseFloat(results6[i].cantonero.replace(",", ".")));
    //             fuDiagonales.push(parseFloat(results5[i].corte_fact_amp.replace(",", ".")) * parseFloat(results6[i].diagonales.replace(",", ".")));
    //             fuMontantes.push(parseFloat(results5[i].corte_fact_amp.replace(",", ".")) * parseFloat(results6[i].montantes.replace(",", ".")));
    //             fuconex_diag_pernos.push(parseFloat(results5[i].corte_fact_amp.replace(",", ".")) * parseFloat(results6[i].conex_diag_pernos.replace(",", ".")));
    //             fuconex_diag_planchas.push(parseFloat(results5[i].corte_fact_amp.replace(",", ".")) * parseFloat(results6[i].conex_diag_planchas.replace(",", ".")));
    //             fuconex_mont_pernos.push(parseFloat(results5[i].corte_fact_amp.replace(",", ".")) * parseFloat(results6[i].conex_mont_pernos.replace(",", ".")));
    //             fuconex_mont_planchas.push(parseFloat(results5[i].corte_fact_amp.replace(",", ".")) * parseFloat(results6[i].conex_mont_planchas.replace(",", ".")));
    //             // fupernos.push(parseFloat(results5[desp].corte_fact_amp.replace(",", ".")) * parseFloat(results7[i].pernos.replace(",", ".")));
    //             // fubridas.push(parseFloat(results5[desp].corte_fact_amp.replace(",", ".")) * parseFloat(results7[i].bridas.replace(",", ".")));

    //         }
    //         console.log(fuCantonero);
    //         console.log(fuDiagonales);
    //         console.log(fuMontantes);
    //         console.log(fuconex_diag_pernos);
    //         console.log(fuconex_diag_planchas);
    //         console.log(fuconex_mont_pernos);
    //         console.log(fuconex_mont_planchas);

    //         res.render('resultadoAS', {
    //             anio: new Date().getFullYear(),
    //             fuCantonero,
    //             fuDiagonales,
    //             fuMontantes,
    //             fuconex_diag_pernos,
    //             fuconex_diag_planchas,
    //             fuconex_mont_pernos,
    //             fuconex_mont_planchas
    //         });

    //         // console.log(fupernos);
    //         // console.log(fubridas);
    //         //////Se realizarán todos los cálculos
    //         // console.log(" cantidad de elementos " + results5.length);
    //         // for (i = 0; i < results5.length; i++) {
    //         //     // fuEstOrig.factor = { momento: JSON.stringify(results5[i].mom_fact_amp) };
    //         //     {
    //         //         fuCantonero.push(results5[i].mom_fact_amp);
    //         //     }
    //         // }


    //         // var locura = global.results5;
    //         // console.log(JSON.stringify(fuCantonero));

    //     });
    // });
    // ////////////Aquí termina el cálculo final ///////////


    res.render('resultadoAS', {
        anio: new Date().getFullYear()
    });
};

module.exports = controller;
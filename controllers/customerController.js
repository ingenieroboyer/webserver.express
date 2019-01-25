const controller = {};
const jwt = require('jsonwebtoken');
path = require('path'),
    morgan = require('morgan'),
    // mysql = require('mysql'),
    // myConnection = require('express-myconnection');


    require('../config/config');

const { datosSitios } = require('../middleware/datosSitios');
const { dashboardCliente } = require('../middleware/dashboardCliente');
var lista = new Array();



// controller.dash = (req, res, band) => {

//     dashboardCliente(req, res, function(err, band) {
//         if (err) {
//             console.log(err);
//         } else {
//             var anio = new Date().getFullYear();
//             res.render('dashCliente', {
//                 // anio: anio,
//                 band: band
//             });
//         }

//     });


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
                res.render('dashCliente', {
                    // anio: anio,
                    band: band
                });
            }

        });

        // dashwaite2(req, res);
    }
    dashwaite1(req, res);


    // let espera = async(conn, req, org) => {
    //     var anio = new Date().getFullYear();
    //     let procesado = await datosSitios(conn, req, org, (err, band) => {
    //         if (err) {
    //             console.log('El pasaje no era suficiente' + JSON.stringify(band));
    //         } else {
    //             console.log('El pasaje no era suficiente' + JSON.stringify(band));

    //             res.render('dashCliente', {
    //                 // anio: anio,
    //                 band: band
    //             });
    //         }
    //     });
    // }

    // espera(conn, req, org);
}


controller.list = (req, res) => {
    req.getConnection((err, conn) => {
        conn.query('SELECT * FROM user', (err, customers) => {
            if (err) {
                res.json(err);
            }
            res.json(customers);

        });
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
        conn.query('SELECT * FROM user WHERE email1 = ?', [email], function(err, results, fields) {
            if (err) {
                console.log("error ocurred", error);
                res.send({
                    "code": 400,
                    "failed": "pilas con la cantidad de variables que envias"
                })
            } else {

                if (results.length > 0) {
                    if (results[0].password == password && results[0].email1 == email) {
                        const role = results[0].role;
                        const pass = results[0].password;
                        const nombre = results[0].name1;
                        const org = results[0].organitation;

                        let token = jwt.sign({
                            role: role,
                            nombre: nombre
                        }, 'este-es-el-seed-desarrollo', { expiresIn: 60 * 60 });
                        console.log(role);
                        console.log(pass);
                        console.log(nombre);

                        if (role === 'ADMIN_ROLE') {
                            res.render('usuarioAdmin', { token, role, nombre });
                        }

                        if (role === 'CLIENT_ROLE') {
                            console.log('Entró a la categoria del usuario');
                            console.log('El valor de la organizacion :' + org);

                            ///Se debe sincronizar aquí

                            let vista = async(conn, req, org) => {
                                let band = await datosSitios(conn, req, org, (err, band) => {

                                    if (err) {
                                        console.log('Tenemos un error de los sitios');
                                    } else {
                                        console.log('Antes de enviarlo al front ' + JSON.stringify(band))
                                            // band: band
                                        var anio = new Date().getFullYear();
                                        res.render('usuarioClient', { band, nombre, token, anio }); //falta el anio
                                    }


                                });

                                ////hay que atajar el error si se produce


                            }
                            vista(conn, req, org);

                            //fin de la sincronizacion

                            // datosSitios(conn, req, results[0].organitation, function(err, band) {
                            //     // console.log('Quiero saber que hay en band' + band);
                            //     var anio = new Date().getFullYear();
                            //     res.render('usuarioClient', { band, nombre, anio, token });
                            // });

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


    var estudio = req.body.mem_cal;
    global.matriz1 = new Array(12); //Hay que definirlo por comprensión para poder escalar

    let domingo = async(req, allast) => {

        req.getConnection((err, conn) => {

            function calcula(conn, req, amounter) {
                conn.query("SELECT * FROM antenas WHERE descripcion = ?", [req.body.antena1], function(err, results, fields) {
                    if (err) {
                        throw new Error(`Hay un problema a nivel de del query antena1`);
                    } else {
                        // console.log('connected as id ' + conn.threadId);
                        global.coma = ",";
                        global.punto = ".";
                        global.coef_forma1 = results[0].coe_antena;
                        global.coef_antena1 = coef_forma1;
                        global.area1 = results[0].area_antena;
                        global.areatutu1 = area1;
                        global.areaFloat1 = areatutu1;
                        global.fuerza1 = areaFloat1 * n1 * coef_antena1 * q;
                        global.mom_basal1 = fuerza1 * parseInt(altura1);
                        global.mom_acum1 = mom_basal1 + parseInt(mom_basal);
                        global.cort_acum1 = fuerza1 + parseInt(mom_cort);
                        global.coef_mom1 = mom_acum1 / parseInt(mom_basal);
                        global.coef_cort1 = cort_acum1 / parseInt(mom_cort);
                        global.VALORES = new Array(10);
                        VALORES[0] = [estudio, altura1, areaFloat1, n1, coef_antena1, q, fuerza1, mom_basal1, mom_acum1, cort_acum1, coef_mom1, coef_cort1];

                        //// AQUÍ EMBUTO EL SEGUNDO QUERY


                        conn.query("SELECT * FROM antenas WHERE descripcion = ?", [req.body.antena2], (err, results, fields) => {
                            if (err) {
                                console.log("Hay un problema a nivel de del query con  antena2: ", err);
                                throw new Error(`Hay un problema a nivel de del query con  antena2  `);
                            }
                            if (results.length > 0) {
                                const coma = ",";
                                const punto = ".";

                                const coef_forma2 = results[0].coe_antena;
                                const coef_antena2 = coef_forma2;

                                const area2 = results[0].area_antena;
                                const areatutu2 = area2;
                                const areaFloat2 = areatutu2;

                                const fuerza2 = areaFloat2 * n2 * coef_antena2 * q;
                                global.mom_basal2 = fuerza2 * parseInt(altura2);
                                global.mom_acum2 = mom_acum1 + mom_basal2;
                                global.cort_acum2 = cort_acum1 + fuerza2;
                                const coef_mom2 = mom_acum2 / mom_acum1;
                                const coef_cort2 = cort_acum2 / cort_acum1;

                                var VALORES1 = [estudio, altura2, areaFloat2, n2, coef_antena2, q, fuerza2, mom_basal2, mom_acum2, cort_acum2, coef_mom2, coef_cort2];
                                VALORES[1] = VALORES1;

                                ///Empiezo a embutir 2

                                conn.query("SELECT * FROM antenas WHERE descripcion = ?", [req.body.antena3], (err, results, fields) => {

                                    if (err) {
                                        console.log("Hay un problema a nivel del query antena 3 ", err);
                                        throw new Error(`Hay un problema a nivel del query antena 3  `);
                                    }
                                    if (results.length > 0) {
                                        const coma = ",";
                                        const punto = ".";
                                        const coef_forma3 = results[0].coe_antena;
                                        const coef_antena3 = coef_forma3;
                                        const area3 = results[0].area_antena;
                                        const areatutu3 = area3;
                                        const areaFloat3 = areatutu3;
                                        const fuerza3 = areaFloat3 * n3 * coef_antena3 * q;
                                        global.mom_basal3 = fuerza3 * parseInt(altura3);
                                        global.mom_acum3 = mom_acum2 + mom_basal3;
                                        global.cort_acum3 = cort_acum2 + fuerza3;
                                        const coef_mom3 = mom_acum3 / mom_acum2;
                                        const coef_cort3 = cort_acum3 / cort_acum2;

                                        var VALORES2 = [estudio, altura3, areaFloat3, n3, coef_antena3, q, fuerza3, mom_basal3, mom_acum3, cort_acum3, coef_mom3, coef_cort3];
                                        VALORES[2] = VALORES2;

                                        /// embutido3
                                        req.getConnection((err, conn) => {
                                            conn.query("SELECT * FROM antenas WHERE descripcion = ?", [req.body.antenaSect1], (err, results, fields) => {
                                                if (err) {
                                                    console.log("Hay un problema a nivel del query antena 4 ", err);
                                                    throw new Error(`Hay un problema a nivel del query antena 4  `);
                                                } else {
                                                    const coma = ",";
                                                    const punto = ".";
                                                    const coef_forma4 = results[0].coe_antena;
                                                    const coef_antena4 = coef_forma4;
                                                    const area4 = results[0].area_antena;
                                                    const areatutu4 = area4;
                                                    const areaFloat4 = areatutu4;
                                                    const fuerza4 = areaFloat4 * n4 * coef_antena4 * q;
                                                    global.mom_basal4 = fuerza4 * parseInt(altura4);
                                                    global.mom_acum4 = mom_acum3 + mom_basal4;
                                                    global.cort_acum4 = cort_acum3 + fuerza4;
                                                    const coef_mom4 = mom_acum4 / mom_acum3;
                                                    const coef_cort4 = cort_acum4 / cort_acum3;
                                                    var VALORES3 = [estudio, altura4, areaFloat4, n4, coef_antena4, q, fuerza4, mom_basal4, mom_acum4, cort_acum4, coef_mom4, coef_cort4];

                                                    VALORES[3] = VALORES3;
                                                    // console.log('Uno' + VALORES[0][10]);
                                                    // console.log('Dos' + VALORES[1][10]);
                                                    // console.log('tres' + VALORES[2][10]);
                                                    // console.log('Cuatro' + VALORES[3][10]);
                                                    amounter(null, VALORES)
                                                }

                                            });
                                        });
                                        ///termino embutido3                                     
                                    }
                                });
                                ////termino de embutir2
                            }
                        });
                        ////FINAL DEL EMBUTIMIENTO




                    }
                });
            }
            calcula(conn, req, function(err, amounter) {
                if (err) Console.log('Dentro del callback :' + err)
                else {
                    const n = 10; //Máxima cantidad de tramos
                    const altEstructura = 60; //Altura de la estructura
                    var valorFacAmp = new Array(12);
                    var alturaTopeTramo = 0;
                    var alturaux;
                    var factor = 1; //variable que tendrá el valor del momento luego del condicional de las alturas
                    var factorCorte = 1;
                    var k = 0;
                    // console.log(amounter);

                    for (var i = 0; i < n; i++) {
                        // if (amounter) {
                        //     k = k + 1;
                        //     }

                    }
                    const m = 4; ///es el número de antenas que se instala en la estructura

                    var nuevo = new Array(n);
                    var nuevoFactAmp = new Array(m);
                    var factAmp = 1;
                    var factAmpCorte = 1;

                    for (var i = 0; i < n; i++) {
                        nuevoFactAmp[i] = new Array(m);
                        alturaTopeTramo = alturaTopeTramo + 6;
                        factAmp = 1;
                        factAmpCorte = 1;

                        for (var j = 0; j < m; j++) {
                            alturaux = amounter[j][1];

                            if (alturaux > (alturaTopeTramo - 6)) {
                                factorAmp = amounter[j][10];
                                factorCorte = amounter[j][11];
                                // console.log("se cumple condicion alturas con : " + alturaux + "y  " + alturaTopeTramo);
                            } else {
                                factorCorte = 1;
                                factorAmp = 1;
                            }

                            factAmp = factAmp * factorAmp;
                            factAmpCorte = factAmpCorte * factorCorte;
                            // console.log("Factor : " + factAmpCorte);
                        }
                        valorFacAmp[i] = [estudio, i + 1, alturaTopeTramo, factAmp, factAmpCorte];
                    }
                }

                allast(valorFacAmp)
            });
        });
    }

    let consolida = async(req) => {
        let VAL = await domingo(req, (allast) => {
            for (var i = 0; i < 10; i++) {
                // console.log('Cortantes  :' + allast[i][4])
            }

            ///// Aquí empieza el  Milton /////
            var estudio = req.body.mem_cal;
            req.getConnection((err, conn) => { ///Aquí debaría guardar el resultado en alguna variable para que esta exista fuera de la gestión del query en si

                conn.query("SELECT * FROM fact_util_tramo WHERE hist_mc_id = ?", [estudio], (err, results6, fields) => {
                    if (err) {
                        console.log("error ocurred", err);
                        res.send({
                            "code": 400,
                            "failed": "pilas con la cantidad de variables que envias"
                        })
                    }
                    if (results6.length > 0) {
                        global.results6 = results6;
                        global.filas2 = results6.length;

                    } else {
                        console.log("algo está muy mal en el Query");
                    }
                });

                conn.query("SELECT * FROM fact_util_trayecto WHERE hist_mc_id = ?", [estudio], (err, results7, fields) => {
                    if (err) {
                        console.log("error ocurred", err);
                        res.send({
                            "code": 400,
                            "failed": "pilas con la cantidad de variables que envias"
                        })
                    }
                    if (results7.length > 0) {
                        global.filas3 = results7.length;
                        // global.facUtilTrayecto = JSON.stringify(results7[0].pernos);
                        global.results7 = results7;


                        // console.log(pruebaLETTER)
                    } else {
                        console.log("algo está muy mal en el Query");
                    }
                    var imprimibleTramo = [];
                    var imprimibleTrayecto = [];
                    global.fuCantonero = [];
                    global.fuDiagonales = [];
                    global.fuMontantes = [];
                    global.fuconex_diag_pernos = [];
                    global.fuconex_diag_planchas = [];
                    global.fuconex_mont_pernos = [];
                    global.fuconex_mont_planchas = [];

                    var fupernos = [];
                    var fubridas = [];
                    var lista = new Array();
                    var acuCant, acuDiag, acuMont, acuConDiagPer, acuConDiagPlan, acuMontPer, acuMontPlan;
                    var resultadoFuCantonero, resultadoFuDiag, resultadoFuMont, resultadoConDiagPer, resultadoConDiagPlan, resultadoacuMontPer, resultadoacuMontPlan;

                    var j = 1;



                    // for (i = 0; i < results5.length; i++) {
                    for (i = 0; i < 10; i++) {
                        var desp = i + 1;
                        imprimibleTramo.push({
                            Tramo: parseFloat(results6[i].id_factutiltramo),
                            factorCantonero: parseFloat(allast[i][3]) * parseFloat(results6[i].cantonero.replace(",", ".")),
                            factorDiagonales: parseFloat(allast[i][4]) * parseFloat(results6[i].diagonales.replace(",", ".")),
                            factorMontantes: parseFloat(allast[i][4]) * parseFloat(results6[i].montantes.replace(",", ".")),
                            factordiagpernos: parseFloat(allast[i][4]) * parseFloat(results6[i].conex_diag_pernos.replace(",", ".")),
                            factordiagplanchas: parseFloat(allast[i][4]) * parseFloat(results6[i].conex_diag_planchas.replace(",", ".")),
                            factormontpernos: parseFloat(allast[i][4]) * parseFloat(results6[i].conex_mont_pernos.replace(",", ".")),
                            fuconexmontplanchas: parseFloat(allast[i][4]) * parseFloat(results6[i].conex_mont_planchas.replace(",", ".")),
                            futramopernos: parseFloat(allast[i][4]) * parseFloat(results7[j].pernos.replace(",", ".")),
                            futramobridas: parseFloat(allast[i][4]) * parseFloat(results7[j].bridas.replace(",", "."))
                        });





                        // fuMontantes.push(parseFloat(allast[i][4]) * parseFloat(results6[i].montantes.replace(",", ".")));
                        // fuconex_diag_pernos.push(parseFloat(allast[i][4]) * parseFloat(results6[i].conex_diag_pernos.replace(",", ".")));
                        // fuconex_diag_planchas.push(parseFloat(allast[i][4]) * parseFloat(results6[i].conex_diag_planchas.replace(",", ".")));
                        // fuconex_mont_pernos.push(parseFloat(allast[i][4]) * parseFloat(results6[i].conex_mont_pernos.replace(",", ".")));
                        // fuconex_mont_planchas.push(parseFloat(allast[i][4]) * parseFloat(results6[i].conex_mont_planchas.replace(",", ".")));
                        // console.log('en iteracion ' + i + ', los montantes planchas : ' + fuconex_mont_planchas[i]);
                        // console.log('en iteracion ' + i + ', fuconex_diag_planchas : ' + fuconex_diag_planchas[i]);
                        // console.log('Viene de base de datos conex_diag_planchas : ' + results6[i].conex_diag_planchas);
                        // console.log('en iteracion ' + i + ', los fuconex_mont_planchas : ' + fuconex_mont_planchas[i]);
                        // // fupernos.push(parseFloat(results5[desp].corte_fact_amp.replace(",", ".")) * parseFloat(results7[i].pernos.replace(",", ".")));
                        // // fubridas.push(parseFloat(results5[desp].corte_fact_amp.replace(",", ".")) * parseFloat(results7[i].bridas.replace(",", ".")));

                    }


                    for (i = 0; i < 9; i++) { //Poner en función de "n"  
                        // var desp = i + 1;
                        imprimibleTrayecto.push({
                            Trayecto: results7[i].trayecto, //ojo con la coma
                            factorConexPernos: parseFloat(allast[i][4]) * parseFloat(results7[i].pernos.replace(",", ".")),
                            factorConexBridas: parseFloat(allast[i][3]) * parseFloat(results7[i].bridas.replace(",", "."))
                                // factorDiagonales: parseFloat(allast[i][4]) * parseFloat(results6[i].diagonales.replace(",", ".")),
                                // factorMontantes: parseFloat(allast[i][4]) * parseFloat(results6[i].montantes.replace(",", ".")),
                                // factordiagpernos: parseFloat(allast[i][4]) * parseFloat(results6[i].conex_diag_pernos.replace(",", ".")),
                                // factordiagplanchas: parseFloat(allast[i][4]) * parseFloat(results6[i].conex_diag_planchas.replace(",", ".")),
                                // factormontpernos: parseFloat(allast[i][4]) * parseFloat(results6[i].conex_mont_pernos.replace(",", ".")),
                                // fuconexmontplanchas: parseFloat(allast[i][4]) * parseFloat(results6[i].conex_mont_planchas.replace(",", ".")),
                                // futramopernos: parseFloat(allast[i][4]) * parseFloat(results7[j].pernos.replace(",", ".")),
                                // futramobridas: parseFloat(allast[i][4]) * parseFloat(results7[j].bridas.replace(",", "."))
                        });
                    }

                    // console.log(' Mostrando los trayectos');
                    // console.log(imprimibleTrayecto);
                    // console.log('el cantonero' + fuCantonero);

                    var comparador1 = fuCantonero[0];
                    var comparador2 = fuDiagonales[0];
                    var comparador3 = fuMontantes[0];
                    var comparador4 = fuconex_diag_pernos[0];
                    var comparador5 = fuconex_diag_planchas[0]; //fuconex_diag_planchas
                    var comparador6 = fuconex_mont_pernos[0];
                    var comparador7 = fuconex_mont_planchas[0];



                    // for (i = 0; i < 10; i++) {

                    //     if (i < 10 && isFinite(fuCantonero[i + 1])) { //se puede añadir la condición de que revise si la comparación es número para poder acumular el resultado o no
                    //         comparador1 = Math.max(comparador1, parseFloat(fuCantonero[i + 1]))
                    //     } else {
                    //         resultadoFuCantonero = comparador1;
                    //     }


                    //     if (i < 10 && isFinite(fuDiagonales[i + 1])) { //se puede añadir la condición de que revise si la comparación es número para poder acumular el resultado o no
                    //         comparador2 = Math.max(comparador2, parseFloat(fuDiagonales[i + 1]));

                    //     } else {
                    //         resultadoFuDiag = comparador2;
                    //     }


                    //     if (i < 10 && isFinite(fuMontantes[i + 1])) { //REVISAR QUE RECORRA TODO EL ARREGLO Y NO DEJE DE VER EL ÚLTIMO ELEMENTO
                    //         comparador3 = Math.max(comparador3, parseFloat(fuMontantes[i + 1]));

                    //     } else {
                    //         resultadoFuMont = comparador3;
                    //     }


                    //     if (i < 10 && isFinite(fuconex_diag_pernos[i + 1])) { //REVISAR QUE RECORRA TODO EL ARREGLO Y NO DEJE DE VER EL ÚLTIMO ELEMENTO
                    //         comparador4 = Math.max(comparador4, parseFloat(fuconex_diag_pernos[i + 1]));
                    //         // console.log('condición del no definido ' + fuconex_diag_pernos[i + 1] * 0);
                    //     } else {
                    //         resultadoConDiagPer = comparador4;
                    //     }


                    //     if (i < 10 && isFinite(fuconex_diag_planchas[i + 1])) { //REVISAR QUE RECORRA TODO EL ARREGLO Y NO DEJE DE VER EL ÚLTIMO ELEMENTO
                    //         comparador5 = Math.max(comparador5, parseFloat(fuconex_diag_planchas[i + 1]));
                    //         // console.log('condición del no definido ' + fuconex_diag_planchas[i + 1] * 0);
                    //         console.log('Tenemos fuconex_diag_planchas:' + comparador5);
                    //     } else {
                    //         resultadoConDiagPlan = comparador5;
                    //     }


                    //     if (i < 10 && isFinite(fuconex_mont_pernos[i + 1])) { //REVISAR QUE RECORRA TODO EL ARREGLO Y NO DEJE DE VER EL ÚLTIMO ELEMENTO
                    //         comparador6 = Math.max(comparador6, parseFloat(fuconex_mont_pernos[i + 1]));
                    //         // console.log('condición del no definido ' + fuconex_mont_pernos[i + 1] * 0);
                    //     } else {
                    //         resultadoacuMontPer = comparador6;
                    //     }

                    //     if (i < 10 && isFinite(fuconex_mont_planchas[i + 1])) { //REVISAR QUE RECORRA TODO EL ARREGLO Y NO DEJE DE VER EL ÚLTIMO ELEMENTO
                    //         comparador7 = Math.max(comparador7, parseFloat(fuconex_mont_planchas[i + 1]));
                    //         // fuconex_mont_planchas[i + 1] = acuMontPlan;
                    //         // console.log('condición del no definido ' + fuconex_mont_planchas[i + 1] * 0);
                    //     } else {
                    //         resultadoacuMontPlan = comparador7;
                    //     }

                    // }

                    // console.log(fuCantonero);
                    // console.log('El resultado de los cantoneros es :  ' + resultadoFuCantonero);
                    // console.log(fuDiagonales);
                    // console.log('El resultado de las diagonales es :  ' + resultadoFuDiag);
                    // console.log(fuMontantes);
                    // console.log('El resultado de las diagonales es :  ' + resultadoFuMont);
                    // console.log(fuconex_diag_pernos);
                    // console.log('El resultado de los cantoneros es :  ' + resultadoConDiagPer);
                    // console.log(fuconex_diag_planchas);
                    // console.log('El resultado de los cantoneros es :  ' + resultadoConDiagPlan);
                    // console.log(fuconex_mont_pernos);
                    // console.log('El resultado de las diagonales es :  ' + resultadoacuMontPer);
                    // console.log(fuconex_mont_planchas);
                    // console.log('El resultado de las diagonales es :  ' + resultadoacuMontPlan);


                    return res.render('resultadoAS', {
                        //// Si quiero enviar los fuCantonero /////
                        imprimibleTramo: imprimibleTramo,
                        imprimibleTrayecto: imprimibleTrayecto

                    });

                });
            });


            //////////Fin del Milton //////////
        });
    }

    consolida(req);

}

let final = async(req) => {
    var estudio = req.body.mem_cal;
    let calculoSta = await calcStateSolic(req);
    console.log('Resultado: ' + calculoSta);
}


module.exports = controller;
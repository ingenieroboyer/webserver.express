const model = {};
const express = require('express');
path = require('path');
const router = require('express').Router();
morgan = require('morgan');




model.calculoAgnos = function(req, res, conn) {
    var entrada = [];
    var SOLIC_ANT = [];

    let pasavalor = prepara(conn, req, res, (enter) => {
        var coeficiente;
        var area;
        var mome_bas_actual;
        var mome_bas_actual;
        var mom_bas_acum_anterior = enter.arr.mom_basal;
        var mom_bas_acum = enter.arr.mom_basal;
        var cort_bas_actual;
        var cort_bas_acum = enter.arr.corte_basal;
        var coe_mom_acum;
        var coe_cort_acum;
        var cort_bas_acum_anterior = enter.arr.corte_basal;
        var q;
        var num_antenas;
        var fuerza;
        var altura;
        var altura_torre = enter.arr.altura_torre;


        for (i = 0; i < enter.ent.length; i++) {
            condicion_viento = req.body.condicion_viento;
            coeficiente = enter.ent[i].coeficiente;
            area = enter.ent[i].area;
            num_antenas = enter.ent[i].n;
            q = enter.ent[i].q;
            altura = enter.ent[i].altura;
            fuerza = area * num_antenas * coeficiente * q;
            mome_bas_actual = fuerza * altura;
            mom_bas_acum = mome_bas_actual + mom_bas_acum;
            cort_bas_acum = fuerza + cort_bas_acum;
            coe_mom_acum = mom_bas_acum / (mom_bas_acum_anterior);
            coe_cort_acum = cort_bas_acum / (cort_bas_acum_anterior);
            mom_bas_acum_anterior = mom_bas_acum;
            cort_bas_acum_anterior = cort_bas_acum;

            SOLIC_ANT.push({
                altura_torre: enter.arr.altura_torre,
                condicion_viento: condicion_viento,
                fuerza: Math.round(fuerza),
                altura: altura,
                area: area,
                num_antenas: num_antenas,
                coeficiente: coeficiente,
                q: q,
                mome_bas_actual: Math.round(mome_bas_actual),
                mom_bas_acum: Math.round(mom_bas_acum),
                cort_bas_acum: Math.round(cort_bas_acum),
                coe_mom_acum: coe_mom_acum.toFixed(3),
                coe_cort_acum: coe_cort_acum.toFixed(3)
            });
        }
        console.log(" ");
        console.log("Insumos de fuerza, area" + enter.ent[0].area + " numero antenas =" + enter.ent[0].n + " coeficiente " + enter.ent[0].coeficiente + " q =" + enter.ent[0].q);
        console.log(" ");
        console.log(" ");
        console.log(" EESTUDIO DE LAS SOLICITACIONES EN business.js" + JSON.stringify(SOLIC_ANT));
        console.log(" ");

        //////AHORA VAMOS A GENERAR LOS FACTORES DE AMPLIFICACIÓN PARA MOMENTO Y CORTE//////

        // console.log("Altura de la torre : " + SOLIC_ANT[0].altura_torre);
        // const n = altura_torre / 6; //Máxima cantidad de tramos
        const n = altura_torre / 6; //Máxima cantidad de tramos
        var valorFacAmp = new Array(100);
        var alturaTopeTramo = 0; ///inicializado
        var alturaux;
        var factor = 1; //variable que tendrá el valor del momento luego del condicional de las alturas
        var factorCorte = 1;
        var k = 0;

        const m = SOLIC_ANT.length; ///es el número de antenas que se instala en la estructura

        var nuevo = new Array(Math.round(n) + 1);
        var nuevoFactAmp = new Array(m);
        var factAmpAcum = 1;
        var factAmpCorte = 1;
        var vect_fact_amp = [];


        for (var i = 0; i < n; i++) {
            nuevoFactAmp[i] = new Array(m);
            alturaTopeTramo = alturaTopeTramo + 6;
            factAmp = 1;
            factAmp2 = 1;
            for (var j = 0; j < m; j++) {
                if (SOLIC_ANT[j].altura > (alturaTopeTramo - 6)) {
                    factAmpAcum = SOLIC_ANT[j].coe_mom_acum;
                    factAmpCorte = SOLIC_ANT[j].coe_cort_acum;
                } else {
                    factAmpAcum = 1;
                    factAmpCorte = 1;
                }
                factAmp = factAmpAcum * factAmp;
                factAmp2 = factAmpCorte * factAmp2;
            }
            vect_fact_amp.push({
                tramo: (i + 1) * 6,
                tramoReal: (i + 1),
                factor_amp_momento: factAmp.toFixed(3),
                factor_amp_corte: factAmp2.toFixed(3)
            });
        }

        ////Esta función solo acomoda la informació que se va enviar a la

        let pasofinal = fu_final(conn, req, res, vect_fact_amp, enter, SOLIC_ANT, (fu) => {


            req.getConnection((err, conn1) => {
                var CargaInicial = [];
                var sitio = [];
                var estudio = [];
                estudio[0] = enter.data_mc;
                sitio[0] = enter.arr;
                conn1.query("SELECT * FROM inventario WHERE hist_mc_id=? ", [req.body.id_hist_mc], (err, cargin, fields) => {
                    if (err) {
                        console.log("Atento con error en query inventario");
                    } else {
                        for (i = 0; i < cargin.length; i++) {
                            CargaInicial.push({
                                descripcion: cargin[i].descripcion,
                                cantidad: cargin[i].cantidad,
                                orientacion: cargin[i].orientacion,
                                altura: cargin[i].altura
                            });
                        }
                        // console.log(" Que tiene el cuerpo antes de enviarlo = " + JSON.stringify(req.body));
                        console.log(" ");
                        console.log(" Que tiene enter.arr antes de enviarlo = " + JSON.stringify(enter.arr));
                        console.log(" ");
                        console.log(" Que tiene enter antes de enviarlo = " + JSON.stringify(enter));
                        console.log(" ");
                        console.log(" Que tiene enter.ent antes de enviarlo = " + JSON.stringify(enter.ent));
                        console.log(" ");
                        console.log(" Que tiene sitio antes de enviarlo = " + JSON.stringify(sitio));
                        console.log(" ");
                        console.log(" Que SOLIC_ANT antes de enviarlo = " + JSON.stringify(SOLIC_ANT));

                        return res.render('resultadoAS', {
                            // antenasAntes: req.body.antenasAntes,
                            solicitaciones: SOLIC_ANT,
                            factoresamptramos: vect_fact_amp,
                            enter: enter,
                            estudio: estudio,
                            sitio: sitio,
                            fu: fu,
                            CargaInicial: CargaInicial
                        });
                    }


                });

            });

            ///Aquí yo debería incluir un midleware para enviar a la vista de acuerdo al perfil del usuario solicitante

        });
    });
    console.log("Ip que hace la solicitud : " + req.ip); ///
}


let prepara = async(conn, req, res, enter) => { ///Esta función generará los datos necesarios para enviarlos a calcAgnos

    // console.log("Todo lo que le llega a prepara desde el req.body" + JSON.stringify(req.body));

    req.getConnection((err, conn1) => {
        var area = [];
        var q = [];
        var ent = [];
        let qs;
        if (req.body.antena1 !== "Elija una opción") {
            conn1.query("SELECT coe_antena FROM antenas WHERE descripcion=? ", [req.body.antena1], (err, coef, fields) => {
                if (err) {
                    console.log("Atajamos error query antena1 ");
                } else {
                    area[0] = (req.body.diametro1 / 2) * (req.body.diametro1 / 2) * 3.14;
                    var alt = Math.round(req.body.alturaAntena1);
                    let arr = {
                        altura: req.body.alturaAntena1,
                        condicion_viento: req.body.condicion_viento
                    }


                    qs = buscaq(conn, req, arr, (pol) => {
                        q[0] = pol;
                        ent.push({
                            n: 1,
                            altura: alt,
                            descrip: req.body.antena1,
                            area: area[0],
                            coeficiente: coef[0].coe_antena,
                            q: pol
                        });


                    });
                }
            });
        }

        if (req.body.antena2 !== "Elija una opción") {
            conn1.query("SELECT coe_antena FROM antenas WHERE descripcion=? ", [req.body.antena2], (err, coef, fields) => {
                if (err) {
                    console.log("Atajamos error query antena2 ");
                } else {
                    area[1] = (req.body.diametro2 / 2) * (req.body.diametro2 / 2) * 3.14;
                    var alt = Math.round(req.body.alturaAntena2);
                    let arr = {
                        altura: req.body.alturaAntena2,
                        condicion_viento: req.body.condicion_viento
                    }

                    qs = buscaq(conn, req, arr, (pol) => {

                        var ent2 = [alt, area[1], coef[0].coe_antena, pol];
                        ent.push({
                            n: 1,
                            altura: alt,
                            descrip: req.body.antena2,
                            area: area[1],
                            coeficiente: coef[0].coe_antena,
                            q: pol
                        });

                    });
                }
            });
        }

        if (req.body.antena3 !== "Elija una opción") {
            conn1.query("SELECT coe_antena FROM antenas WHERE descripcion=? ", [req.body.antena3], (err, coef, fields) => {
                if (err) {
                    console.log("Atajamos error query antena2 ");
                } else {

                    var alt = Math.round(req.body.alturaAntena3);
                    let arr = {
                        altura: req.body.alturaAntena3,
                        condicion_viento: req.body.condicion_viento
                    }

                    qs = buscaq(conn, req, arr, (pol) => {
                        ent.push({
                            n: 1,
                            altura: alt,
                            descrip: req.body.antena3,
                            area: (req.body.diametro3 / 2) * (req.body.diametro3 / 2) * 3.14,
                            coeficiente: coef[0].coe_antena,
                            q: pol
                        });
                    });
                }
            });
        }


        if (req.body.antena4 !== "Elija una opción") {
            conn1.query("SELECT coe_antena FROM antenas WHERE descripcion=? ", [req.body.antena4], (err, coef, fields) => {
                if (err) {
                    console.log("Atajamos error query antena2 ");
                } else {
                    var alt = Math.round(req.body.alturaAntena4);
                    let arr = {
                        altura: req.body.alturaAntena4,
                        condicion_viento: req.body.condicion_viento
                    }

                    qs = buscaq(conn, req, arr, (pol) => {
                        ent.push({
                            n: 1,
                            altura: alt,
                            descrip: req.body.antena4,
                            area: (req.body.diametro4 / 2) * (req.body.diametro4 / 2) * 3.14,
                            coeficiente: coef[0].coe_antena,
                            q: pol
                        });
                        // console.log("Arreglo ent  : " + ent);

                    });
                }
            });
        }
        if (req.body.antena5 !== "Elija una opción") {
            conn1.query("SELECT coe_antena FROM antenas WHERE descripcion=? ", [req.body.antena5], (err, coef, fields) => {
                if (err) {
                    console.log("Atajamos error query antena2 ");
                } else {
                    var alt = Math.round(req.body.alturaAntena5);
                    let arr = {
                        altura: req.body.alturaAntena5,
                        condicion_viento: req.body.condicion_viento
                    }

                    qs = buscaq(conn, req, arr, (pol) => {
                        ent.push({
                            n: 1,
                            altura: alt,
                            descrip: req.body.antena5,
                            area: (req.body.diametro5 / 2) * (req.body.diametro5 / 2) * 3.14,
                            coeficiente: coef[0].coe_antena,
                            q: pol
                        });

                    });
                }
            });
        }

        if (req.body.antena6 !== "Elija una opción") {
            conn1.query("SELECT coe_antena FROM antenas WHERE descripcion=? ", [req.body.antena6], (err, coef, fields) => {
                if (err) {
                    console.log("Atajamos error query antena2 ");
                } else {
                    var alt = Math.round(req.body.alturaAntena6);
                    let arr = {
                        altura: req.body.alturaAntena6,
                        condicion_viento: req.body.condicion_viento
                    }

                    qs = buscaq(conn, req, arr, (pol) => {
                        ent.push({
                            n: 1,
                            altura: alt,
                            descrip: req.body.antena6,
                            area: (req.body.diametro6 / 2) * (req.body.diametro6 / 2) * 3.14,
                            coeficiente: coef[0].coe_antena,
                            q: pol
                        });;

                    });
                }
            });
        }


        if (req.body.antena7 !== "Elija una opción") {
            conn1.query("SELECT coe_antena FROM antenas WHERE descripcion=? ", [req.body.antena7], (err, coef, fields) => {
                if (err) {
                    console.log("Atajamos error query antena2 ");
                } else {

                    var alt = Math.round(req.body.alturaAntena7);
                    let arr = {
                        altura: req.body.alturaAntena7,
                        condicion_viento: req.body.condicion_viento
                    }

                    qs = buscaq(conn, req, arr, (pol) => {
                        var ent6 = [alt, (req.body.diametro7 / 2) * (req.body.diametro7 / 2) * 3.14, coef[0].coe_antena, pol];
                        ent.push({
                            n: 1,
                            altura: alt,
                            descrip: req.body.antena7,
                            area: (req.body.diametro7 / 2) * (req.body.diametro7 / 2) * 3.14,
                            coeficiente: coef[0].coe_antena,
                            q: pol
                        });
                        // console.log("Arreglo ent  : " + JSON.stringify(ent));

                    });
                }
            });
        }
        if (req.body.antena8 !== "Elija una opción") {
            conn1.query("SELECT coe_antena FROM antenas WHERE descripcion=? ", [req.body.antena8], (err, coef, fields) => {
                if (err) {
                    console.log("Atajamos error query antena2 ");
                } else {

                    var alt = Math.round(req.body.alturaAntena8);
                    var vien = req.body.condicion_viento;
                    let arr = {
                        altura: req.body.alturaAntena8,
                        condicion_viento: req.body.condicion_viento
                    }

                    qs = buscaq(conn, req, arr, (pol) => {
                        var ent7 = [alt, (req.body.diametro8 / 2) * (req.body.diametro8 / 2) * 3.14, coef[0].coe_antena, pol];
                        ent.push({
                            n: 1,
                            altura: alt,
                            descrip: req.body.antena8,
                            area: (req.body.diametro8 / 2) * (req.body.diametro8 / 2) * 3.14,
                            coeficiente: coef[0].coe_antena,
                            q: pol
                        });


                    });
                }
            });
        }

        if (req.body.antena9 !== "Elija una opción") {
            conn1.query("SELECT coe_antena FROM antenas WHERE descripcion=? ", [req.body.antena9], (err, coef, fields) => {
                if (err) {
                    console.log("Atajamos error query antena2 ");
                } else {

                    var alt = Math.round(req.body.alturaAntena9);
                    let arr = {
                        altura: req.body.alturaAntena9,
                        condicion_viento: req.body.condicion_viento
                    }

                    qs = buscaq(conn, req, arr, (pol) => {
                        ent.push({
                            n: 1,
                            altura: alt,
                            descrip: req.body.antena9,
                            area: (req.body.diametro9 / 2) * (req.body.diametro9 / 2) * 3.14,
                            coeficiente: coef[0].coe_antena,
                            q: pol
                        });
                        // console.log("Arreglo ent  : " + JSON.stringify(ent));
                        // console.log("La longitud : " + ent.length);

                    });
                }
            });
        }





        if (req.body.antena10 !== "Elija una opción") {
            conn1.query("SELECT coe_antena FROM antenas WHERE descripcion=? ", [req.body.antena10], (err, coef, fields) => {
                if (err) {
                    console.log("Atajamos error query antena2 ");
                } else {

                    var alt = Math.round(req.body.alturaAntenaSect1);
                    let arr = {
                        altura: req.body.alturaAntenaSect1,
                        condicion_viento: req.body.condicion_viento
                    }

                    qs = buscaq(conn, req, arr, (pol) => {
                        var ent9 = [alt, (req.body.largo1) * (req.body.ancho1), coef[0].coe_antena, pol];
                        ent.push({
                            n: req.body.cantAntSect1,
                            altura: alt,
                            descrip: req.body.antena10,
                            area: (req.body.largo1) * (req.body.ancho1),
                            coeficiente: coef[0].coe_antena,
                            q: pol
                        });
                        // console.log("Arreglo ent  : " + JSON.stringify(ent));
                        // console.log("Arreglo ent  : " + ent.length);


                    });
                }
            });
        }

        if (req.body.antena11 !== "Elija una opción") {
            conn1.query("SELECT coe_antena FROM antenas WHERE descripcion=? ", [req.body.antena11], (err, coef, fields) => {
                if (err) {
                    console.log("Atajamos error query antena2 ");
                } else {

                    var alt = Math.round(req.body.alturaAntenaSect2);
                    let arr = {
                        altura: req.body.alturaAntenaSect2,
                        condicion_viento: req.body.condicion_viento
                    }

                    qs = buscaq(conn, req, arr, (pol) => {
                        ent.push({
                            n: req.body.cantAntSect2,
                            altura: alt,
                            descrip: req.body.antena11,
                            area: (req.body.largo2) * (req.body.ancho2),
                            coeficiente: coef[0].coe_antena,
                            q: pol
                        });
                        // console.log("Arreglo ent  : " + JSON.stringify(ent));
                        // console.log("Arreglo ent  : " + ent.length);


                    });
                }
            });
        }

        if (req.body.antena12 !== "Elija una opción") {
            conn1.query("SELECT coe_antena FROM antenas WHERE descripcion=? ", [req.body.antena12], (err, coef, fields) => {
                if (err) {
                    console.log("Atajamos error query antena2 ");
                } else {

                    var alt = Math.round(req.body.alturaAntenaSect3);
                    let arr = {
                        altura: req.body.alturaAntenaSect3,
                        condicion_viento: req.body.condicion_viento
                    }

                    qs = buscaq(conn, req, arr, (pol) => {
                        ent.push({
                            n: req.body.cantAntSect2,
                            altura: alt,
                            descrip: req.body.antena12,
                            area: (req.body.largo3) * (req.body.ancho3),
                            coeficiente: coef[0].coe_antena,
                            q: pol
                        });
                        // console.log("Arreglo ent  : " + JSON.stringify(ent));
                        // console.log("Arreglo ent  : " + ent.length);


                    });
                }
            });
        }


        if (req.body.antena13 !== "Elija una opción") {
            conn1.query("SELECT coe_antena FROM antenas WHERE descripcion=? ", [req.body.antena13], (err, coef, fields) => {
                if (err) {
                    console.log("Atajamos error query antena2 ");
                } else {

                    var alt = Math.round(req.body.alturaAntenaSect4);
                    let arr = {
                        altura: req.body.alturaAntenaSect4,
                        condicion_viento: req.body.condicion_viento
                    }

                    qs = buscaq(conn, req, arr, (pol) => {

                        ent.push({
                            n: req.body.cantAntSect4,
                            altura: alt,
                            descrip: req.body.antena13,
                            area: (req.body.largo4) * (req.body.ancho4),
                            coeficiente: coef[0].coe_antena,
                            q: pol
                        });
                        // console.log("Arreglo ent  : " + JSON.stringify(ent));
                        // console.log("Arreglo ent  : " + ent.length);


                    });
                }
            });
        }

        if (req.body.antena14 !== "Elija una opción") {
            conn1.query("SELECT coe_antena FROM antenas WHERE descripcion=? ", [req.body.antena14], (err, coef, fields) => {
                if (err) {
                    console.log("Atajamos error query antena2 ");
                } else {

                    var alt = Math.round(req.body.alturaAntenaSect5);

                    let arr = {
                        altura: req.body.alturaAntenaSect5,
                        condicion_viento: req.body.condicion_viento
                    }

                    qs = buscaq(conn, req, arr, (pol) => {

                        ent.push({
                            n: req.body.cantAntSect5,
                            altura: alt,
                            descrip: req.body.antena14,
                            area: (req.body.largo5) * (req.body.ancho5),
                            coeficiente: coef[0].coe_antena,
                            q: pol
                        });
                        // console.log("Arreglo ent  : " + JSON.stringify(ent));
                        // console.log("Arreglo ent  : " + ent.length);


                    });
                }
            });
        }

        if (req.body.antena15 !== "Elija una opción") {
            conn1.query("SELECT coe_antena FROM antenas WHERE descripcion=? ", [req.body.antena15], (err, coef, fields) => {
                if (err) {
                    console.log("Atajamos error query antena2 ");
                } else {

                    var alt = Math.round(req.body.alturaAntenaSect6);

                    let arr = {
                        altura: req.body.alturaAntenaSect6,
                        condicion_viento: req.body.condicion_viento
                    }

                    qs = buscaq(conn, req, arr, (pol) => {

                        ent.push({
                            n: req.body.cantAntSect6,
                            altura: alt,
                            descrip: req.body.antena15,
                            area: (req.body.largo6) * (req.body.ancho6),
                            coeficiente: coef[0].coe_antena,
                            q: pol
                        });
                        // console.log("Arreglo ent  : " + JSON.stringify(ent));
                        // console.log("Arreglo ent  : " + ent.length);


                    });
                }
            });
        }
        if (req.body.antena16 !== "Elija una opción") {
            conn1.query("SELECT coe_antena FROM antenas WHERE descripcion=? ", [req.body.antena16], (err, coef, fields) => {
                if (err) {
                    console.log("Atajamos error query antena2 ");
                } else {

                    var alt = Math.round(req.body.alturaAntenaSect7);

                    let arr = {
                        altura: req.body.alturaAntenaSect7,
                        condicion_viento: req.body.condicion_viento
                    }

                    qs = buscaq(conn, req, arr, (pol) => {

                        ent.push({
                            n: req.body.cantAntSect7,
                            altura: alt,
                            descrip: req.body.antena16,
                            area: (req.body.largo7) * (req.body.ancho7),
                            coeficiente: coef[0].coe_antena,
                            q: pol
                        });

                    });
                }
            });
        }


        conn1.query("SELECT * FROM mom_total WHERE hist_mc_id=? ", [req.body.id_hist_mc], (err, basales, fields) => {
            if (err) {
                console.log("Hubo un erro en el query de mom_total");
            } else {

                conn1.query("SELECT * FROM estructura WHERE hist_mc_id=? ", [req.body.id_hist_mc], (err, pelusas, fields) => {
                    if (err) {
                        console.log("Hubo un erro en el query de mom_total");
                    } else {

                        /////Esta es la forma de añadir propiedades al arreglo
                        let arr = {
                            altura_torre: req.body.altura_torre,
                            altura: 100,
                            condicion_viento: req.body.condicion_viento,
                            mom_basal: basales[0].mom_basal,
                            corte_basal: basales[0].corte_basal,
                            nombre: pelusas[0].nombre,
                            tipo: pelusas[0].tipo
                        }

                        let data_mc = {
                            fu: req.body.fu,
                            codigo: req.body.codigo,
                            id_hist_mc: req.body.id_hist_mc,
                            norma: req.body.norma,
                            viento: req.body.viento,
                            hielo: req.body.hielo,
                            fecha: req.body.fecha
                        }







                        // console.log("Donde se arma el arr, mom_basal :" + basales[0].mom_basal);
                        // console.log("Donde se arma el arr, mom_basal :" + basales[0].corte_basal);
                        qs = buscaq(conn, req, arr, (pol) => {
                            enter({
                                ent: ent,
                                arr: arr,
                                data_mc: data_mc
                            })

                        });





                    }
                });

            }
        });
    });
}


buscaq = (conn, req, arr, pol) => {
    var q;
    var alt = Math.round(arr.altura);

    console.log("REVISANDO QUE LE LLEGUE LA ALTURA A q " + alt);
    console.log("Si la busco en arr  =" + JSON.stringify(arr));

    req.getConnection((err, conn1) => {
        conn1.query("SELECT * FROM q WHERE altura=? ", [alt], (err, ques, fields) => {
            if (err) {
                console.log("Pendiente que hay un error");
            } else {
                if (arr.condicion_viento === "Ciudad") {
                    q = ques[0].Ciudad;
                    // console.log("La q es : " + ques[0].Ciudad);
                }
                if (arr.condicion_viento === "Ciudad_Cima_de_Cerro") {
                    q = ques[0].Ciudad_Cima_de_Cerro;
                    // console.log("La q es : " + ques[0].Ciudad_Cima_de_Cerro);
                }
                if (arr.condicion_viento === "Campo_Abierto") {
                    q = ques[0].Campo_Abierto;
                    // console.log("La q es : " + ques[0].Campo_Abierto);
                }
                if (arr.condicion_viento === "Cima_de_Cerro") {
                    q = ques[0].Cima_de_Cerro;
                    // console.log("La q es : " + ques[0].Cima_de_Cerro);
                }

                pol(q)
            }
        });
    });
}


fu_final = function(conn, req, res, vect_fact_amp, enter, SOLIC_ANT, fu) {
    var FU_tramo = [];
    var FU_trayecto = [];
    var FU_elemento = [];
    var FU_elemento2 = [];

    req.getConnection((err, conn) => {
        conn.query("SELECT * FROM fact_util_tramo WHERE hist_mc_id=? ", [req.body.id_hist_mc], (err, bdFacUtilTramo, fields) => {
            if (err) {
                console.log("Manejar el error de query en buscaalt1");
            } else {
                /// intervengo para añadir el cálculo de los trayectos
                conn.query("SELECT * FROM fact_util_trayecto WHERE hist_mc_id=? ", [req.body.id_hist_mc], (err, bdFacUtilTrayecto, fields) => {
                    if (err) {
                        console.log("Manejar el error de query en buscaalt2");
                    } else {
                        for (i = 0; i < bdFacUtilTramo.length; i++) {
                            FU_tramo.push({
                                fu_cantonero: ((bdFacUtilTramo[i].cantonero) * (vect_fact_amp[i].factor_amp_momento)).toFixed(2),
                                fu_diagonales: ((bdFacUtilTramo[i].diagonales) * (vect_fact_amp[i].factor_amp_corte)).toFixed(2),
                                fu_montantes: ((bdFacUtilTramo[i].montantes) * (vect_fact_amp[i].factor_amp_corte)).toFixed(2),
                                fu_conex_diag_pernos: ((bdFacUtilTramo[i].conex_diag_pernos) * (vect_fact_amp[i].factor_amp_corte)).toFixed(2),
                                fu_conex_diag_planchas: ((bdFacUtilTramo[i].conex_diag_planchas) * (vect_fact_amp[i].factor_amp_corte)).toFixed(2),
                                fu_conex_mont_pernos: ((bdFacUtilTramo[i].conex_mont_pernos) * (vect_fact_amp[i].factor_amp_corte)).toFixed(2),
                                fu_conex_mont_planchas: ((bdFacUtilTramo[i].conex_mont_planchas) * (vect_fact_amp[i].factor_amp_corte)).toFixed(2)
                            });
                        }

                        for (i = 0; i < bdFacUtilTrayecto.length; i++) {
                            FU_trayecto.push({
                                fu_pernos: ((bdFacUtilTrayecto[i].pernos) * (vect_fact_amp[i].factor_amp_momento)).toFixed(2),
                                fu_bridas: ((bdFacUtilTrayecto[i].bridas) * (vect_fact_amp[i].factor_amp_momento)).toFixed(2)
                            });
                        }

                        var elem = FU_tramo;
                        var comparador1 = elem[0].fu_cantonero;
                        var comparador2 = elem[0].fu_diagonales;
                        var comparador3 = elem[0].fu_montantes;
                        var comparador4 = elem[0].fu_conex_diag_pernos;
                        var comparador5 = elem[0].fu_conex_diag_planchas;
                        var comparador6 = elem[0].fu_conex_mont_pernos;
                        var comparador7 = elem[0].fu_conex_mont_planchas;

                        //// inicializando los FU trayecto
                        var elem2 = FU_trayecto;
                        var comparador11 = elem2[0].fu_pernos;
                        var comparador21 = elem2[0].fu_bridas;

                        for (i = 0; i < elem.length; i++) {
                            j = i + 1;
                            if (j < elem.length) {
                                comparador1 = Math.max(comparador1, elem[j].fu_cantonero);
                                comparador2 = Math.max(comparador2, elem[j].fu_diagonales);
                                comparador3 = Math.max(comparador3, elem[j].fu_montantes);
                                comparador4 = Math.max(comparador4, elem[j].fu_conex_diag_pernos);
                                comparador5 = Math.max(comparador5, elem[j].fu_conex_diag_planchas);
                                comparador6 = Math.max(comparador6, elem[j].fu_conex_mont_pernos);
                                comparador7 = Math.max(comparador7, elem[j].fu_conex_mont_planchas);
                            }
                        }


                        for (i = 0; i < elem2.length; i++) {
                            j = i + 1;
                            if (j < elem2.length) {
                                comparador11 = Math.max(comparador11, elem2[j].fu_pernos);
                                comparador21 = Math.max(comparador21, elem2[j].fu_bridas);

                            }
                        }

                        FU_elemento.push({
                            fu_elem_cantonero: comparador1.toFixed(2),
                            fu_elem_diagonales: comparador2.toFixed(2),
                            fu_elem_montantes: comparador3.toFixed(2),
                            fu_elem_conex_diag_pernos: comparador4.toFixed(2),
                            fu_elem_conex_diag_planchas: comparador5.toFixed(2),
                            fu_elem_conex_mont_pernos: comparador6.toFixed(2),
                            fu_elem_conex_mont_planchas: comparador7.toFixed(2)
                        });

                        FU_elemento2.push({
                            fu_elem2_pernos: comparador11.toFixed(2),
                            fu_elem2_bridas: comparador21.toFixed(2),

                        });

                        var fu_torre = Math.max(FU_elemento[0].fu_elem_cantonero, FU_elemento2[0].fu_elem2_bridas, FU_elemento2[0].fu_elem2_pernos, FU_elemento[0].fu_elem_diagonales, FU_elemento[0].fu_elem_montantes, FU_elemento[0].fu_elem_conex_diag_pernos, FU_elemento[0].fu_elem_conex_diag_planchas, FU_elemento[0].fu_elem_cantonero, FU_elemento[0].fu_elem_conex_mont_pernos, FU_elemento[0].fu_elem_conex_mont_planchas);

                        fu({
                            SOLIC_ANT: SOLIC_ANT,
                            FU_tramo: FU_tramo,
                            FU_trayecto: FU_trayecto,
                            FU_elemento: FU_elemento,
                            FU_elemento2: FU_elemento2,
                            fu_torre: (fu_torre * 100)
                        })


                    }
                });





            }
        });

    });


}



module.exports = model;
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

        //////AHORA VAMOS A GENERAR LOS FACTORES DE AMPLIFICACIÓN PARA MOMENTO Y CORTE//////

        console.log("Altura de la torre : " + SOLIC_ANT[0].altura_torre);
        // console.log("Variable de altura que actua en la fórmula  =   " + altura_torre);
        const n = altura_torre / 6; //Máxima cantidad de tramos
        // const altEstructura = altura_torre; //Altura de la estructura
        // console.log("Número de tramos desde la fórmula : " + n);

        var valorFacAmp = new Array(100);
        var alturaTopeTramo = 0; ///inicializado
        var alturaux;
        var factor = 1; //variable que tendrá el valor del momento luego del condicional de las alturas
        var factorCorte = 1;
        var k = 0;
        //                 // console.log(amounter);

        //   
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

        ////Incrustar aquí la función totalizadora final

        let pasofinal = fu_final(conn, req, res, vect_fact_amp, enter, SOLIC_ANT, (fu) => {

            ///Aquí yo debería incluir un midleware para enviar a la vista de acuerdo al perfil del usuario solicitante
            // console.log(" Persiguiendo a fu  :" + JSON.stringify(fu))
            console.log("Antes de pasarlo a la vista =" + JSON.stringify(req.body.antenasAntes));
            return res.render('resultadoAS_pruebas', {
                antenasAntes: req.body.antenasAntes,
                solicitaciones: SOLIC_ANT,
                factoresamptramos: vect_fact_amp,
                enter: enter,
                fu: fu

            });
        });


    });

    console.log("Ip que hace la solicitud : " + req.ip); ///


}


let prepara = async(conn, req, res, enter) => { ///Esta función generará los datos necesarios para enviarlos a calcAgnos

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

                    var vien = req.body.condicion_viento;
                    let arr = {
                        altura: req.body.alturaAntena1,
                        condicion_viento: req.body.condicion_viento
                    }


                    qs = buscaq(conn, req, arr, (pol) => {
                        q[0] = pol;
                        var ent1 = [alt, area[0], coef[0].coe_antena, pol];
                        ent.push({
                            n: 1,
                            altura: alt,
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
                    var vien = req.body.condicion_viento;
                    let arr = {
                        altura: req.body.alturaAntena2,
                        condicion_viento: req.body.condicion_viento
                    }

                    qs = buscaq(conn, req, arr, (pol) => {

                        var ent2 = [alt, area[1], coef[0].coe_antena, pol];
                        ent.push({
                            n: 1,
                            altura: alt,
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
                    var vien = req.body.condicion_viento;
                    let arr = {
                        altura: req.body.alturaAntena3,
                        condicion_viento: req.body.condicion_viento
                    }

                    qs = buscaq(conn, req, arr, (pol) => {

                        var ent2 = [alt, (req.body.diametro3 / 2) * (req.body.diametro3 / 2) * 3.14, coef[0].coe_antena, pol];
                        ent.push({
                            n: 1,
                            altura: alt,
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

                    var vien = req.body.condicion_viento;
                    let arr = {
                        altura: req.body.alturaAntena4,
                        condicion_viento: req.body.condicion_viento
                    }

                    qs = buscaq(conn, req, arr, (pol) => {

                        var ent3 = [alt, (req.body.diametro4 / 2) * (req.body.diametro4 / 2) * 3.14, coef[0].coe_antena, pol];
                        ent.push({
                            n: 1,
                            altura: alt,
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
                    var vien = req.body.condicion_viento;
                    let arr = {
                        altura: req.body.alturaAntena5,
                        condicion_viento: req.body.condicion_viento
                    }

                    qs = buscaq(conn, req, arr, (pol) => {

                        var ent4 = [alt, (req.body.diametro5 / 2) * (req.body.diametro5 / 2) * 3.14, coef[0].coe_antena, pol];
                        ent.push({
                            n: 1,
                            altura: alt,
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
                    var vien = req.body.condicion_viento;
                    let arr = {
                        altura: req.body.alturaAntena6,
                        condicion_viento: req.body.condicion_viento
                    }

                    qs = buscaq(conn, req, arr, (pol) => {
                        var ent5 = [alt, (req.body.diametro6 / 2) * (req.body.diametro6 / 2) * 3.14, coef[0].coe_antena, pol];
                        ent.push({
                            n: 1,
                            altura: alt,
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
                    var vien = req.body.condicion_viento;
                    let arr = {
                        altura: req.body.alturaAntena7,
                        condicion_viento: req.body.condicion_viento
                    }

                    qs = buscaq(conn, req, arr, (pol) => {
                        var ent6 = [alt, (req.body.diametro7 / 2) * (req.body.diametro7 / 2) * 3.14, coef[0].coe_antena, pol];
                        ent.push({
                            n: 1,
                            altura: alt,
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
                    var vien = req.body.condicion_viento;
                    let arr = {
                        altura: req.body.alturaAntenaSect1,
                        condicion_viento: req.body.condicion_viento
                    }

                    qs = buscaq(conn, req, arr, (pol) => {
                        var ent9 = [alt, (req.body.largo1) * (req.body.ancho1), coef[0].coe_antena, pol];
                        ent.push({
                            n: req.body.cantAntSect1,
                            altura: alt,
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
                    var vien = req.body.condicion_viento;
                    let arr = {
                        altura: req.body.alturaAntenaSect2,
                        condicion_viento: req.body.condicion_viento
                    }

                    qs = buscaq(conn, req, arr, (pol) => {
                        var ent9 = [alt, (req.body.largo1) * (req.body.ancho1), coef[0].coe_antena, pol];
                        ent.push({
                            n: req.body.cantAntSect2,
                            altura: alt,
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
                    var vien = req.body.condicion_viento;
                    let arr = {
                        altura: req.body.alturaAntenaSect3,
                        condicion_viento: req.body.condicion_viento
                    }

                    qs = buscaq(conn, req, arr, (pol) => {
                        var ent9 = [alt, (req.body.largo1) * (req.body.ancho1), coef[0].coe_antena, pol];
                        ent.push({
                            n: req.body.cantAntSect2,
                            altura: alt,
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
                    var vien = req.body.condicion_viento;
                    let arr = {
                        altura: req.body.alturaAntenaSect4,
                        condicion_viento: req.body.condicion_viento
                    }

                    qs = buscaq(conn, req, arr, (pol) => {
                        var ent9 = [alt, (req.body.largo1) * (req.body.ancho1), coef[0].coe_antena, pol];
                        ent.push({
                            n: req.body.cantAntSect4,
                            altura: alt,
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
                    var vien = req.body.condicion_viento;
                    let arr = {
                        altura: req.body.alturaAntenaSect5,
                        condicion_viento: req.body.condicion_viento
                    }

                    qs = buscaq(conn, req, arr, (pol) => {
                        var ent9 = [alt, (req.body.largo1) * (req.body.ancho1), coef[0].coe_antena, pol];
                        ent.push({
                            n: req.body.cantAntSect5,
                            altura: alt,
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
                    var vien = req.body.condicion_viento;
                    let arr = {
                        altura: req.body.alturaAntenaSect6,
                        condicion_viento: req.body.condicion_viento
                    }

                    qs = buscaq(conn, req, arr, (pol) => {
                        var ent9 = [alt, (req.body.largo1) * (req.body.ancho1), coef[0].coe_antena, pol];
                        ent.push({
                            n: req.body.cantAntSect6,
                            altura: alt,
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
                    var vien = req.body.condicion_viento;
                    let arr = {
                        altura: req.body.alturaAntenaSect7,
                        condicion_viento: req.body.condicion_viento
                    }

                    qs = buscaq(conn, req, arr, (pol) => {
                        var ent9 = [alt, (req.body.largo1) * (req.body.ancho1), coef[0].coe_antena, pol];
                        ent.push({
                            n: req.body.cantAntSect7,
                            altura: alt,
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
                /////Esta es la forma de añadir propiedades al arreglo
                let arr = {
                    altura_torre: req.body.altura_torre,
                    altura: 100,
                    condicion_viento: req.body.condicion_viento,
                    mom_basal: basales[0].mom_basal,
                    corte_basal: basales[0].corte_basal
                }

                let data_mc = {
                    fu: req.body.fu,
                    codigo: req.body.codigo,
                    id_hist_mc: req.body.id_hist_mc
                }

                console.log("Donde se arma el arr, mom_basal :" + basales[0].mom_basal);
                console.log("Donde se arma el arr, mom_basal :" + basales[0].corte_basal);
                qs = buscaq(conn, req, arr, (pol) => {
                    console.log("marca para ver los tiempos de ejecución");
                    enter({
                        ent: ent,
                        arr: arr,
                        data_mc: data_mc
                    })
                });
            }
        });
    });
}


buscaq = (conn, req, arr, pol) => {
    var q;
    var alt = Math.round(arr.altura);
    console.log("Las alturas  :" + alt);
    req.getConnection((err, conn1) => {
        conn1.query("SELECT * FROM q WHERE altura=? ", [alt], (err, ques, fields) => {
            if (err) {
                console.log("Pendiente");
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

buscaalt = function(conn, req) {
    conn1.query("SELECT id_estructura FROM index_mem_calc WHERE id_hist_mc=? ", [req.body.id_hist_mc], (err, basales, fields) => {
        if (err) {
            console.log("Manejar el error de query en buscaalt");
        }
    });

}



fu_final = function(conn, req, res, vect_fact_amp, enter, SOLIC_ANT, fu) {
    var FU_tramo = [];
    var FU_elemento = [];


    // console.log("El valor de id_hist_mc =" + req.body.id_hist_mc);

    req.getConnection((err, conn) => {
        conn.query("SELECT * FROM fact_util_tramo WHERE hist_mc_id=? ", [req.body.id_hist_mc], (err, bdFacUtilTramo, fields) => {
            if (err) {
                console.log("Manejar el error de query en buscaalt");
            } else {
                for (i = 0; i < bdFacUtilTramo.length; i++) {
                    // console.log(" Valores FacUtilTramo en " + i + "=" + bdFacUtilTramo[i].cantonero);
                    // console.log(" Valores vect_fact_amp en " + i + "=" + vect_fact_amp[i].factor_amp_momento);
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
                // console.log(" Echemosle un vistazo a FU_tramo =  " + JSON.stringify(FU_tramo));
                // console.log(" El Fu total de cantonero =  " + Math.max(FU_tramo.fu_cantonero));
                var elem = FU_tramo;

                var comparador1 = elem[0].fu_cantonero;
                var comparador2 = elem[0].fu_diagonales;
                var comparador3 = elem[0].fu_montantes;
                var comparador4 = elem[0].fu_conex_diag_pernos;
                var comparador5 = elem[0].fu_conex_diag_planchas;
                var comparador6 = elem[0].fu_conex_mont_pernos;
                var comparador7 = elem[0].fu_conex_mont_planchas;



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

                        // console.log(" Cada iteracion " + i + " = " + elem[j].fu_cantonero);
                        // console.log(" Cada iteracion " + i + " = " + comparador1);
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

                // console.log(" El mayor fu_cantonero  =" + comparador1);
                // console.log(" El mayor fu_diagonales  =" + comparador2);
                // console.log(" El mayor fu_montantes  =" + comparador3);
                // console.log(" El mayor fu_conex_diag_pernos  =" + comparador4);
                // console.log(" El mayor fu_conex_diag_planchas  =" + comparador5);
                // console.log(" El mayor fu_conex_mont_pernos  =" + comparador6);
                // console.log(" El mayor fu_conex_mont_planchas  =" + comparador7);

                var fu_torre = Math.max(FU_elemento[0].fu_elem_cantonero, FU_elemento[0].fu_elem_diagonales, FU_elemento[0].fu_elem_montantes, FU_elemento[0].fu_elem_conex_diag_pernos, FU_elemento[0].fu_elem_conex_diag_planchas, FU_elemento[0].fu_elem_cantonero, FU_elemento[0].fu_elem_conex_mont_pernos, FU_elemento[0].fu_elem_conex_mont_planchas);



                fu({
                    SOLIC_ANT: SOLIC_ANT,
                    FU_tramo: FU_tramo,
                    FU_elemento: FU_elemento,
                    fu_torre: (fu_torre * 100)
                })

            }
        });

    });


}



module.exports = model;
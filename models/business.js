const model = {};
const express = require('express');
path = require('path');
const router = require('express').Router();
morgan = require('morgan');




model.calculoAgnos = function(req, res, next) {
    var datatrans = JSON.parse(req.body.armando);


    var cuenta = datatrans.length - 1;

    // console.log("cantidad de antenas  :" + cuenta);

    let antenas = datatrans.filter(datatran => datatran.antena !== undefined);
    let datosSitio = datatrans.filter(datatran => datatran.norma !== undefined);
    // console.log("Datos sitios " + JSON.stringify(datosSitio));
    var entrada = [];
    var SOLIC_ANT = [];


    // console.log("Antes de entrar a prepara  :" + JSON.stringify(antenas));


    let sup = prepara(req, datosSitio, antenas, (enter) => {
        // console.log("Retornando de prepara");
        // console.log("Imprímase a la SALIDA DE prepara =" + JSON.stringify(enter));
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
        var SOLIC_ANT = [];


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

        let pasofinal = fu_final(req, res, vect_fact_amp, enter, SOLIC_ANT, (fu) => {


            req.getConnection((err, conn1) => {
                var CargaInicial = [];
                var sitio = [];
                var estudio = [];
                estudio[0] = enter.data_mc;
                var selector = enter.data_mc;
                sitio[0] = enter.arr;
                conn1.query("SELECT * FROM inventario WHERE hist_mc_id=? ", [selector.id_hist_mc], (err, cargin, fields) => {
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

                        // console.log("CUANDO PASE POR AQUÍ :" + JSON.stringify(CargaInicial));

                        return res.render('resultadoAS', {
                            solicitaciones: SOLIC_ANT,
                            factoresamptramos: vect_fact_amp,
                            enter: enter,
                            estudio: estudio,
                            sitio: sitio,
                            fu: fu,
                            CargaInicial: CargaInicial,
                            anio: new Date().getFullYear()
                        });
                    }


                });

            });

        });

    });


    console.log("Ip que hace la solicitud : " + req.ip); ///
}

///////////////////// PREPARA    PREPARA    PREPARA    PREPARA  //////////////////////////////


let prepara = async(req, datosSitio, antenas, enter) => { ///Esta función generará los datos necesarios para enviarlos a calcAgnos
    // console.log();

    var aqui = JSON.stringify(datosSitio);
    console.log("Entró a prepara con antenas  con datosSitio =" + aqui);

    req.getConnection((err, conn1) => {
        conn1.query("SELECT * FROM antenas ", (err, antenasBD, fields) => {

            var q = [];
            var ent = [];
            var primero = [];
            let qs;
            var descr, area1;
            var arr;
            var data_mc;

            if (err) {
                console.log("Atajamos error query antena0 ");
            } else {

                req.getConnection((err, conn1) => {
                    conn1.query("SELECT * FROM q ", (err, ques, fields) => {
                        if (err) {
                            console.log("Hay un error en consulta del q ");
                        } else {

                            arr = { ////PENDOENTE
                                altura: Number(datosSitio[0].alturaTorre),
                                altura_torre: Number(datosSitio[0].alturaTorre),
                                condicion_viento: datosSitio[0].viento,
                                mom_basal: Number(datosSitio[0].momento),
                                corte_basal: Number(datosSitio[0].corte),
                                nombre: datosSitio[0].lugar,
                                tipo: datosSitio[0].tipo

                            }
                            data_mc = {
                                fu: Number(datosSitio[0].fu).toFixed(2),
                                codigo: datosSitio[0].codigo,
                                id_hist_mc: datosSitio[0].idMC,
                                norma: datosSitio[0].norma,
                                viento: datosSitio[0].viento,
                                hielo: datosSitio[0].hielo,
                                fecha: datosSitio[0].fecha,
                            }


                            for (i = 0; i < (antenas.length); i++) {
                                // console.log("Antenas    :" + JSON.stringify(antenas));

                                descr = antenas[i].antena;
                                var alt = Math.round(antenas[i].altura);

                                for (j = 0; j < antenasBD.length; j++) {
                                    var compa = antenasBD[j].descripcion;

                                    if (compa.search(descr) === 0) {
                                        coef = antenasBD[j].coe_antena;
                                    }
                                }

                                if (descr.search("Parabólica") === 0) {
                                    area1 = (Number(antenas[i].diametro) / 2) * (Number(antenas[i].diametro) / 2) * 3.14;
                                } else {
                                    area1 = Number(antenas[i].largo) * Number(antenas[i].ancho);
                                }

                                primero.push({ /////Puede añadir un problema de sincronìa
                                    i: i,
                                    n: Number(antenas[i].cantidad),
                                    altura: Number(antenas[i].altura),
                                    descrip: descr,
                                    area: area1,
                                    coeficiente: Number(coef),
                                });
                            }
                            for (var k = 0; k < primero.length; k++) {
                                qs = buscaq(req, ques, antenas[k].altura, datosSitio[0].viento, (pol) => {

                                    primero[k].q = pol;

                                });
                            }
                            enter({
                                arr: arr,
                                ent: primero,
                                data_mc: data_mc
                            })
                        } // 
                    });
                });
            }
            // console.log("Imprime prepar  medias :" + ent);
        });
    });

    buscaq = (req, ques, alturaAnt, condVien, pol) => {
        var q;
        var querys;
        var alt = Math.round(alturaAnt);

        for (i = 0; i < ques.length; i++) {
            if (ques[i].altura === alt && condVien.indexOf("Ciudad_Cima_de_Cerro") === 0) {
                pol(ques[i].Ciudad_Cima_de_Cerro);
            }
            if (ques[i].altura === alt && condVien.indexOf("Ciudad") === 0) {
                pol(ques[i].Ciudad);
            }
            if (ques[i].altura === alt && condVien.indexOf("Campo_Abierto") === 0) {
                pol(ques[i].Campo_Abierto);
            }
            if (ques[i].altura === alt && condVien.indexOf("Cima_de_Cerro") === 0) {
                pol(ques[i].Cima_de_Cerro);
            }
        }
    }


    fu_final = function(req, res, vect_fact_amp, enter, SOLIC_ANT, fu) {
        var FU_tramo = [];
        var FU_trayecto = [];
        var FU_elemento = [];
        var FU_elemento2 = [];
        var selector = enter.data_mc;
        var FU_Anclaje = [];
        var FU_elemento3 = [];

        req.getConnection((err, conn) => {
            conn.query("SELECT * FROM fact_util_tramo WHERE hist_mc_id=? ", [selector.id_hist_mc], (err, bdFacUtilTramo, fields) => {
                if (err) {
                    console.log("Manejar el error de query en buscaalt1");
                } else {
                    /// intervengo para añadir el cálculo de los trayectos
                    conn.query("SELECT * FROM fact_util_trayecto WHERE hist_mc_id=? ", [selector.id_hist_mc], (err, bdFacUtilTrayecto, fields) => {
                        if (err) {
                            console.log("Manejar el error de query en buscaalt2");
                        } else { ///AQUI mañana miércoles 20 Miércoles 20

                            conn.query("SELECT * FROM fu_anclaje WHERE hist_mc_id=? ", [selector.id_hist_mc], (err, bdfuAnclaje, fields) => {
                                if (err) {
                                    console.log("Manejar el error de query en buscaalt3");
                                } else {
                                    for (i = 0; i < bdFacUtilTramo.length; i++) {
                                        FU_tramo.push({
                                            fu_cantonero: ((bdFacUtilTramo[i].cantonero) * (vect_fact_amp[i].factor_amp_momento)).toFixed(2),
                                            fu_diagonales: ((bdFacUtilTramo[i].diagonales) * (vect_fact_amp[i].factor_amp_corte)).toFixed(2),
                                            fu_diagonales_secundarias: ((bdFacUtilTramo[i].diag_secundaria) * (vect_fact_amp[i].factor_amp_corte)).toFixed(2),
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
                                    FU_Anclaje.push({
                                        fu_anclaje_perno: ((bdfuAnclaje[0].fu_pernos) * (vect_fact_amp[0].factor_amp_momento)).toFixed(2),
                                        fu_anclaje_placa: ((bdfuAnclaje[0].fu_base) * (vect_fact_amp[0].factor_amp_momento)).toFixed(2),

                                    });

                                    var elem = FU_tramo;
                                    var comparador1 = elem[0].fu_cantonero;
                                    var comparador2 = elem[0].fu_diagonales;
                                    var comparador3 = elem[0].fu_montantes;
                                    var comparador4 = elem[0].fu_conex_diag_pernos;
                                    var comparador5 = elem[0].fu_conex_diag_planchas;
                                    var comparador6 = elem[0].fu_conex_mont_pernos;
                                    var comparador7 = elem[0].fu_conex_mont_planchas;
                                    var comparador8 = elem[0].fu_diagonales_secundarias;
                                    console.log("///////////////");
                                    console.log(" El comparador 8 inicial : " + comparador8);
                                    console.log("///////////////");

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
                                            comparador8 = Math.max(comparador8, elem[j].fu_diagonales_secundarias);
                                        }
                                    }

                                    var comparador10 = Math.max(FU_Anclaje[0].fu_anclaje_perno, FU_Anclaje[0].fu_anclaje_placa);


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
                                        fu_elem_conex_mont_planchas: comparador7.toFixed(2),
                                        fu_elem_diagonales_secundarias: comparador8.toFixed(2),
                                    });

                                    FU_elemento2.push({
                                        fu_elem2_pernos: comparador11.toFixed(2),
                                        fu_elem2_bridas: comparador21.toFixed(2),

                                    });

                                    var fu_torre = Math.max(FU_elemento[0].fu_elem_cantonero, FU_elemento2[0].fu_elem2_bridas, FU_elemento2[0].fu_elem2_pernos, FU_elemento[0].fu_elem_diagonales, FU_elemento[0].fu_elem_montantes, FU_elemento[0].fu_elem_conex_diag_pernos, FU_elemento[0].fu_elem_conex_diag_planchas, FU_elemento[0].fu_elem_cantonero, FU_elemento[0].fu_elem_conex_mont_pernos, FU_elemento[0].fu_elem_conex_mont_planchas, FU_elemento[0].fu_elem_diagonales_secundarias, comparador10);

                                    fu_torre = fu_torre.toFixed(2);

                                    fu({
                                        SOLIC_ANT: SOLIC_ANT,
                                        FU_tramo: FU_tramo,
                                        FU_trayecto: FU_trayecto,
                                        FU_elemento: FU_elemento,
                                        FU_elemento2: FU_elemento2,
                                        fu_torre: (fu_torre * 100),
                                    })
                                }
                            });



                        }
                    });
                }
            });

        });
    }
}
module.exports = model;
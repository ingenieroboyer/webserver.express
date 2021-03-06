const express = require('express');
path = require('path');
const router = require('express').Router();
var nombre = [];
var nombre2 = [];
var nombre1 = [];
var ant = {};

var aux1;
var aux2;
var aux3;


let dashboardCliente = (req, res, band) => {

    ///Reinicio de variables, por si acaso
    nombre = [];
    nombre2 = [];
    nombre1 = [];
    req.getConnection((err, conn1) => {
        conn1.query('SELECT * FROM  estructura where geometria_id=?', [req.body.sitio], function(err, llave1) {
            if (err) {
                console.log('Consulta a tabla estructura falló con error : ' + err);
            } else {
                conn1.query('SELECT * FROM  index_mem_calc where id_hist_mc=?', [llave1[0].hist_mc_id], function(err, memoria) {
                    if (err) {
                        console.log('Consulta 2 en el hilo1 a tabla inventario falló con error : ' + err);
                    } else {
                        conn1.query('SELECT * FROM  inventario where hist_mc_id=?', [llave1[0].hist_mc_id], function(err, inventarios) {
                                if (err) {
                                    console.log('Consulta 3 en el hilo1 a tabla inventario falló con error : ' + err);

                                } else {
                                    conn1.query('SELECT * FROM  mom_total where hist_mc_id=?', [llave1[0].hist_mc_id], function(err, mom) {
                                        if (err) {
                                            console.log('Consulta 4 en el hilo1 a tabla mom_total falló con error : ' + err);

                                        } else {

                                            nombre1.push({
                                                general: {
                                                    fu: (memoria[0].fu) * 100,
                                                    altura_torre: llave1[0].altura,
                                                    hielo: memoria[0].hielo,
                                                    norma: memoria[0].norma,
                                                    viento: memoria[0].cond_viento,
                                                    fecha: memoria[0].fecha_registro,
                                                    codigo: memoria[0].codigo_estudio,
                                                    id_hist_mc: llave1[0].hist_mc_id,
                                                    nombreSitio: llave1[0].nombre,
                                                    momento_basal: mom[0].mom_basal,
                                                    corte_basal: mom[0].corte_basal,
                                                    tipo: llave1[0].tipo,
                                                }
                                            });

                                            for (var i = 0; i < inventarios.length; i++) {
                                                ant = inventarios[i].antena_id;
                                                nombre2.push({
                                                    antena: {
                                                        alto: inventarios[i].altura,
                                                        cantidad: inventarios[i].cantidad,
                                                        orientacion: inventarios[i].orientacion,
                                                        descripcion: inventarios[i].descripcion,
                                                        lugar: llave1[0].nombre
                                                    }
                                                });
                                            }

                                            nombre = { nombre1: nombre1, nombre2: nombre2 };
                                            band(null, nombre)
                                        }
                                    });





                                }
                            }

                        );





                    }
                });

            }


        })
    });

};

module.exports = {
    dashboardCliente
}
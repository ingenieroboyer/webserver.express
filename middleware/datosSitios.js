const express = require('express');
path = require('path');
const router = require('express').Router();

////////==================///////////////////////
///                                          ////
///    BUSCA LOS DATOS DE LOS SITIOS         ////
///      EN LA BASE DE DATOS                 ////
///==========================================////


var nombre2 = [];

let datosSitios = async(conn, req, org, band) => {
    console.log('Nuevamente el valor de la organizacion :' + org);
    // Aquí nos explayamos a buscar en BD


    req.getConnection((err, conn1) => {
        console.log('Ingresó a la consulta ');
        conn1.query('SELECT id FROM customer where empresa=?', [org], function(err, customers) {
            if (err) {
                console.log('Tengo un error  en  datosSitios' + err);
            } else {
                conn1.query('SELECT geometria_id FROM estructura where tipo="autosoportada"  AND customer_id=?', [customers[0].id],
                    function(err, geometria) {
                        if (err) {
                            console.log('Tengo un error  en  datosSitios2' + err);
                        } else {

                            for (var s = 0; s < geometria.length; s++) {
                                console.log(" Aquí debería haber la cantidad de sitios en estructura para el cliente =" + geometria.length);
                                // console.log(i + ') geometria_id de las estructuras que cumplen : ' + geometria[i].geometria_id);
                                conn1.query('SELECT sitio,id_geometria FROM geometria where id_geometria=?', [geometria[s].geometria_id],
                                    function(err, sitios) {
                                        if (err) {
                                            console.log('Tengo un error  en  datosSitios' + err);
                                        } else {

                                            // if (s = (geometria.length - 1)) {
                                            if (s = (geometria.length)) {
                                                nombre2.push({ lugar: sitios[0].sitio, id: sitios[0].id_geometria });

                                                console.log("El id en geometría de los sitios es = " + sitios[0].id_geometria);
                                                console.log("Los en geometría son = " + sitios[0].id_geometria);

                                            }

                                            // console.log('Revisando resultados  :' + sitios[i].sitio);

                                        }
                                    });
                                // console.log('A ver si llegué vivo al segundo query:   ' + geometria.length);
                            }
                            console.log('El contenido de nombre2 antes de enviarlo  ' + JSON.stringify(nombre2));
                            band(null, nombre2)

                        }
                    });
                console.log('El contenido de nombre2 fuera del for ' + JSON.stringify(nombre2));
            }
        });

    });





}




module.exports = {
    datosSitios //,
    // verificaAdmin_Role
}
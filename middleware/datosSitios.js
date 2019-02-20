const express = require('express');
path = require('path');
const router = require('express').Router();

////////==================///////////////////////
///                                          ////
///    BUSCA LOS DATOS DE LOS SITIOS         ////
///      EN LA BASE DE DATOS                 ////
///==========================================////


var nombre2 = [];

function datosSitios(conn, nombre, token, req, res, org) {

    // Aquí nos explayamos a buscar en BD

    req.getConnection((err, conn1) => {
        console.log('Ingresó a la consulta ');
        conn1.query('SELECT * FROM customer where empresa=?', [org], function(err, customers) {
            if (err) {
                console.log('Tengo un error  en  datosSitios' + err);
            } else {
                var llave = customers[0].id;

                conn1.query('SELECT * FROM estructura WHERE tipo="autosoportada"  AND customer_id=?', [llave],
                    function(err, geometria) {
                        if (err) {
                            console.log('Tengo un error  en  datosSitios2' + err);
                        } else {
                            for (var s = 0; s < geometria.length; s++) {
                                nombre2.push({ lugar: geometria[s].nombre, id: geometria[s].geometria_id });
                            }
                            var anio = new Date().getFullYear();
                            let band = nombre2;

                            return new Promise(resolve => {
                                setTimeout(() => {
                                    var anio = new Date().getFullYear();
                                    res.render('usuarioClient_prueba', { band, nombre, token, anio }); //falta el anio
                                    band = [0, 0, 0];

                                    resolve(band);

                                }, 2);
                            });

                        }
                    });
            }
        });
    });

}




module.exports = {
    datosSitios //,
    // verificaAdmin_Role
}
const express = require('express');
path = require('path');
const router = require('express').Router();

////////========================///////////////////////
///                                                ////
///    BUSCA EL REPOSITORIO DE ESTUDIOS            ////
///================================================////
/// nota: se debe mejorar con análisis de categoría para una versión más comercial

var analisis = [];

function estudioHistorico(req, res) {

    // Aquí nos explayamos a buscar en BD
    req.getConnection((err, conn1) => {
        console.log('Ingresó a la consulta estudioHistorico  ');
        conn1.query('SELECT * FROM index_analisis', function(err, analisisDB) {
            if (err) {
                console.log('Tengo un error  en  estudioHistorico' + err);
            } else {

                for (var s = 0; s < analisisDB.length; s++) {
                    analisis.push({
                        sitio: analisisDB[s].nombre_sitio,
                        tipo_torre: analisisDB[s].tipo_torre,
                        altura_torre: analisisDB[s].altura_torre,
                        fu_estudio: analisisDB[s].fu_estudio,
                        cond_hielo: analisisDB[s].cond_hielo,
                        cond_viento: analisisDB[s].cond_viento,
                        fecha_estudio: analisisDB[s].fecha_estudio,
                        fu_modificado: analisisDB[s].fu_modificado,
                        usuario: analisisDB[s].usuario_id,
                        fecha_analisis: analisisDB[s].usuario,
                        cod_estudio: analisisDB[s].cod_estudio
                    });
                }

                return new Promise(resolve => {
                    setTimeout(() => {
                        var anio = new Date().getFullYear();
                        // console.log(" ");
                        // console.log("Quiero ver el token :" + token);
                        // console.log(" ");
                        console.log(" Analisis :" + JSON.stringify(analisis));
                        res.render('estudiosHistorico', { analisis, anio }); //falta el anio
                        analisis = [];
                        resolve(analisis);
                    }, 2);
                });
            }
        });
    });

}


module.exports = {
    estudioHistorico //,

}
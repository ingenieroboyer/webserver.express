const express = require('express');
path = require('path');
const router = require('express').Router();
////////==================///////////////////////
///                                          ////
///    GUARDA LOS RESULTADOS DE ANALISIS     ////
///      EN LA BASE DE DATOS                 ////
///==========================================////



function guard(req, res) {
    req.getConnection((err, conn1) => {
        var mmi = JSON.parse(req.body.analisis);
        var infositio = mmi.sitios;
        var infoestudio = mmi.estudio;

        var nombre = infositio[0].nombre_sitio;
        var tipo_torre = infositio[0].tipo;
        var altura_torre = Number(infositio[0].alturaTorre);
        var hist_mc_id = Number(infoestudio[0].hist_mc_id);
        var cod_estudio = infoestudio[0].codigo;
        var fu_estudio = Number(infoestudio[0].fu);
        var fu_modificado = Number(infoestudio[0].fu_analisis);
        var fecha = infoestudio[0].fecha;

        var cond_hielo = infoestudio[0].hielo;
        var cond_viento = infoestudio[0].viento;
        var usuario_id = 2;



        // console.log(" imprimer nombre : " + nombre);
        // console.log(" imprimer tipo_torre : " + tipo_torre);
        // console.log(" imprimer altura_torre : " + altura_torre);
        // console.log(" imprimer hist_mc_id : " + hist_mc_id);
        // console.log(" imprimer cod_estudio : " + cod_estudio);
        // console.log(" imprimer fu_estudio : " + fu_estudio);
        // console.log(" imprimer fu_modificado : " + fu_modificado);

        var values = [
            [hist_mc_id, nombre, tipo_torre, altura_torre, fu_estudio, cond_hielo, cond_viento, fecha, fu_modificado, usuario_id, cod_estudio]
        ];

        console.log(" Imprimer los valores :" + JSON.stringify(values));

        var sql = "INSERT INTO index_analisis (hist_mc_id,nombre_sitio,tipo_torre,altura_torre,fu_estudio,cond_hielo,cond_viento,fecha_estudio,fu_modificado,usuario_id,cod_estudio) VALUES ?";




        conn1.query(sql, [values], function(err, respuesta) {
            if (err) {
                console.log("hay un error : " + err)

            } else {
                console.log("Sitios " + JSON.stringify(infoestudio));
            }
        });
    });


    // console.dir(req.body.analisis);

}




module.exports = {
    guard //,

}
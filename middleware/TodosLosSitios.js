const express = require('express');
path = require('path');
const router = require('express').Router();

////////==================///////////////////////
///                                          ////
///    BUSCA LOS DATOS DE LOS SITIOS         ////
///      EN LA BASE DE DATOS                 ////
///==========================================////


var nombre2 = [];
var todoslossitios = [];


function TodosLosSitios(req, res, org) {

    console.log('Ingresó a datosTodosLosSitios');

    // Aquí nos explayamos a buscar en BD

    req.getConnection((err, conn1) => {
        console.log('Ingresó a datosTodosLosSitios22');
        conn1.query('SELECT * FROM inventario ', function(err, inventarios) {
            if (err) {
                console.log('Tengo un error  en  datosSitios' + err);
            } else {

                for (var s = 0; s < inventarios.length; s++) {
                    todoslossitios.push({ descripcion: inventarios[s].descripcion, id: inventarios[s].antena_id });
                }


                return new Promise(resolve => {
                    setTimeout(() => {
                        var anio = new Date().getFullYear();
                        res.render('clasifica', { todoslossitios, anio }); //falta el anio

                        resolve(todoslossitios);

                    }, 2);
                });




            }
        });
    });


}




module.exports = {
    TodosLosSitios //,
    // verificaAdmin_Role
}
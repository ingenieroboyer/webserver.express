const fs = require("fs");
const path = require("path");
const puppeteer = require('puppeteer');
const handlebars = require("handlebars");
var pdf = require('html-pdf');
const express = require('express');
const jwt = require('jsonwebtoken');
const router = require('express').Router();


function imprime(req, res, next) {

    var armando = JSON.parse(req.body.armando);
    var memoriaCalculo = armando[0].memoriaCalculo;
    var sitiosDatos = armando[0].sitiosDatos;
    var equiposTorre = armando[0].equiposTorre;
    var instalacion = armando[0].instalacion;
    console.log("En acción : " + JSON.stringify(instalacion[2]));
    var FU = armando[0].FU;
    var nombreSitio = sitiosDatos[0].nombre;
    var tipoEstructura = sitiosDatos[0].tipo;
    var alturaEstructura = sitiosDatos[0].altura;
    var codigo = memoriaCalculo[0].codig;
    var fu_mc = memoriaCalculo[0].fu_mc;
    var hielo = memoriaCalculo[0].hielo;
    var norma = memoriaCalculo[0].norma;
    var cond_viento = memoriaCalculo[0].cond_viento;
    var fecha = memoriaCalculo[0].fecha;
    var elaboracion = new Date();
    var date = Intl.DateTimeFormat('sp-LA').format(elaboracion);
    date = date.replace("-", "/");
    date = date.replace("-", "/");
    console.log(" La fecha es :" + date);

    (async() => {

        var dataBinding = {
            nombreSitio: nombreSitio,
            tipoEstructura: tipoEstructura,
            alturaEstructura: alturaEstructura,
            codigo: codigo,
            fu_mc: fu_mc,
            hielo: hielo,
            norma: norma,
            cond_viento: cond_viento,
            fecha: fecha,
            equipTorr: equiposTorre,
            instalacion: instalacion,
            FU: FU,
            elaboracion: date,
            isWatermark: false
        }

        var templateHtml = fs.readFileSync(path.join(process.cwd(), './views/informe.hbs'), 'utf8');
        var template = handlebars.compile(templateHtml);
        var finalHtml = template(dataBinding);
        var options = {
            "format": 'A4',
            "header": {
                "height": "60px"
            },
            "footer": {
                "height": "22mm"
            },
            "base": 'file://Users/midesweb/carpeta_base/'
        };


        pdf.create(finalHtml, options).toFile('./informe.pdf', function(err, res) {
            if (err) {
                console.log(err);
            } else {
                console.log("Deja imprime.js");
                next();
            }
        });
    })();
}

module.exports = {
    imprime //,
}
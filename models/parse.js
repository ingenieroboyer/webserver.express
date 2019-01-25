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
                    altura: alt,
                    area: (req.body.largo2) * (req.body.ancho2),
                    coeficiente: coef[0].coe_antena,
                    q: pol
                });
                console.log("Arreglo ent  : " + JSON.stringify(ent));
                console.log("Arreglo ent  : " + ent.length);


            });
        }
    });
}
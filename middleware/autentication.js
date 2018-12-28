const jwt = require('jsonwebtoken');
// process.env_SEED = require('../config/config');

////////=================///////////////////////
///                                         ////
///    VERIFICAR TOKEN                      ////
///                                         ////
///=========================================////
let verificaToken = (req, res, next) => {

    let token = req.get('token');

    jwt.verify(token, 'este-es-el-seed-desarrollo', (err, decoded) => {
        if (err) {
            return res.status(401).json({
                ok: false,
                err
            });
        }
        req.usuario = decoded.usuario;
        next();
    });
    next();
    // res.json({
    //     token,
    //     mensaje: 'Exitosa validación del token, falta renderizar hacia la otra página'
    // });

};


let verificaAdmin_Role = (req, res, next) => {
    // let token = req.get('token');
    let variable = req.role;
    console.log(variable);
    if (variable === 'ADMIN_ROLE') {
        // res.json({
        //     role,
        //     mensaje: 'Exitosa validación del rol de Administrador, falta renderizar hacia la otra página'
        // });
        next();
    } else {
        res.json({
            // variable.role,
            mensaje: 'usted no tiene rol de administrador'
        });

    };



};


module.exports = {
    verificaToken,
    verificaAdmin_Role
}
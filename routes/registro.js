const router   = require('express').Router();
const mongoose = require('mongoose');
const Role     = require('../models/role');
const User     = require('../models/usuario');
const bcrypt   = require('bcrypt');
const Joi      = require('@hapi/joi');

/**
 * Objetos @hapi/joi para ejecutar validaciones correspondientes.
 */
const schemaRegister = Joi.object({
    UserName:   Joi.string().min(4).max(12).required(),
    PassUser:   Joi.string().min(8).max(512).required(),
    Email:      Joi.string().min(4).max(256).required().email(),
    Telephone:  Joi.string().min(8).max(32).required(),
    FName_User: Joi.string().min(4).max(256).required(),
    LName_User: Joi.string().min(4).max(256).required(),
    Rel_Rol:    Joi.string().min(4).max(512).required(),
    Rel_State:  Joi.boolean().required(),
});

/**
 * controlador del enrutamiento de los datos POST de la pagina de
 * /registro
 */
router.post('/', async(req,res) => {
    /**
     * Validacion de datos requeridos del usuario a Registrar
     */
    const {error} = schemaRegister.validate(req.body);
    if (error) {
        return res.status(400).json(
            {error: error.details[0].message}
        )
    }

    /**
     * Validacion de Usuario Existente en Base de Datos
     */
    const isUserExist = await User.findOne({ UserName: req.body.UserName });
    if (isUserExist) {
        return res.status(400).json(
            {error: true, message: 'Este Usuario ya ha sido registrado con anterioridad'}
        )
    }
    /**
     * Validacion de Email Existente en Base de Datos
     */
    const isEmailExist = await User.findOne({ Email: req.body.Email });
    if (isEmailExist) {
        return res.status(400).json(
            {error: true, message: 'Este Email ya ha sido registrado con anterioridad'}
        )
    }

    /**
     * Encriptacion de Contraseñas de Usuarios
     */
    const salt = await bcrypt.genSalt(10);
    const pass = await bcrypt.hash(req.body.PassUser, salt);

    const user = new User({
        UserName: req.body.UserName,
        PassUser: pass,
        Email: req.body.Email,
        Telephone: req.body.Telephone,
        FName_User: req.body.FName_User,
        LName_User: req.body.LName_User,
        Rel_Rol: req.body.Rel_Rol,
        Rel_State: req.body.Rel_State,
        Fecha_Creacion: req.body.Fecha_Creacion
    })
    try{
        const userDB = await user.save();
        res.json({
            error: null,
            data: userDB
        })
    } catch (error){
        res.status(400).json(error);
    }
})

module.exports = router;
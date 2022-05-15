const router   = require('express').Router();
const mongoose = require('mongoose');
const Role     = require('../models/role');
const User     = require('../models/usuario');
const bcrypt   = require('bcrypt');
const Joi      = require('@hapi/joi');
const jwt      = require('jsonwebtoken');

const schemaLogin = Joi.object({
    UserName:   Joi.string().min(4).max(12),
    PassUser:   Joi.string().min(8).max(512).required(),
    Email:      Joi.string().min(4).max(256).email(),
    Telephone:  Joi.string().min(8).max(32),
    Rel_State:  Joi.boolean(),
    Rel_Rol:    Joi.string()
});

/**
 * Controlador del enrutamiento de los datos POST de la pagina de
 * /ingresar
 */
router.post('/ingresar', async(req,res) => {
    /**
     * Validacion de datos requeridos del usuario a Ingresar
     */
    const { error } = schemaLogin.validate(req.body);
    if (error) return res.status(400).json({ error: true, message: error.details[0].message });
    
    const user = await User.findOne({ UserName: req.body.UserName });
    if (!user) return res.status(400).json({ error: true, message: 'Este Usuario no ha sido encontrado...' });

    if(user){
        //Validacion de estado del usuario
        const stateTrue  = await User.findOne({ UserName: req.body.UserName },{ Rel_State: true });
        if (stateTrue.Rel_State) {
            //validacion de Hash de Password
            const validPassword = await bcrypt.compare(req.body.PassUser, user.PassUser);
            if (!validPassword) return res.status(400).json({ error: true, message: 'Credenciales No Coinciden...' });
            /**
             * Relaciones con otras colecciones
             */
            /**
             * Usuarios => Roles
             */
            const rol_user = await Role.findById({_id: mongoose.Types.ObjectId(user.Rel_Rol)}, {Rol: 1});
            const token = jwt.sign({
                user_name: user.UserName,
                status_user: user.Rel_State,
                rol: rol_user.Rol,
                id: user._id
            }, process.env.TOKEN_SECRET)
            res.header('auth-token', token).json({
                error: null,
                data: {token}
            })
        } else {
            return res.status(400).json({ 
                error: true, 
                message: "El usuario ha sido Desactivado por un Administrador..."
            });
        }
    }
});

module.exports = router;
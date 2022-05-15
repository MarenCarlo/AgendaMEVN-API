const router   = require('express').Router();
const mongoose = require('mongoose');
const User     = require('../models/usuario');
const Empresa  = require('../models/empresa');
const Cargo    = require('../models/cargo');
const Contacts = require('../models/contacto');
const bcrypt   = require('bcrypt');
const Joi      = require('@hapi/joi');

const schemaAddContact = Joi.object({
    _id:           Joi.string().max(32).optional().allow(null).allow('').empty(''),
    FN_Contact:    Joi.string().min(4).max(256).required(),
    LN_Contact:    Joi.string().min(4).max(256).required(),
    Rel_Empresa:   Joi.string().min(8).max(512).required(),
    Rel_Cargo:     Joi.string().min(8).max(512).required(),
    Email:         Joi.string().min(4).max(256).required().email(),
    Pri_Telephone: Joi.string().min(8).max(32).required(),
    Alt_Telephone: Joi.string().max(32).optional().allow(null).allow('').empty(''),
    Rel_Contacto_De_Usuario: Joi.string().min(8),
    Descripcion:   Joi.string().min(4).max(1024).required(),
});

//buscar sobre como hacer un iterador asincrono
router.get('/', async(req, res) => {
    const idUser = req.user.id;
    const rolUser = req.user.rol;
    if(rolUser != "Administrador"){
        const Contactos = 
            await Contacts.find({Rel_Contacto_De_Usuario: idUser})
            .populate({ path: 'Rel_Empresa', model: 'Empresa' })
            .populate({ path: 'Rel_Cargo', model: 'Cargo' })
            .populate({ path: 'Rel_Contacto_De_Usuario', model: 'User' })
            .sort({FN_Contact: 1});
        const NContactos = await Contacts.countDocuments({Rel_Contacto_De_Usuario: idUser})
        return res.status(200).json({
            data: {
                Contactos,
                NContactos
            } 
        })
    } else {
        const Contactos = 
            await Contacts.find()
            .populate({ path: 'Rel_Empresa', model: 'Empresa' })
            .populate({ path: 'Rel_Cargo', model: 'Cargo' })
            .populate({ path: 'Rel_Contacto_De_Usuario', model: 'User' })
            .sort({FN_Contact: 1});
        const NContactos = await Contacts.countDocuments()
        return res.status(200).json({
            data: {
                Contactos,
                NContactos
            } 
        })
    }
})

router.get('/:id', async(req, res) => {
    const idUser = req.params.id;
    const Contacto = 
        await Contacts.find({_id: idUser})
        .populate({ path: 'Rel_Empresa', model: 'Empresa' })
        .populate({ path: 'Rel_Cargo', model: 'Cargo' })
    return res.status(200).json({
        data: {
            Contacto
        } 
    })
})

router.post('/agregar_contacto', async(req, res) => {
    const idUser = req.user.id;
    const {error} = schemaAddContact.validate(req.body);
    if (error) {
        return res.status(400).json(
            {message: error.details[0].message}
        )
    }
    /**
     * Validacion de Contacto Existente en Base de Datos
     */
    const isPri_TelExist = await Contacts.findOne({ Pri_Telephone: req.body.Pri_Telephone });
    const isAlt_TelExist = await Contacts.findOne({ Alt_Telephone: req.body.Alt_Telephone });
    const isEmailExist   = await Contacts.findOne({ Email: req.body.Email });
    if(isPri_TelExist || isAlt_TelExist || isEmailExist){
        return res.status(400).json({
            error: true, 
            message: 'Este Contacto ya ha sido registrado con anterioridad'
        })
    }
    const contact = new Contacts({
        FN_Contact: req.body.FN_Contact,
        LN_Contact: req.body.LN_Contact,
        Rel_Empresa: req.body.Rel_Empresa,
        Rel_Cargo: req.body.Rel_Cargo,
        Email: req.body.Email,
        Pri_Telephone: req.body.Pri_Telephone,
        Alt_Telephone: req.body.Alt_Telephone,
        Rel_Contacto_De_Usuario: idUser,
        Descripcion: req.body.Descripcion
    })
    try{
        const contactDB = await contact.save();
        res.status(200).json({
            error: null,
            data: contactDB
        })
    } catch (error){
        res.status(400).json(error);
    }
});

router.put('/editar_contacto/:id', async(req, res) => {
    const {id} = req.params;
    const {error} = schemaAddContact.validate(req.body);
    if (error) {
        return res.status(400).json(
            {message: error.details[0].message}
        )
    }
    const contactData = await Contacts.findOne({ _id: mongoose.Types.ObjectId(id)})
    if (contactData) {
        contactData.FN_Contact              = req.body.FN_Contact;
        contactData.LN_Contact              = req.body.LN_Contact;
        contactData.Rel_Empresa             = req.body.Rel_Empresa;
        contactData.Rel_Cargo               = req.body.Rel_Cargo;
        contactData.Email                   = req.body.Email;
        contactData.Pri_Telephone           = req.body.Pri_Telephone;
        contactData.Alt_Telephone           = req.body.Alt_Telephone;
        contactData.Descripcion             = req.body.Descripcion;
        contactData.Rel_Contacto_De_Usuario = req.body.Rel_Contacto_De_Usuario;
        try{
            const result = await contactData.save();
            res.status(200).json({
                error: null,
                data: result
            })
        } catch (error){
            res.status(400).json(error);
        }
    } else {
        return res.status(400).json({
            error: true, 
            message: 'Este Contacto no se encontro en la BD...'
        })
    }
})

router.delete('/eliminar_contacto/:idContact', async(req, res) => {
    const {idContact} = req.params;
    const idUser      = req.user.id;
    const contactData = await Contacts.findOne({ _id: mongoose.Types.ObjectId(idContact)})
    if(contactData){
        const User1 = await User.findOne({ _id: mongoose.Types.ObjectId(idUser) });
        if(User1){
            const validPassword = await bcrypt.compare(req.body.PassUser, User1.PassUser);
            if (!validPassword){
                return res.status(400).json({ 
                    error: true, 
                    message: 'Su Contraseña es incorrecta...' 
                });
            } else{
                const result = await Contacts.deleteOne({ _id: mongoose.Types.ObjectId(idContact)});
                res.status(200).json({
                    error: null,
                    data: result
                })
            }
        } else {
            return res.status(400).json({
                error: true, 
                message: 'Este Usuario no se encontro en la BD...'
            })
        }
    } else {
        return res.status(400).json({
            error: true, 
            message: 'Este Contacto no se encontro en la BD...'
        })
    }
})

module.exports = router
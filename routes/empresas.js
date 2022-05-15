const router   = require('express').Router();
const mongoose = require('mongoose');
const User     = require('../models/usuario');
const Empresa  = require('../models/empresa');
const Cargo    = require('../models/cargo');
const Contacts = require('../models/contacto');
const bcrypt   = require('bcrypt');
const Joi      = require('@hapi/joi');

const schemaAddEnterprise = Joi.object({
    _id:         Joi.string().max(32).optional().allow(null).allow('').empty(''),
    Nombre:      Joi.string().min(4).max(256).required(),
    Email:       Joi.string().min(4).max(256).required().email(),
    Telephone:   Joi.string().min(4).max(64).required(),
    Direccion:   Joi.string().min(4).max(1024).required(),
    Descripcion: Joi.string().min(4).max(1024).required(),
});

//buscar sobre como hacer un iterador asincrono
router.get('/', async(req, res) => {
    const Empresas = await Empresa.find().sort({Nombre: 1});
    const NEmpresas = await Empresa.countDocuments()
    return res.status(200).json({
        data: {
            Empresas,
            NEmpresas
        } 
    })
})

router.get('/:id', async(req, res) => {
    const idEnterprise = req.params.id;
    const Empresas = await Empresa.find({_id: idEnterprise});
    return res.status(200).json({
        data: {
            Empresas
        } 
    })
})

router.post('/agregar_empresa', async(req, res) => {
    const {error} = schemaAddEnterprise.validate(req.body);
    if (error) {
        return res.status(400).json(
            {message: error.details[0].message}
        )
    }
    /**
     * Validacion de Contacto Existente en Base de Datos
     */
    const isTelephoneExist = await Empresa.findOne({ Telephone: req.body.Telephone });
    const isDireccionExist = await Empresa.findOne({ Direccion: req.body.Direccion });
    const isEmailExist     = await Empresa.findOne({ Email: req.body.Email });

    if(isTelephoneExist || isDireccionExist || isEmailExist){
        return res.status(400).json({
            error: true, 
            message: 'Esta Empresa ya ha sido registrada con anterioridad'
        })
    }
    const enterprise = new Empresa({
        Nombre: req.body.Nombre,
        Email: req.body.Email,
        Telephone: req.body.Telephone,
        Direccion: req.body.Direccion,
        Descripcion: req.body.Descripcion
    })
    try{
        const enterpriseDB = await enterprise.save();
        res.status(200).json({
            error: null,
            data: enterpriseDB
        })
    } catch (error){
        res.status(400).json(error);
    }
})

router.put('/editar_empresa/:id', async(req, res) => {
    const {id} = req.params;
    const {error} = schemaAddEnterprise.validate(req.body);
    if (error) {
        return res.status(400).json(
            {message: error.details[0].message}
        )
    }
    const contactData = await Empresa.findOne({ _id: mongoose.Types.ObjectId(id)})
    if (contactData) {
        contactData.Nombre      = req.body.Nombre;
        contactData.Email       = req.body.Email;
        contactData.Telephone   = req.body.Telephone;
        contactData.Direccion   = req.body.Direccion;
        contactData.Descripcion = req.body.Descripcion;
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
            message: 'Esta Empresa no se encontro en la BD...'
        })
    }
})

router.delete('/eliminar_contacto/:idEnterprise', async(req, res) => {
    const {idEnterprise} = req.params;
    const idUser         = req.user.id;
    const enterpriseData = await Empresa.findOne({ _id: mongoose.Types.ObjectId(idEnterprise)});
    if(enterpriseData){
        const User1 = await User.findOne({ _id: mongoose.Types.ObjectId(idUser) });
        if(User1){
            const validPassword = await bcrypt.compare(req.body.PassUser, User1.PassUser);
            if (!validPassword){
                return res.status(400).json({ 
                    error: true, 
                    message: 'Su Contraseña es incorrecta...' 
                });
            } else{
                const User2 = await Contacts.countDocuments({Rel_Empresa: idEnterprise});
                if(User2){
                    return res.status(400).json({
                        error: true, 
                        message: 'Hay '+User2+' Contactos vinculados a esta empresa, procure eliminarlos antes de intentar eliminar la empresa'
                    })
                } else {
                    const result = await Empresa.deleteOne({ _id: mongoose.Types.ObjectId(idEnterprise)});
                    res.status(200).json({
                        error: null,
                        data: result
                    })
                }
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
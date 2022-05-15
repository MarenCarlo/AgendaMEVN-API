const router   = require('express').Router();
const mongoose = require('mongoose');
const User     = require('../models/usuario');
const Empresa  = require('../models/empresa');
const Cargo    = require('../models/cargo');
const Contacts = require('../models/contacto');
const Joi      = require('@hapi/joi');

const schemaAddCargo = Joi.object({
    Nombre:      Joi.string().min(4).max(256).required(),
    Descripcion: Joi.string().min(4).max(1024).required(),
});

//buscar sobre como hacer un iterador asincrono
router.get('/', async(req, res) => {
    const Cargos = await Cargo.find().sort({Nombre: 1});
    return res.status(200).json({
        data: {
            Cargos
        } 
    })
})

router.post('/agregar_cargo', async(req, res) => {
    const {error} = schemaAddCargo.validate(req.body);
    if (error) {
        return res.status(400).json(
            {message: error.details[0].message}
        )
    }
    /**
     * Validacion de Contacto Existente en Base de Datos
     */
    const isCargoExist = await Cargo.findOne({ Nombre: req.body.Nombre });
    if(isCargoExist){
        return res.status(400).json({
            error: true, 
            message: 'Este Cargo ya ha sido registrado con anterioridad'
        })
    }
    const Cargs = new Cargo({
        Nombre: req.body.Nombre,
        Descripcion: req.body.Descripcion
    })
    try{
        const CargsDB = await Cargs.save();
        res.status(200).json({
            error: null,
            data: CargsDB
        })
    } catch (error){
        res.status(400).json(error);
    }
})

module.exports = router
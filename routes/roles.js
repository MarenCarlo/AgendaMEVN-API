const router   = require('express').Router();
const mongoose = require('mongoose');
const Role     = require('../models/role');

//buscar sobre como hacer un iterador asincrono
router.get('/', async(req, res) => {
    const Roles = await Role.find().sort({Rol: 1});
    return res.status(200).json({
        data: {
            Roles
        } 
    })
})

module.exports = router;
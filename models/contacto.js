const mongoose = require('mongoose');
const Empresa  = require('../models/empresa');
const Cargo    = require('../models/cargo');
const User     = require('../models/usuario');
const Schema   = mongoose.Schema;

const contactSchema = new Schema({
    FN_Contact: String,
    LN_Contact: String,
    Rel_Empresa: {type: Schema.ObjectId, ref: 'Empresa'},
    Rel_Cargo: {type: Schema.ObjectId, ref: 'Cargo'},
    Email: String,
    Pri_Telephone: String,
    Alt_Telephone: String,
    Rel_Contacto_De_Usuario: {type: Schema.ObjectId, ref: 'User'},
    Descripcion: String
});

module.exports = mongoose.model('Contacts', contactSchema);
const mongoose = require('mongoose');
const Schema   = mongoose.Schema;

const cargoSchema = new Schema({
    Nombre: String,
    Descripcion: String
});

module.exports = mongoose.model('Cargo', cargoSchema);
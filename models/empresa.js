const mongoose = require('mongoose');
const Schema   = mongoose.Schema;

const empresaSchema = new Schema({
    Nombre: String,
    Email: String,
    Telephone: String,
    Direccion: String,
    Descripcion: String
});

module.exports = mongoose.model('Empresa', empresaSchema);
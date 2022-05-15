const mongoose = require('mongoose');
const Schema   = mongoose.Schema;

const rolSchema = new Schema({
    Rol: String
});

module.exports = mongoose.model('Role', rolSchema);
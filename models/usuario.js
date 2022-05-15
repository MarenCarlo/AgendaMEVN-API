const mongoose = require('mongoose');
const Schema   = mongoose.Schema;

const userSchema = new Schema({
    UserName: {
        type: String,
        required: true,
        min: 4,
        max: 12
    },
    PassUser: {
        type: String,
        required: true,
        min: 8,
        max: 256
    },
    Email: {
        type: String,
        required: true,
        min: 4,
        max: 256
    },
    Telephone: {
        type: String,
        required: true,
        min: 8,
        max: 32
    },
    FName_User: {
        type: String,
        required: true,
        min: 4,
        max: 256
    },
    LName_User: {
        type: String,
        required: true,
        min: 4,
        max: 256
    },
    Rel_Rol: {
        type: String
    },
    Rel_State: {
        type: Boolean
    },
    Fecha_Creacion: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('User', userSchema);
const express = require('express');
const mongoose = require('mongoose');
const bodyparser = require('body-parser');
const app = express();
require('dotenv').config();

/**
 * Configuracion CORS
 */
const cors = require('cors');
var corsOptions = {
    origin: '*', // Reemplazar con dominio
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}
app.use(cors(corsOptions));

/**
 * Captura de Body
 */
app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());

/**
 * Conexion a servidor de Base de Datos
 */
//const uri = `mongodb://localhost:27017/?readPreference=primary&appname=MongoDB%20Compass&ssl=false${process.env.DBNAME}`
const uri = `mongodb+srv://${process.env.USER}:${process.env.PASSWORD}@cluster0.knjgw.mongodb.net/${process.env.DBNAME}?retryWrites=true&w=majority`;
const options = { useNewUrlParser: true, useUnifiedTopology: true }
mongoose.connect(uri, options)
.then(() => console.log(`${process.env.APP} ha logrado establecer comunicacion exitosamente con: ${process.env.DBNAME}DB.`))
.catch(e => console.log('error db:', e))

/**
 * Importacion de Rutas
 */
const verifyToken   = require('./routes/validate-token');
const authRoutes    = require('./routes/auth');
const registerRoute = require('./routes/registro');
const menuRoute     = require('./routes/menu');
const contactRoute  = require('./routes/contactos');
const empresaRoute  = require('./routes/empresas');
const cargoRoute    = require('./routes/cargos');
const rolesRoute    = require('./routes/roles');

/**
 * Uso de Middlewares
 */
app.use('/api/usuario', authRoutes);

/**
 * siempre debe ir verifyToken, antes de las rutas que necesitemos proteger
 * ya que esto es para que valide si nuestro JWT es el correcto y asi evitar
 * el secuestro de sesiones o ingresos no validados.
 */
app.use('/api/menu', verifyToken, menuRoute);
app.use('/api/contactos', verifyToken, contactRoute);
app.use('/api/empresas', verifyToken, empresaRoute);
app.use('/api/cargos', verifyToken, cargoRoute);
app.use('/api/roles', verifyToken, rolesRoute);
app.use('/api/registrar', verifyToken, registerRoute);

app.get('/', (req, res) => {
    res.json({
        estado: true,
        mensaje: 'Bienvenido a PromediaAPI.'
    })
});

/**
 * Iniciar Server
 */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`${process.env.APP} funcionando exitosamente en el puerto: ${PORT}.`)
})
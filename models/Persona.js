const mongoose = require('mongoose')

const PersonaSchema = new mongoose.Schema(
    {
        nome: { type: String, unique: true },
        cognome: String,
        password: String,
        corso1: String
    }
)

const Persona = mongoose.model('Persona', PersonaSchema)
module.exports = Persona;
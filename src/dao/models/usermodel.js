const mongoose = require('mongoose');

const usuariosEsquema = new mongoose.Schema(
    {
        first_name: String,
        last_name: String,
        email: { type: String, unique: true },
        age: Number,
        password: String,
        cart: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Cart',
        },
        role: { type: String, default: 'user' },
    },
);

const usuariosModelo = mongoose.model('sessions', usuariosEsquema);
module.exports = usuariosModelo;
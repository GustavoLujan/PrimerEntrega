const express = require('express');
const router = express.Router();
const crypto = require('crypto');

const usuariosModelo = require('../dao/models/usermodel.js');

module.exports = function (io) {
    router.post('/login', async (req, res) => {
        try {
            const { email, password } = req.body;
    
            if (!email || !password) {
                return res.redirect('/login?error=Complete todos los datos');
            }
    
            let usuario;
    

            if (email === 'adminCoder@coder.com' && password === 'adminCod3r123') {
                usuario = {
                    nombre: 'Admin',
                    apellido: 'Coder',
                    email: 'adminCoder@coder.com',
                    admin: true,
                };
            } else {

                usuario = await usuariosModelo.findOne({ email });
    
                if (!usuario) {
                    console.log('Usuario no encontrado');
                    return res.redirect(`/login?error=credenciales incorrectas`);
                }

                const hashedPassword = crypto.createHmac("sha256", "codercoder123").update(password).digest("hex");
                const match = (hashedPassword === usuario.password);

                if (!match) {
                    console.log('Contraseña incorrecta');
                    return res.redirect(`/login?error=credenciales incorrectas`);
                }
            }
    
            req.session.usuario = {
                nombre: usuario.nombre,
                apellido: usuario.apellido,
                edad: usuario.edad,
                email: usuario.email,
                admin: usuario.admin || false,
            };
    
            res.redirect('/views/products');
        } catch (error) {
            console.error('Error al procesar el login:', error);
            res.redirect(`/login?error=Error interno al procesar el login: ${error.message}`);
        }
    });
    

    router.post('/registrate', async (req, res) => {

        let { nombre, apellido, email, password, edad } = req.body
        if (!nombre || !apellido || !edad || !email || !password) {
            return res.redirect('/registrate?error=Complete todos los datos')
        }

        let regMail = /^(([^<>()\[\]\\.,;:\s@”]+(\.[^<>()\[\]\\.,;:\s@”]+)*)|(“.+”))@((\[[0–9]{1,3}\.[0–9]{1,3}\.[0–9]{1,3}\.[0–9]{1,3}])|(([a-zA-Z\-0–9]+\.)+[a-zA-Z]{2,}))$/
        console.log(regMail.test(email))
        if (!regMail.test(email)) {
            return res.redirect('/registrate?error=Mail con formato incorrecto...!!!')
        }

        let existe = await usuariosModelo.findOne({ email })
        if (existe) {
            return res.redirect(`/registrate?error=Existen usuarios con email ${email} en la BD`)
        }

        password = crypto.createHmac("sha256", "codercoder123").update(password).digest("hex")
        let usuario
        try {
            usuario = await usuariosModelo.create({ nombre, apellido, email, password, edad })
            res.redirect(`/login?mensaje=Usuario ${email} registrado correctamente`)

        } catch (error) {
            res.redirect('/registrate?error=Error inesperado. Reintente en unos minutos')
        }

    })

    router.get('/logout', (req, res) => {

        req.session.destroy(error => {
            if (error) {
                res.redirect('/login?error=fallo en el logout')
            }
        })

        res.redirect('/login')

    });

    return router;
}
const express = require('express');
const router = express.Router();
const passport = require('passport')


module.exports = function (io) {

    router.get('/errorLogin',(req,res)=>{
        return res.redirect('/login?error=Error en el proceso de login... :(')
    })

    router.post('/login', passport.authenticate('login',{failureRedirect:'/api/sessions/errorLogin'}), async (req, res) => {
        req.session.isAuthenticated = true;
        console.log(req.user)
    
        req.session.usuario = {
            nombre: req.user.nombre,
            apellido: req.user.apellido,
            edad: req.user.edad,
            email: req.user.email,
            admin: req.user.admin || false,
        };
    
        res.redirect('/views/products')
    });
    

    router.get('/errorRegistrate',(req,res)=>{
        return res.redirect('/registro?error=Error en el proceso de registro')
    })

    router.post('/registrate', passport.authenticate('registrate', {failureRedirect:'/api/sessions/errorRegistrate'}), async (req, res) => {

        let { email } = req.body
        res.redirect(`/login?mensaje=Usuario ${email} registrado correctamente`)
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
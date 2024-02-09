const express = require('express');
const router = express.Router();
const passport = require('passport')

module.exports = function (io) {
    router.get('/github', passport.authenticate('github', {}), (req, res) => { })

    router.get('/callbackGithub', passport.authenticate('github', { failureRedirect: "/api/github/errorGithub" }), (req, res) => {
        req.session.isAuthenticated = true;
        console.log(req.user)
        req.session.usuario = {
            cartID: req.user.cart.toString(),
            first_name: req.user.first_name,
            email: req.user.email,
            role: req.user.role || 'user',
        };
        res.redirect('/views/products')

    });

    router.get('/current', (req, res) => {
        if (req.session.isAuthenticated) {
            return res.status(200).json({
                user: req.session.usuario
            });
        } else {
            return res.status(401).json({
                error: 'No hay usuario autenticado'
            });
        }
    });

    router.get('/errorGithub', (req, res) => {

        res.setHeader('Content-Type', 'application/json');
        res.status(200).json({
            error: "Error al autenticar con Github"
        });
    });

    return router;
}
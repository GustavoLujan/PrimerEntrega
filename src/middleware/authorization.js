function isAdmin(req, res, next) {
    const usuario = req.session.usuario;
    if (usuario && usuario.role === 'admin') {
        next(); 
    } else {
        res.status(403).json({ error: 'Solo puede acceder el usuario con rol ADMIN.' });
    }
}

function isUser(req, res, next) {
    const usuario = req.session.usuario;
    if (usuario && usuario.role === 'user') {
        next();
    } else {
        res.status(403).json({ error: 'Solo pueden acceder los usuario con rol USER.' });
    }
}

function redirectToHomeIfAdmin(req, res, next) {
    const usuario = req.session.usuario;
    if (usuario && usuario.role === 'admin') {
        return res.status(200).render('home', { error: 'Solo pueden acceder los usuario con rol USER.', errorColor: 'red' });
    }
    next();
}

function redirectToHomeIfUser(req, res, next) {
    const usuario = req.session.usuario;
    if (usuario && usuario.role === 'user') {
        return res.status(200).render('home', { error: 'Solo puede acceder el usuario con rol ADMIN.', errorColor: 'red' });
    }
    next();
}

module.exports = { isAdmin, isUser, redirectToHomeIfAdmin, redirectToHomeIfUser };
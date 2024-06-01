const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');
const upload = require('../utils/multer');
const { isAdmin } = require('../middleware/authorization');

module.exports = function (io) {
    router.post('/premium/:uid', isAdmin,  UserController.changeUserRole);
    router.get('/', isAdmin, UserController.getAllUsers);
    router.delete('/inactive', isAdmin, UserController.clearInactiveUsers);
    router.delete('/:uid', isAdmin, UserController.deleteUser);

    router.post('/:uid/documents', upload.fields([
        { name: 'documents',},
        { name: 'profile',},
        { name: 'products',}, 
        { name: 'comprobante de domicilio',}, 
        { name: 'comprobante de estado de cuenta',}, 
        { name: 'identificacion',},  
    ]), UserController.uploadDocuments);

    return router;
}
const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { isAdmin } = require('../middleware/authorization');

module.exports = function (io) {
    router.get('/', productController.getProducts);
    router.post('/', isAdmin, productController.addProduct);
    router.put('/:id', isAdmin, productController.updateProduct);
    router.get('/:id', productController.getProductById);
    router.delete('/:id', isAdmin, productController.deleteProduct);

    return router;
}
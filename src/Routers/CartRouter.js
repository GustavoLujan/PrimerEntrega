const express = require('express');
const router = express.Router();
const CartDao = require('../dao/cartDao');
const ProductDao = require('../dao/productDao');

module.exports = function (io) {
    router.post('/', async (req, res) => {
        try {
            const cart = await CartDao.createCart();
            res.status(201).json({ cart });
        } catch (error) {
            console.error('Error al crear un carrito:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    });

    router.get('/:cid', async (req, res) => {
        const cid = req.params.cid;
        try {
            const cart = await CartDao.getCartById(cid);
            if (cart) {
                res.status(200).json({ cart });
            } else {
                res.status(404).json({ error: 'Carrito no encontrado' });
            }
        } catch (error) {
            console.error(`Error al obtener el carrito con ID ${cid}:`, error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    });

    router.post('/:cid/product', async (req, res) => {
        const cid = req.params.cid;
        const { productId, quantity } = req.body;

        try {
            const cart = await CartDao.getCartById(cid);

            if (!cart) {
                return res.status(404).json({ error: 'Carrito no encontrado' });
            }

            await CartDao.addProductToCart(cid, productId, quantity);

            const updatedCart = await CartDao.getCartById(cid);
            io.emit('updateCart', updatedCart);

            res.status(201).json({ message: 'Producto agregado al carrito' });
        } catch (error) {
            console.error(`Error al agregar un producto al carrito con ID ${cid}:`, error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    });

    router.post('/:cid/product/:pid', async (req, res) => {
        const cid = req.params.cid;
        const pid = req.params.pid;
    
        try {
            const cart = await CartDao.getCartById(cid);
    
            if (!cart) {
                return res.status(404).json({ error: 'Carrito no encontrado' });
            }
    
            const existingProductIndex = cart.products.findIndex(product => product.product === pid);
    
            if (existingProductIndex !== -1) {
                cart.products[existingProductIndex].quantity += 1;
            } else {
                const newProduct = { product: pid, quantity: 1 };
                cart.products.push(newProduct);
            }
    
            await cart.save();
    
            const products = await ProductDao.getProducts();
            io.emit('updateProducts', products);
    
            res.status(201).json({ message: 'Producto agregado al carrito' });
        } catch (error) {
            console.error(`Error al agregar un producto al carrito con ID ${cid}:`, error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    });

    return router;
};
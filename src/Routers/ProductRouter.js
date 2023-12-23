const express = require('express');
const router = express.Router();
const ProductManager = require('../Classes/ProductManager');

const pm = new ProductManager("./JSON/productos.json");

router.get('/', async (req, res) => {
    let products = await pm.getProducts()

    let productLimits = req.query.limit
        if (productLimits) {
            productLimits = parseInt(productLimits, 10)
            if (isNaN (productLimits)){
                return res.send('<h1 style="color:red">Error, ingrese al limit un valor numerico</h1>')
            }
        }

        if (productLimits) {
            products = products.slice(0, productLimits)
        }

        res.setHeader('Content-Type','application/json');
        res.status(200).json({filtros: req.query, products });
});

router.post('/', (req, res) => {
    const { title, description, code, price, stock, category, thumbnails } = req.body;

    if (typeof title !== 'string' || title.trim() === '') {
        return res.status(400).json({ error: 'No se permite el campo vacío en title' });
    }

    if (typeof description !== 'string' || description.trim() === '') {
        return res.status(400).json({ error: 'No se permite el campo vacío en description' });
    }

    if (typeof code !== 'string' || code.trim() === '') {
        return res.status(400).json({ error: 'No se permite el campo vacío en code' });
    }

    if (typeof price !== 'number' || isNaN(price) || price <= 0) {
        return res.status(400).json({ error: 'Solo se permiten números positivos en price' });
    }

    if (typeof stock !== 'number' || isNaN(stock) || stock < 0) {
        return res.status(400).json({ error: 'Solo se permiten números positivos en stock' });
    }

    if (typeof category !== 'string' || category.trim() === '') {
        return res.status(400).json({ error: 'No se permite el campo vacío en category' });
    }

    if (!Array.isArray(thumbnails) || !thumbnails.every(url => typeof url === 'string')) {
        return res.status(400).json({ error: 'thumbnails solo permite URL dentro de un array de cadenas' });
    }

    pm.addProduct(title, description, code, price, true, stock, category, thumbnails);

    res.status(201).json({ message: 'Producto agregado exitosamente' });
});

router.get('/:pid', async (req, res) => {
    let pid = req.params.pid;
    pid = parseInt(pid);

    if(isNaN(pid)){
        return res.status(400).send('<h1 style="color:red">Error, ingrese un id de valor numerico</h1>');
    }

    let product = await pm.getProductById(pid);
    if (product) {
        res.setHeader('Content-Type','application/json');
        res.status(200).json({product});
    } else {
        res.status(404).json({ error: 'Producto no encontrado'});
    }
});

router.put('/:pid', (req, res) => {
    let pid = req.params.pid;
    pid = parseInt(pid);

    if(isNaN(pid)){
        return res.send('<h1 style="color:red">Error, ingrese un id de valor numérico</h1>');
    }

    const updatedProduct = req.body;

    pm.updateProduct(pid, updatedProduct);

    res.status(200).json({message: 'Producto actualizado exitosamente' });
});

router.delete('/:pid', (req, res) => {
    let pid = req.params.pid;
    pid = parseInt(pid);

    if(isNaN(pid)){
        return res.send('<h1 style="color:red">Error, ingrese un id de valor numérico</h1>');
    }

    pm.deleteProduct(pid);

    res.status(200).json({message: 'Producto eliminado exitosamente' });
});

module.exports = router;
const express = require('express');
const ProductManager = require('./ProductManager');


const pm = new ProductManager("./productos.json")

const app = express();
const port = 3000;

app.use(express.urlencoded({extended:true}));

app.get('/', (req, res) => {
    res.send('<h1 style="color:green">servidor de productos en linea</h1>')
})

app.get('/products', async (req, res) => {
    let products = await pm.getProducts();

    let productLimits = req.query.limit;
    if (productLimits) {
        productLimits = parseInt(productLimits, 10)
        if (isNaN (productLimits)){
            return res.send('<h1 style="color:red">Error, ingrese al limit un valor numerico</h1>')
        }
    }
    if (productLimits) {
        products = products.slice(0, productLimits);
    }

    res.setHeader('Content-Type','application/json');
    res.status(200).json({filtros: req.query,products });
})

app.get('/products/:pid', async (req, res) => {
    let pid = req.params.pid
    pid = parseInt(pid)

    if(isNaN(pid)){
        return res.send('<h1 style="color:red">Error, ingrese un id de valor numerico</h1>');
    }

    let product = await pm.getProductById(pid);
    if (product) {
        res.setHeader('Content-Type','application/json');
        res.status(200).json({product});
    } else {
        res.status(404).json({ error: 'Producto no encontrado'});
    }
})

app.listen(port, () => {
    console.log(`Servidor en linea, puerto ${port}`)
})

// Endpint para solicitar todos los users GET http://localhost:8080 ? limit=5
app.get('/products', (req, res)=>{  

    res.send(products)
}) 
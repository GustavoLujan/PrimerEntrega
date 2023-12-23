const express = require('express');
const ProductRouter = require('../routers/productRouter.js');
const CartRouter = require('../routers/cartRouter.js');



const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.get('/', (req, res) => {
    res.send('<h1 style="color:green">servidor de productos en linea</h1>')
})

app.use('/api/products', ProductRouter);
app.use('/api/carts', CartRouter);



app.listen(port, () => {
    console.log(`Servidor en linea, puerto ${port}`)
})
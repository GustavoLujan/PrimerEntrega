const express = require('express');
const { engine } = require('express-handlebars');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');
const ProductRouter = require('./routers/ProductRouter.js');
const CartRouter = require('./routers/cartRouter.js');
const ProductManager = require('./Classes/ProductManager.js');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

const viewsPath = path.join(__dirname, 'views');
app.engine('.handlebars', engine({ extname: '.handlebars' }));
app.set('view engine', '.handlebars');
app.set('views', viewsPath);

const pm = new ProductManager("./JSON/productos.json");

app.get('/', (req, res) => {
    const products = pm.getProducts();
    res.render('home', { products });
});

app.use('/api/products', ProductRouter(io));
app.use('/api/carts', CartRouter(io));

io.on('connection', (socket) => {
    console.log('Cliente conectado');
    
    const products = pm.getProducts();
    socket.emit('products', products);
});

app.get('/realtimeproducts', (req, res) => {
    res.render('realTimeProducts');
});

server.listen(port, () => {
    console.log(`Servidor en linea, puerto ${port}`);
});
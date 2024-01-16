const express = require('express');
const { engine } = require('express-handlebars');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');
const mongoose = require('mongoose');
const ProductRouter = require('./routers/ProductRouter');
const CartRouter = require('./routers/CartRouter');
const ChatRouter = require('./routers/ChatRouter');
const ProductDao = require('./dao/productDao');
const MessageDao = require('./dao/messageDao');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);
const port = 3000;


mongoose.connect('mongodb+srv://I_Ulloa:Coderclave@ecommerce.6tv4mer.mongodb.net/?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const viewsPath = path.join(__dirname, 'views');
app.engine('.handlebars', engine({ extname: '.handlebars', allowProtoMethodsByDefault: true }));
app.set('view engine', '.handlebars');
app.set('views', viewsPath);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.get('/', async (req, res) => {
    try {
        const products = await ProductDao.getProducts();
        console.log(products);
        res.render('home', { products });
    } catch (error) {
        console.error('Error al obtener productos:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

app.use('/api/products', ProductRouter(io));
app.use('/api/carts', CartRouter(io));
app.use('/chat', ChatRouter(io, MessageDao)); 


app.get('/realtimeproducts', (req, res) => {
    res.render('realTimeProducts');
});


io.on('connection', async (socket) => {
    console.log('Cliente conectado');

    const products = await ProductDao.getProducts();
    socket.emit('products', products);
});

server.listen(port, () => {
    console.log(`Servidor en linea, puerto ${port}`);
});
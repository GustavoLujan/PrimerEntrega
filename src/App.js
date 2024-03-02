const express = require('express');
const { engine } = require('express-handlebars');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');
const mongoose = require('mongoose');
const ProductRouter = require('./routers/ProductRouter');
const CartRouter = require('./routers/CartRouter');
const ChatRouter = require('./routers/ChatRouter');
const SessionRouterLocal = require('./routers/SessionLocalRouter')
const SessionGithubRouter = require('./routers/SessionGithubRouter')
const LoginRouter = require('./routers/LoginRouter')
const ProductDao = require('./dao/productDao');
const MessageDao = require('./dao/messageDao');
const CartDao = require('./dao/cartDao');
const sessions = require('express-session')
const mongoStore = require('connect-mongo')
const passport = require('passport')
const ClientRouter = require('./routers/ClientRouter')
const initPassportGithub = require('./config/passport/config.passportGithub')
const inicializarPassport = require('./config/passport/config.passportLocal')
const config = require('./config/config');
const app = express();
const server = http.createServer(app);
const io = socketIO(server);
const port = config.port || 3000;



app.use(sessions(
    {
        secret: config.sessionSecret,
        resave: true, saveUninitialized: true,
        store: mongoStore.create(
            {
                mongoUrl:config.mongoURI,
                mongoOptions:{dbName:"ecommerce"},
                ttl:3600,
            }
        )
    }
))
inicializarPassport()
initPassportGithub()
app.use(passport.initialize())
app.use(passport.session())

app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session && req.session.isAuthenticated || false;
    req.io = io;
    next();
});

app.get('/', (req, res) => {
    const isAuthenticated = req.session.usuario;

    if (!isAuthenticated) {
        return res.redirect('/login');
    }


    res.render('home');
});

const viewsPath = path.join(__dirname, 'views');
app.engine('handlebars', engine({ extname: '.handlebars' }));
app.set('view engine', 'handlebars');
app.set('views', viewsPath);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.use('/', LoginRouter(io))
app.use('/api/sessions', SessionRouterLocal(io))
app.use('/api/github', SessionGithubRouter(io))
app.use('/api/clientes', ClientRouter(io))


app.use('/api/products', ProductRouter(io));
app.use('/api/carts', CartRouter(io));
app.use('/chat', ChatRouter(io, MessageDao));

app.get('/views/carts/:cid', async (req, res) => {
    const cid = req.params.cid;
    try {
        const cart = await CartDao.getCartById(cid);
        if (cart) {
            res.render('cart', { cart });
        } else {
            res.status(404).json({ error: 'Carrito no encontrado' });
        }
    } catch (error) {
        console.error(`Error al obtener el carrito con ID ${cid}:`, error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

app.get('/realtimeproducts', async (req, res) => {
    try {
        const products = await ProductDao.getProducts({ limit: req.query.limit, page: req.query.page, sort: req.query.sort, query: req.query.query });
        res.render('realtimeproducts', { products });
    } catch (error) {
        console.error('Error al obtener productos para la vista:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

app.get('/views/products', async (req, res) => {
    try {
        let usuario=req.session.usuario
        const products = await ProductDao.getProducts({ limit: 10, page: req.query.page, sort: req.query.sort, query: req.query.query });
        res.render('products', { products, usuario });
    } catch (error) {
        console.error('Error al obtener productos para la vista:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

io.on('connection', async (socket) => {
    console.log('Cliente conectado');

    const products = await ProductDao.getProducts({ limit: 50});
    socket.emit('products', products);

    socket.on('addToCart', async ({ productId, productName, userRole }) => {
        try {


            const quantity = 1;

            await CartDao.addProductToCart(userRole, productId, quantity);

            console.log(`Producto "${productName}" agregado al carrito`);

        } catch (error) {
            console.error('Error al agregar el producto al carrito:', error);
        }
    });
});

server.listen(port, () => {
    console.log(`Servidor en linea, puerto ${port}`);
});

try {
    mongoose.connect(config.mongoURI, { dbName: "ecommerce" });
    console.log("DB online...!!!");
} catch (error) {
    console.log(error.message);
}
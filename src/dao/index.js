const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://tavolujan13:2DzswDTS9op17gvl@cluster0.hmxtrlt.mongodb.net/?retryWrites=true&w=majority',{ dbName: "ecommerce" });


const Cart = require('./models/cartModel');
const Message = require('./models/messageModel');
const Product = require('./models/productModel');

module.exports = {
    Cart,
    Message,
    Product
};
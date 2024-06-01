const CartService = require('../repository/cart.service');
const productService = require('../repository/product.service')
const ticketLogic = require('../dao/ticketDao')
const { enviarEmail } = require('../mails/mails');
const { Cart } = require('../dao/index');

class CartController {
    async createCart(req, res) {
        try {
            const cart = await CartService.createCart();
            res.status(201).json({ cart });
        } catch (error) {
            console.error('Error al crear un carrito:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    }

    async getCartById(req, res) {
        const cid = req.params.cid;
        try {
            const cart = await CartService.getCartById(cid);
            if (cart) {
                res.render('cart', { cart });
                console.log(cart)
            } else {
                res.status(404).json({ error: 'Carrito no encontrado' });
            }
        } catch (error) {
            console.error(`Error al obtener el carrito con ID ${cid}:`, error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    }

    async addProductToCart(req, res) {
        const cid = req.params.cid;
        const { productId, quantity } = req.body;
        const user = req.session.usuario;

        try {
            const cart = await CartService.getCartById(cid);

            if (!cart) {
                return res.status(404).json({ error: 'Carrito no encontrado' });
            }

            const product = await productService.getProductById(productId);
            if (user && user.role === 'premium' && product.owner === user.email) {
                return res.status(403).json({ error: 'No puedes agregar un producto que te pertenece a tu carrito' });
            }

            await CartService.addProductToCart(cid, productId, quantity);

            const updatedCart = await CartService.getCartById(cid);
            req.io.emit('updateCart', updatedCart);

            res.status(201).json({ message: 'Producto agregado al carrito', product, updatedCart });
        } catch (error) {
            console.error(`Error al agregar un producto al carrito con ID ${cid}:`, error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    }


    async deleteProductFromCart(req, res) {
        try {
            const { cid, pid } = req.params;

            const updatedCart = await Cart.findByIdAndUpdate(
                cid,
                { $pull: { products: { _id: pid } } },
                { new: true }
            ).populate('products.product');

            res.status(200).json({
                status: 'success',
                payload: updatedCart.products,
            });
        } catch (error) {
            console.error('Error al eliminar el producto del carrito:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    }

    async updateCart(req, res) {
        try {
            const { cid } = req.params;
            const newProducts = req.body.products;
            console.log(newProducts)

            const updatedCart = await Cart.findByIdAndUpdate(cid, { products: newProducts }, { new: true })
                .populate('products.product');

            res.status(200).json({
                status: 'success',
                payload: updatedCart.products,
            });

            console.log(updatedCart)
        } catch (error) {
            console.error('Error al actualizar el carrito:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    }

    async updateQuantityInCart(req, res) {
        try {
            const { cid, pid } = req.params;
            const { quantity } = req.body;

            const updatedCart = await Cart.findOneAndUpdate(
                { _id: cid, 'products._id': pid },
                { $set: { 'products.$.quantity': quantity } },
                { new: true }
            ).populate('products.product');

            res.status(200).json({
                status: 'success',
                payload: updatedCart.products,
            });
        } catch (error) {
            console.error('Error al actualizar la cantidad del producto en el carrito:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    }

    async deleteAllProductsInCart(req, res) {
        try {
            const { cid } = req.params;

            await Cart.findByIdAndUpdate(cid, { $set: { products: [] } });

            res.status(200).json({
                status: 'success',
                message: 'Todos los productos del carrito han sido eliminados',
            });
        } catch (error) {
            console.error('Error al eliminar todos los productos del carrito:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    }

    async purchaseCart(req, res) {
        const cid = req.params.cid;
        try {
            const cart = await Cart.findById(cid).populate('products.product');
            if (!cart) {
                return res.status(404).json({ error: 'Carrito no encontrado' });
            }

            const user = req.session.usuario;
            const purchaserEmail = user ? user.email : 'Unknown';
            let totalAmount = 0;
            const failedProducts = [];

            for (const productItem of cart.products) {
                const productId = productItem.product._id;
                const quantity = productItem.quantity;

                const product = await productService.getProductById(productId);
                if (!product || product.stock < quantity) {
                    failedProducts.push(productItem);
                } else {
                    totalAmount += product.price * quantity;
                    product.stock -= quantity;
                    await product.save();
                }
            }

            const ticket = await ticketLogic.generateTicket(purchaserEmail, totalAmount);

            cart.products = failedProducts;
            await cart.save();

            console.log('Ticket generado:', ticket);

            if (failedProducts.length === 0) {
                const message = `Gracias por tu compra.<br><br>` +
                                `Detalles del ticket: ${ticket.code},<br>` +
                                `Monto: ${totalAmount}`;
                const subject = 'Compra completada en nuestra tienda';
                await enviarEmail(purchaserEmail, subject, message);
                res.status(200).json({ message: 'Compra completada con éxito. Ticket generado.', ticket });
            } else {
                const message = `Tu compra se ha completado, pero algunos productos no se pudieron comprar debio a falta de stock.<br><br>` +
                    `Detalles del ticket: ${ticket.code}<br>` +
                    `Monto: ${totalAmount}<br><br>` +
                    `Productos que no se encontraban disponibles: ${failedProducts.map(item => item.product.title).join(', ')}`;

                const subject = 'Compra parcialmente completada en nuestra tienda';
                await enviarEmail(purchaserEmail, subject, message);
                res.status(200).json({ message: 'Compra completada con productos no disponibles', failedProducts: failedProducts.map(item => item.product._id), ticket });
            }
        } catch (error) {
            console.error('Error al finalizar la compra:', error);
            res.status(500).json({ error: 'Error interno del servidor' });

            const purchaserEmail = req.session.usuario ? req.session.usuario.email : 'Unknown';
            const errorMessage = 'Hubo un error al procesar tu compra. Por favor, inténtalo de nuevo más tarde.';
            const errorSubject = 'Error en la compra en nuestra tienda';
            await enviarEmail(purchaserEmail, errorSubject, errorMessage);
        }
    }
}

module.exports = new CartController();
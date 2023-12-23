const fs = require('fs')

class ProductManager {
    constructor(path) {
        this.path = path
    }

    getProducts() {
        if (fs.existsSync(this.path)) {
            return JSON.parse(fs.readFileSync(this.path, "utf-8"))
        } else {
            return []
        }
    }


    addProduct(title, description, price, thumbnail, code, stock) {
        let products = this.getProducts();

        let id = 1
        if (products.length > 0) {
            id = products[products.length - 1].id + 1
        }


        let objetos = {
            id,
            title,
            description,
            price,
            thumbnail,
            code,
            stock,
        };

        if (Object.values(objetos).includes(undefined)) {
        }

        products.push(objetos);
        fs.writeFileSync(this.path, JSON.stringify(products, null, 5))


    }

    updateProduct(id, updatedProduct) {
        let products = this.getProducts();

        let index = products.findIndex(p => p.id === id)
        if (index === -1) {
            console.log(`Not found ${id}`);
            return;
        }

        const checkObject = (check) => {
            return check === Object(check)
        }

        const checkedObject = checkObject(updatedProduct)
        if (!checkedObject) {
            return
        }

        //valida campos vacios

        const EmptyProducts = Object.values(updatedProduct).some(value => value === '');
        if (EmptyProducts) {
            return;
        }


        //validar que no se agregue nada nuevo a objetos
        const existingProduct = products[index]
        const updateKeys = Object.keys(updatedProduct)

        updateKeys.forEach((key) => {
            if (existingProduct.hasOwnProperty(key)) {
                existingProduct[key] = updatedProduct[key];
            } else {
                console.log(`el parametro de objeto ${key} no corresponde al ser distinto a los designados`)
            }
        })


        fs.writeFileSync(this.path, JSON.stringify(products, null, 5))
        
    }


    getProductById(id) {
        let products = this.getProducts();

        let index = products.findIndex(producto => producto.id === id)
        if (index === -1) {
            console.log(`Not found ${id}`)
            return
        }

        return products[index]
    }

    deleteProduct(id) {
        let products = this.getProducts();

        let index = products.findIndex((product) => {
            return product.id === id;
        });
        if (index === -1) {
            console.log(`Not found ${id}`)
            return
        }

        products.splice(index, 1)
        fs.writeFileSync(this.path, JSON.stringify(products, null, 5));
    }
}

const pm = new ProductManager("./productos.json")


module.exports = ProductManager
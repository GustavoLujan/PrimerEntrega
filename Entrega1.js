class ProductManager {
    constructor() {
      this.products = [];
      this.productIdCounter = 1;
    }
  
    addProduct(product) {
      if (
        !product.title ||
        !product.description ||
        !product.price ||
        !product.thumbnail ||
        !product.code ||
        !product.stock
      ) {
        console.log("Todos los campos son obligatorios.");
        return;
      }
  
      if (this.products.some((p) => p.code === product.code)) {
        console.log("Ya existe un producto con el mismo código.");
        return;
      }
  
      product.id = this.productIdCounter++;
      this.products.push(product);
      console.log(`Producto agregado: ${product.title}`);
    }
  
    getProducts() {
      return this.products;
    }
  
    getProductById(id) {
      const product = this.products.find((p) => p.id === id);
  
      if (product) {
        return product;
      } else {
        console.log("Producto no encontrado.");
      }
    }
  }
  
  const productManager = new ProductManager();
  
  const product1 = {
    title: "Producto 1",
    description: "Descripción del primer Producto",
    price: 2.55,
    thumbnail: "imagen1.jpg",
    code: "P1",
    stock: 122,
  };
  
  const product2 = {
    title: "Producto 2",
    description: "Descripción del segundo Producto",
    price: 3.47,
    thumbnail: "imagen2.jpg",
    code: "P2",
    stock: 45,
  };
  
  productManager.addProduct(product1);
  productManager.addProduct(product2);
  
  console.log("Lista de productos:", productManager.getProducts());
  
  const productIdToFind = 2;
  const foundProduct = productManager.getProductById(productIdToFind);
  console.log(`Producto con ID ${productIdToFind}:`, foundProduct);
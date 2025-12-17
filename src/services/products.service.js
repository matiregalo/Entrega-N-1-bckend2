import ProductsDAO from "../dao/products.dao.js";
const productsDAO = new ProductsDAO();

class ProductsServices {
  getAllProducts() {
    return productsDAO.getAll();
  }
  getProductById(id) {
    return productsDAO.getById(id);
  }
  createProduct(data) {
    if (!data.name) throw new Error("El nombre es obligatorio");
    if (data.price < 0) throw new Error("El precio no puede ser negativo");
    return productsDAO.create(data);
  }
  updateProduct(id, data) {
    const updated = productsDAO.getById(id);
    if (!updated) throw new Error("Producto no encontrado");
    return productsDAO.update(id, data);
  }
  deleteProduct(id) {
    const ok = productsDAO.delete(id);
    if (!ok) throw new Error("Producto no encontrado");
    return ok;
  }
}

export default ProductsServices;

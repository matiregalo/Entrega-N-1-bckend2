import ProductsDAO from "../dao/product.dao.js";
const productsDAO = new ProductsDAO();

class ProductsServices {
  async getAllProducts() {
    return await productsDAO.getAll();
  }

  async getProductById(id) {
    const product = await productsDAO.getById(id);
    if (!product) {
      throw new Error("Producto no encontrado");
    }
    return product;
  }

  async createProduct(data) {
    if (data.price !== undefined && data.price < 0) {
      throw new Error("El precio no puede ser negativo");
    }
    return await productsDAO.create(data);
  }

  async updateProduct(id, data) {
    const product = await productsDAO.getById(id);
    if (!product) {
      throw new Error("Producto no encontrado");
    }
    return await productsDAO.update(id, data);
  }

  async deleteProduct(id) {
    const product = await productsDAO.getById(id);
    if (!product) {
      throw new Error("Producto no encontrado");
    }
    const ok = await productsDAO.delete(id);
    if (!ok) {
      throw new Error("Error al eliminar el producto");
    }
    return ok;
  }
}

export default ProductsServices;

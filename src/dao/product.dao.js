import Product from "../models/product.model.js";

export default class ProductsDAO {
  async create(data) {
    try {
      const newProduct = new Product(data);
      const savedProduct = await newProduct.save();
      return savedProduct.toObject();
    } catch (error) {
      if (error.name === "ValidationError") {
        throw new Error(`Error de validación: ${error.message}`);
      }
      throw new Error(`Error al crear producto: ${error.message}`);
    }
  }

  async update(id, data) {
    try {
      const updatedProduct = await Product.findByIdAndUpdate(
        id,
        { $set: data },
        { new: true, runValidators: true },
      ).lean();

      if (!updatedProduct) {
        return null;
      }
      return updatedProduct;
    } catch (error) {
      if (error.name === "ValidationError") {
        throw new Error(`Error de validación: ${error.message}`);
      }
      throw new Error(`Error al actualizar producto: ${error.message}`);
    }
  }

  async getById(id) {
    try {
      const product = await Product.findById(id).lean();
      return product || null;
    } catch (error) {
      throw new Error(`Error al obtener producto: ${error.message}`);
    }
  }
  async delete(id) {
    try {
      const result = await Product.findByIdAndDelete(id);
      return result !== null;
    } catch (error) {
      throw new Error(`Error al eliminar producto: ${error.message}`);
    }
  }

  async updateStock(id, quantity) {
    try {
      const product = await Product.findById(id);
      if (!product) {
        return null;
      }
      const newStock = product.stock - quantity;
      if (newStock < 0) {
        throw new Error(
          `Stock insuficiente. Disponible: ${product.stock}, Solicitado: ${quantity}`,
        );
      }
      const updatedProduct = await Product.findByIdAndUpdate(
        id,
        { $set: { stock: newStock } },
        { new: true, runValidators: true },
      ).lean();
      return updatedProduct;
    } catch (error) {
      throw error;
    }
  }

  async getByIds(ids) {
    try {
      const products = await Product.find({ _id: { $in: ids } }).lean();
      return products;
    } catch (error) {
      throw new Error(`Error al obtener productos: ${error.message}`);
    }
  }

  async getAll() {
    try {
      const products = await Product.find().lean();
      return products;
    } catch (error) {
      throw new Error(`Error al obtener productos: ${error.message}`);
    }
  }
}

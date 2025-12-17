import ProductsService from "../services/products.service.js";

const productsService = new ProductsService();

export const getProducts = async (req, res) => {
  try {
    const products = await productsService.getAllProducts();
    res.send({ status: "success", payload: products });
  } catch (error) {
    res.status(500).send({ status: "error", message: error.message });
  }
};

export const getProductById = async (req, res) => {
  try {
    const id = req.params.id;
    const product = await productsService.getProductById(id);
    res.send({ status: "success", payload: product });
  } catch (error) {
    if (error.message === "Producto no encontrado") {
      return res
        .status(404)
        .send({ status: "error", message: "Producto no encontrado" });
    }
    res.status(500).send({ status: "error", message: error.message });
  }
};

export const createProduct = async (req, res) => {
  try {
    const newProduct = await productsService.createProduct(req.body);
    res.status(201).send({ status: "success", payload: newProduct });
  } catch (error) {
    if (error.message.includes("validación") || error.message.includes("obligatorio")) {
      return res.status(400).send({ status: "error", message: error.message });
    }
    res.status(500).send({ status: "error", message: error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const id = req.params.id;
    const update = await productsService.updateProduct(id, req.body);
    res.status(200).send({ status: "success", payload: update });
  } catch (error) {
    if (error.message === "Producto no encontrado") {
      return res.status(404).send({ status: "error", message: error.message });
    }
    if (error.message.includes("validación")) {
      return res.status(400).send({ status: "error", message: error.message });
    }
    res.status(500).send({ status: "error", message: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const id = req.params.id;
    await productsService.deleteProduct(id);
    res.status(200).send({ status: "success", message: "Producto eliminado correctamente" });
  } catch (error) {
    if (error.message === "Producto no encontrado") {
      return res.status(404).send({ status: "error", message: error.message });
    }
    res.status(500).send({ status: "error", message: error.message });
  }
};

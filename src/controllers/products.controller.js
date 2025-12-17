import ProductsService from "../services/products.service.js";

const productsService = new ProductsService();

export const getProducts = (req, res) => {
  const products = productsService.getAllProducts();
  res.send({ status: "success", payload: products });
};

export const getProductById = (req, res) => {
  const id = Number(req.params.id);
  const product = productsService.getProductById(id);
  if (!product)
    return res
      .status(404)
      .send({ status: "error", message: "Producto no encontrado" });
  res.send({ status: "success", payload: product });
};

export const createProduct = (req, res) => {
  try {
    const newProduct = productsService.createProduct(req.body);
    res.status(201).send({ status: "success", payload: newProduct });
  } catch (error) {
    res.status(404).send({ status: "error", message: error.message });
  }
};

export const updateProduct = (req, res) => {
  const id = Number(req.params.id);
  try {
    const update = productsService.updateProduct(id, req.body);
    res.status(201).send({ status: "success", payload: update });
  } catch (error) {
    res.status(404).send({ status: "error", message: error.message });
  }
};

export const deleteProduct = (req, res) => {
  const id = Number(req.params.id);
  try {
    productsService.deleteProduct(id);
    res.status(201).send({ status: "success", message: "Eliminado" });
  } catch (error) {
    res.status(404).send({ status: "error", message: error.message });
  }
};

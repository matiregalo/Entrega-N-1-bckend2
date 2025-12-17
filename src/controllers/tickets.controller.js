import PurchaseService from "../services/purchase.service.js";

const purchaseService = new PurchaseService();

export const createTicket = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).send({
        status: "error",
        message: "Debes estar autenticado para realizar una compra",
      });
    }

    const userId = req.user.id;
    const { products } = req.body;

    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).send({
        status: "error",
        message:
          "Debe proporcionar al menos un producto con productId y quantity",
      });
    }
    for (const product of products) {
      if (!product.productId) {
        return res.status(400).send({
          status: "error",
          message: "Cada producto debe tener un productId",
        });
      }
      if (
        product.quantity &&
        (product.quantity < 1 || !Number.isInteger(product.quantity))
      ) {
        return res.status(400).send({
          status: "error",
          message: "La cantidad debe ser un número entero mayor a 0",
        });
      }
    }
    const result = await purchaseService.processPurchase(userId, products);

    if (!result.ticket) {
      return res.status(400).send({
        status: "error",
        message: result.message,
        unavailableProducts: result.unavailableProducts,
      });
    }
    const response = {
      status: "success",
      message: result.message,
      payload: {
        ticket: result.ticket,
        purchasedProducts: result.purchasedProducts,
      },
    };

    if (result.unavailableProducts.length > 0) {
      response.unavailableProducts = result.unavailableProducts;
    }

    const statusCode = result.unavailableProducts.length > 0 ? 200 : 201;
    res.status(statusCode).send(response);
  } catch (error) {
    if (
      error.message.includes("no encontrado") ||
      error.message.includes("no existe")
    ) {
      return res.status(404).send({ status: "error", message: error.message });
    }
    if (
      error.message.includes("requerido") ||
      error.message.includes("Debe proporcionar")
    ) {
      return res.status(400).send({ status: "error", message: error.message });
    }
    res.status(500).send({ status: "error", message: error.message });
  }
};

import ProductsDAO from "../dao/product.dao.js";
import TicketDAO from "../dao/ticket.dao.js";
import UserDAO from "../dao/user.dao.js";

const productsDAO = new ProductsDAO();
const ticketDAO = new TicketDAO();
const userDAO = new UserDAO();

class PurchaseService {
  async processPurchase(userId, productsRequest) {
    const user = await userDAO.getById(userId);
    if (!user) {
      throw new Error("Usuario no encontrado");
    }

    if (!productsRequest || productsRequest.length === 0) {
      throw new Error("No hay productos en la orden");
    }

    const productIds = productsRequest.map((p) => p.productId);
    const products = await productsDAO.getByIds(productIds);

    if (products.length === 0) {
      throw new Error("Ninguno de los productos solicitados existe");
    }

    const availableProducts = [];
    const unavailableProducts = [];
    const productsToUpdate = [];

    for (const request of productsRequest) {
      const product = products.find(
        (p) => String(p._id) === String(request.productId),
      );

      if (!product) {
        unavailableProducts.push({
          productId: request.productId,
          reason: "Producto no encontrado",
        });
        continue;
      }

      const requestedQuantity = request.quantity || 1;
      const availableStock = product.stock || 0;

      if (availableStock >= requestedQuantity) {
        availableProducts.push({
          product: product._id,
          name: product.name,
          price: product.price,
          quantity: requestedQuantity,
        });
        productsToUpdate.push({
          productId: product._id,
          quantity: requestedQuantity,
        });
      } else if (availableStock > 0) {
        availableProducts.push({
          product: product._id,
          name: product.name,
          price: product.price,
          quantity: availableStock,
        });
        productsToUpdate.push({
          productId: product._id,
          quantity: availableStock,
        });
        unavailableProducts.push({
          productId: request.productId,
          name: product.name,
          requested: requestedQuantity,
          available: availableStock,
          reason: "Stock insuficiente",
        });
      } else {
        unavailableProducts.push({
          productId: request.productId,
          name: product.name,
          requested: requestedQuantity,
          available: 0,
          reason: "Sin stock disponible",
        });
      }
    }

    if (availableProducts.length === 0) {
      return {
        ticket: null,
        purchasedProducts: [],
        unavailableProducts,
        message:
          "No se pudo completar la compra. Ningún producto tiene stock disponible.",
      };
    }

    const amount = availableProducts.reduce(
      (total, p) => total + p.price * p.quantity,
      0,
    );

    const ticketData = {
      purchaser: user._id || user.id,
      products: availableProducts,
      amount,
    };

    const ticket = await ticketDAO.create(ticketData);

    const stockUpdates = [];
    for (const update of productsToUpdate) {
      try {
        await productsDAO.updateStock(update.productId, update.quantity);
        stockUpdates.push({
          productId: update.productId,
          quantity: update.quantity,
          status: "success",
        });
      } catch (error) {
        stockUpdates.push({
          productId: update.productId,
          quantity: update.quantity,
          status: "error",
          error: error.message,
        });
      }
    }

    const result = {
      ticket,
      purchasedProducts: availableProducts,
      unavailableProducts,
      stockUpdates,
    };

    if (unavailableProducts.length === 0) {
      result.message = "Compra completada exitosamente";
    } else {
      result.message = `Compra parcial completada. ${availableProducts.length} producto(s) comprado(s), ${unavailableProducts.length} producto(s) sin stock suficiente.`;
    }

    return result;
  }
}

export default PurchaseService;

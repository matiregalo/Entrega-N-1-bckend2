import PurchaseService from '../services/purchase.service.js';

const purchaseService = new PurchaseService();

export const getTickets = async (req, res) => {
  try {
    const tickets = await purchaseService.getAllTickets();
    res.send({ status: 'success', payload: tickets });
  } catch (error) {
    res.status(500).send({ status: 'error', message: error.message });
  }
};

export const getTicketById = async (req, res) => {
  try {
    const id = req.params.id;
    const ticket = await purchaseService.getTicketById(id);
    res.send({ status: 'success', payload: ticket });
  } catch (error) {
    if (error.message === 'Ticket no encontrado') {
      return res.status(404).send({ status: 'error', message: error.message });
    }
    res.status(500).send({ status: 'error', message: error.message });
  }
};

export const createTicket = async (req, res) => {
  try {
    const { userId, products } = req.body;

    if (!userId) {
      return res.status(400).send({
        status: 'error',
        message: 'El userId es requerido'
      });
    }

    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).send({
        status: 'error',
        message: 'Debe proporcionar al menos un producto con productId y quantity'
      });
    }

    // Validar formato de productos
    for (const product of products) {
      if (!product.productId) {
        return res.status(400).send({
          status: 'error',
          message: 'Cada producto debe tener un productId'
        });
      }
      if (product.quantity && (product.quantity < 1 || !Number.isInteger(product.quantity))) {
        return res.status(400).send({
          status: 'error',
          message: 'La cantidad debe ser un número entero mayor a 0'
        });
      }
    }

    // Procesar la compra
    const result = await purchaseService.processPurchase(userId, products);

    // Si no se pudo comprar nada
    if (!result.ticket) {
      return res.status(400).send({
        status: 'error',
        message: result.message,
        unavailableProducts: result.unavailableProducts
      });
    }

    // Respuesta exitosa
    const response = {
      status: 'success',
      message: result.message,
      payload: {
        ticket: result.ticket,
        purchasedProducts: result.purchasedProducts,
      }
    };

    // Si hay productos no disponibles, incluirlos en la respuesta
    if (result.unavailableProducts.length > 0) {
      response.unavailableProducts = result.unavailableProducts;
    }

    // Determinar código de estado según si fue compra completa o parcial
    const statusCode = result.unavailableProducts.length > 0 ? 200 : 201;
    res.status(statusCode).send(response);

  } catch (error) {
    if (error.message.includes('no encontrado') || error.message.includes('no existe')) {
      return res.status(404).send({ status: 'error', message: error.message });
    }
    if (error.message.includes('requerido') || error.message.includes('Debe proporcionar')) {
      return res.status(400).send({ status: 'error', message: error.message });
    }
    res.status(500).send({ status: 'error', message: error.message });
  }
};
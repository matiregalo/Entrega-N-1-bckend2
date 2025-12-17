import UserDAO from '../dao/user.dao.js';
import TicketDAO from '../dao/ticket.dao.js';
import ProductsDAO from '../dao/product.dao.js';

const userDao = new UserDAO();
const ticketDao = new TicketDAO();

export const getTickets = async (req, res) => {
  try {
    const tickets = await ticketDao.getTickets();
    res.send({ status: 'success', result: tickets });
  } catch (error) {
    res.status(500).send({ status: 'error', error: error.message });
  }
};

export const createTicket = async (req, res) => {
  try {
    const { userId, products } = req.body;
    const user = await userDao.getUserById(userId);
    if (!user) {
      return res.status(400).send({
        status: 'error',
        message: 'User no válido'
      });
    }


    if (products.length === 0) {
      return res.status(400).send({
        status: 'error',
        message: 'No hay productos válidos en la orden'
      });
    }

    const totalPrice = products.reduce(
      (acc, p) => acc + p.price,
      0
    );

    const newTicketData = {
      number: Date.now(),
      user: user._id,
      products: products.map(p => ({
        name: p.name,
        price: p.price,
        quantity: 1
      })),
      totalPrice
    };

    const ticket = await ticketDao.createTickets(newTicketData);

    res.status(201).send({ status: 'success', result: ticket });
  } catch (error) {
    res.status(500).send({ status: 'error', error: error.message });
  }
};
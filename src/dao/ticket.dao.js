import { ticketModel } from "../models/ticket.model.js";

export default class TicketDAO {
  async create(ticketData) {
    try {
      const ticket = await ticketModel.create(ticketData);
      const populatedTicket = await ticketModel
        .findById(ticket._id)
        .populate("purchaser", "first_name last_name email")
        .populate("products.product", "name price category")
        .lean();
      return populatedTicket;
    } catch (error) {
      if (error.name === "ValidationError") {
        throw new Error(`Error de validación: ${error.message}`);
      }
      throw new Error(`Error al crear ticket: ${error.message}`);
    }
  }
}

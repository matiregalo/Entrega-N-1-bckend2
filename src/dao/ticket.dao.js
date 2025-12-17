import { ticketModel } from "../models/ticket.model";

export default class TicketDAO {
  async getTickets() {
    return await ticketModel.find()
      .populate('user')
  }

  async createTickets(ticketsData) {
    return await ticketModel.create(ticketsData);
  }
}
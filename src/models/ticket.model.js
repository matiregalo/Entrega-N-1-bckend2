import mongoose from 'mongoose';

const ticketCollection = 'tickets';

const ticketSchema = new mongoose.Schema({
  number: Number,
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
  products: [
    {
      _id: false,
      name: String,
      price: Number,
      quantity: Number
    }
  ],
  totalPrice: Number
});

export const ticketModel = mongoose.model(ticketCollection, ticketSchema);
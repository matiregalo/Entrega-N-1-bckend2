import { Router } from 'express';
import { getTickets, createTicket } from '../controllers/tickets.controller';
const router = Router();

router.get('/', getTickets);
router.post('/', createTicket);

export default router;
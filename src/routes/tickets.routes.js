import { Router } from 'express';
import { getTickets, getTicketById, createTicket } from '../controllers/tickets.controller.js';
import { authenticateJWT } from '../middlewares/auth.js';

const router = Router();

// Obtener todos los tickets (requiere autenticación)
router.get('/', authenticateJWT, getTickets);

// Obtener un ticket por ID (requiere autenticación)
router.get('/:id', authenticateJWT, getTicketById);

// Crear un nuevo ticket/compra (requiere autenticación)
router.post('/', authenticateJWT, createTicket);

export default router;
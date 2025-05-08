const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createTicket,
  getTickets,
  updateTicketStatus,
  deleteTicket
} = require('../controllers/ticketController');

router.post('/', protect, createTicket);
router.get('/', protect, getTickets);
router.put('/:id', protect, updateTicketStatus);
router.delete('/:id', protect, deleteTicket);

module.exports = router;

const Ticket = require('../models/Ticket');
const sendMail = require('../utils/sendMail');

// Create Ticket
exports.createTicket = async (req, res) => {
  try {
    const { title, description } = req.body;

    const ticket = await Ticket.create({
      title,
      description,
      raisedBy: req.user._id,
    });

    // Send mail to HR
    await sendMail({
      to: 'signavoxtechnologies@gmail.com',
      subject: `New Ticket Raised: ${title}`,
      text: `A new ticket has been raised by ${req.user.name} (${req.user.email}):\n\n${description}`,
    });

    res.status(201).json(ticket);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Get all tickets (admin) or self tickets
exports.getTickets = async (req, res) => {
  const query = req.user.role === 'CEO' || req.user.role === 'HR' ? {} : { raisedBy: req.user._id };
  const tickets = await Ticket.find(query).populate('raisedBy', 'name email');
  res.json(tickets);
};

// Update ticket status
exports.updateTicketStatus = async (req, res) => {
  const { status } = req.body;
  const ticket = await Ticket.findById(req.params.id).populate('raisedBy');

  if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

  ticket.status = status;
  if (status === 'Resolved') ticket.resolvedAt = new Date();
  await ticket.save();

  // Notify employee if resolved
  if (status === 'Resolved') {
    await sendMail({
      to: ticket.raisedBy.email,
      subject: `Ticket Resolved: ${ticket.title}`,
      text: `Hi ${ticket.raisedBy.name},\n\nYour ticket "${ticket.title}" has been resolved.`,
    });
  }

  res.json(ticket);
};

// Delete ticket
exports.deleteTicket = async (req, res) => {
  const ticket = await Ticket.findByIdAndDelete(req.params.id);
  if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
  res.json({ message: 'Ticket deleted' });
};

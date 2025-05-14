const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

const {
  createQuickLink,
  getAllQuickLinks,
  getQuickLinkById,
  updateQuickLink,
  deleteQuickLink,
  getQuickLinkCount
} = require('../controllers/quickLinkController');

// Routes
router.post('/', protect, createQuickLink);
router.get('/', protect, getAllQuickLinks);
router.get('/count', protect, getQuickLinkCount); // 🔹 New route for count
router.get('/:id', protect, getQuickLinkById);
router.put('/:id', protect, updateQuickLink);
router.delete('/:id', protect, deleteQuickLink);

module.exports = router;

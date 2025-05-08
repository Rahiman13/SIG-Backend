const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  createQuickLink,
  getAllQuickLinks,
  getQuickLinkById,
  updateQuickLink,
  deleteQuickLink
} = require('../controllers/quickLinkController');

router.post('/', protect, upload.single('image'), createQuickLink);
router.get('/', protect, getAllQuickLinks);
router.get('/:id', protect, getQuickLinkById);
router.put('/:id', protect, upload.single('image'), updateQuickLink);
router.delete('/:id', protect, deleteQuickLink);

module.exports = router;

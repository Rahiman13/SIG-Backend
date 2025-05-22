const express = require('express');
const router = express.Router();
const statsController = require('../controllers/mobilityStatsController');
const { auth, isAdmin } = require('../middleware/auth');

// General mobility statistics
router.get('/overview', auth, isAdmin, statsController.getMobilityStats);

// Date-wise application count
router.get('/datewise', auth, isAdmin, statsController.getApplicationsByDate);

module.exports = router;

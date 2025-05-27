const express = require('express');
const router = express.Router();
const controller = require('../controllers/projectApplicationController');
const { auth, isAdmin } = require('../middleware/auth');

router.post('/apply', auth, controller.applyForProject);

router.get('/my-applications', auth, controller.getOwnApplications);

router.delete('/my-applications/:id', auth, controller.deleteOwnApplication);

// Employee applies for project

// Admin gets all applications
router.get('/', auth, isAdmin, controller.getAllApplications);

// Admin get application By Id
router.get('/:id', auth, isAdmin, controller.getApplicationById);
// Admin approves application
router.patch('/approve/:id', auth, isAdmin, controller.approveApplication);

// Admin rejects application
router.patch('/reject/:id', auth, isAdmin, controller.rejectApplication);

// Admin drops employee from project
router.patch('/drop/:id', auth, controller.dropFromProject);



module.exports = router;

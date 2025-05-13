const express = require('express');
const router = express.Router();
const {
  // registerEmployee,
  // loginEmployee,
  logoutEmployee,
  getProfile,
  updateProfile,
  getAllEmployees,    // Done
  getEmployeeById,
  deleteEmployee,    // Done
  forgotPassword,
  resetPassword,
} = require('../controllers/employeeController');
const authMiddleware = require('../middleware/authMiddleware');


const { protect, adminOnly } = require('../middleware/auth');

// Admin creates/registers new employee
// router.post('/register', registerEmployee);

// // Login and logout
// router.post('/login', loginEmployee);
router.post('/logout', logoutEmployee);

// Forgot/reset password with OTP
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Employee profile
router.get('/profile', protect, authMiddleware, getProfile);
router.put('/profile/:id', protect, updateProfile);

// Admin: Manage all employees
router.get('/', protect, adminOnly, getAllEmployees);
router.get('/:id', protect, adminOnly, getEmployeeById);
router.delete('/:id', protect, adminOnly, deleteEmployee);

module.exports = router;

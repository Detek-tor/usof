const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

router.post('/', authMiddleware, roleMiddleware('admin'), userController.createUser);

router.get('/', authMiddleware, roleMiddleware('admin'), userController.getAllUsers);

router.get('/:userId', authMiddleware, roleMiddleware('admin'), userController.getUserById);

router.patch('/:userId', authMiddleware, roleMiddleware('admin'), userController.updateUser);

router.delete('/:userId', authMiddleware, roleMiddleware('admin'), userController.deleteUser);

router.post('/register', authController.register);

router.get('/confirm/:token', authController.confirmEmail);

router.post('/login', authController.login);

module.exports = router;
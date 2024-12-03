const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const userController = require('../controllers/userController');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = 'uploads/';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

router.patch('/profile', authMiddleware, userController.updateProfile);

router.post('/reset-password', userController.resetPassword);

router.post('/request-password-change', userController.requestPasswordChange);

router.get('/me', authMiddleware, userController.getCurrentUser);

router.patch('/avatar', authMiddleware, upload.single('avatar'), userController.updateAvatar);

router.post('/', authMiddleware, roleMiddleware('admin'), upload.single('avatar'), userController.createUser);
router.get('/', authMiddleware, roleMiddleware('admin'), userController.getAllUsers);
router.get('/:userId', authMiddleware, roleMiddleware('admin'), userController.getUserById);
router.patch('/:userId', authMiddleware, roleMiddleware('admin'), upload.single('avatar'), userController.updateUser);
router.delete('/:userId', authMiddleware, roleMiddleware('admin'), userController.deleteUser);

module.exports = router;
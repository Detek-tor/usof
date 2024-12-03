const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

const categoryController = require('../controllers/categoryController')

router.post('/', authMiddleware, roleMiddleware('admin'), categoryController.createCategory);
router.get('/', categoryController.getAllCategories);
router.get('/:categoryId', categoryController.getCategoryById);
router.patch('/:categoryId', authMiddleware, roleMiddleware('admin'), categoryController.updateCategory);
router.delete('/:categoryId', authMiddleware, roleMiddleware('admin'), categoryController.deleteCategory);

module.exports = router;
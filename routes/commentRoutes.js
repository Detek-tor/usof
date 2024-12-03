const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

router.post('/', authMiddleware, commentController.createComment);

router.get('/post/:postId', commentController.getAllCommentsByPostId);

router.get('/:commentId', commentController.getCommentById);

router.patch('/:commentId', authMiddleware, commentController.updateComment);

router.delete('/:commentId', authMiddleware, commentController.deleteComment);

router.patch('/:commentId/status', authMiddleware, roleMiddleware('admin'), commentController.updateCommentStatus);

module.exports = router;
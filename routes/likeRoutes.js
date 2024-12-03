const express = require('express');
const router = express.Router();
const likeController = require('../controllers/likeController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

router.post('/', authMiddleware, likeController.addLike);

router.delete('/', authMiddleware, likeController.removeLike);

router.get('/count', likeController.getLikesCount);

router.get('/:postId/user', authMiddleware, likeController.getUserLike);

router.get('/:postId/:commentId/user', authMiddleware, likeController.getUserLike);

router.get('/', authMiddleware, roleMiddleware('admin'), likeController.getAllLikes);

module.exports = router;
const Like = require('../models/likeModel')
const postModel = require('../models/postModel')

class likeController {
    async addLike(req, res) {
        const { type, postId, commentId } = req.body;
        const userId = req.user.id;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        try {
            const post = await postModel.findPostById(postId);
            if (!post || post.status !== 'active') {
            return res.status(403).json({ message: 'Невозможно добавить лайк к неактивному посту' });
            }

            const like = await Like.addLike(postId, userId, type, commentId);
            res.status(201).json({ message: 'Like added', like });
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    }

    async removeLike(req, res) {
        const { postId, commentId } = req.body;
        const userId = req.user.id;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        try {
            const like = await Like.removeLike(postId, userId, commentId);
            res.status(200).json({ message: 'Like removed', like });
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    }

    async getLikesCount(req, res) {
        const { postId, commentId } = req.query;
        try {
            const likesCount = await Like.getLikesCount(postId, commentId);
            res.status(200).json(likesCount);
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    }

    async getUserLike(req, res) {
        const { postId, commentId } = req.params;
        const userId = req.user.id;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        try {
            const like = await Like.getUserLike(postId, userId, commentId || null);
            res.status(200).json(like || null);
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    }

    async getAllLikes(req, res) {
        try {
            const likes = await Like.getAllLikes();
            res.status(200).json(likes);
          } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
          }
    }
}

module.exports = new likeController();
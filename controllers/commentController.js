const commentModel = require('../models/commentModel')
const postModel = require('../models/postModel')

class commentController {
    async createComment(req, res) {
        const { content, postId } = req.body;
        const userId = req.user.id;

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        try {
            const post = await postModel.findPostById(postId);
            if (!post || post.status !== 'active') {
            return res.status(403).json({ message: 'Невозможно добавить комментарий к неактивному посту' });
            }

            const comment = await commentModel.createComment(content, postId, userId);
            res.status(201).json(comment);
        } catch (error) {
            console.error('Ошибка при создании комментария:', error);
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    }

    async getAllCommentsByPostId(req, res) {
        try {
            const { postId } = req.params;
            const comments = await commentModel.findAllCommentsByPostId(postId);
            res.status(200).json(comments);
          } catch (error) {
            console.error('Ошибка при получении комментариев:', error);
            res.status(500).json({ message: 'Server error', error: error.message });
          }
    }

    async getCommentById(req, res) {
        try {
            const { commentId } = req.params;
            const comment = await commentModel.findCommentById(commentId);
            if (!comment) {
              return res.status(404).json({ message: 'Комментарий не найден' });
            }
            res.status(200).json(comment);
          } catch (error) {
            console.error('Ошибка при получении комментария:', error);
            res.status(500).json({ message: 'Server error', error: error.message });
          }
    }

    async updateComment(req, res) {
        const { content } = req.body;
        const { commentId } = req.params;
        const userId = req.user.id;
        const userRole = req.user.role;

        try {
            const comment = await commentModel.findCommentById(commentId);
            if (!comment) {
            return res.status(404).json({ message: 'Комментарий не найден' });
            }

            if (comment.user_id !== userId && userRole !== 'admin') {
            return res.status(403).json({ message: 'Доступ запрещён' });
            }

            const updatedComment = await commentModel.updateComment(commentId, { content });
            res.status(200).json(updatedComment);
        } catch (error) {
            console.error('Ошибка при обновлении комментария:', error);
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    }
    async deleteComment(req, res) {
        const { commentId } = req.params;
        const userId = req.user.id;
        const userRole = req.user.role;

        try {
            const comment = await commentModel.findCommentById(commentId);
            if (!comment) {
            return res.status(404).json({ message: 'Комментарий не найден' });
            }

            if (userRole !== 'admin' && comment.user_id !== userId) {
            return res.status(403).json({ message: 'Доступ запрещён' });
            }

            const deletedComment = await commentModel.deleteComment(commentId);
            res.status(200).json({ message: 'Комментарий успешно удалён', comment: deletedComment });
        } catch (error) {
            console.error('Ошибка при удалении комментария:', error);
            res.status(500).json({ message: 'Ошибка при удалении комментария', error: error.message });
        }
    }

    async updateCommentStatus(req, res) {
        const { commentId } = req.params;
        const { status } = req.body;

        try {
            const updatedComment = await commentModel.updateCommentStatus(commentId, status);
            res.status(200).json(updatedComment);
        } catch (error) {
            console.error('Ошибка при обновлении статуса комментария:', error);
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    }
}

module.exports = new commentController();
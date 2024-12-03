const postModel = require('../models/postModel')

class postController {
    async createPost(req, res) {
        const { title, content, categoryIds } = req.body;
        const userId = req.user.id;

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        try {
            const post = await postModel.createPost(title, content, userId, categoryIds);
            res.status(201).json(post);
        } catch (error) {
            console.error('Ошибка при создании поста:', error);
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    }

    async getAllPosts(req, res) {
        try {
            const user = req.user;
            
            if (!user) {
              return res.status(401).json({ message: 'Unauthorized' });
            }
            
            const posts = await postModel.findAllPostsWithCategories(user);
            res.status(200).json(posts);
          } catch (error) {
            console.error('Ошибка при получении постов:', error);
            res.status(500).json({ message: 'Server error', error: error.message });
          }
    }

    async getPostById(req, res) {
        try {
            const post = await postModel.findPostById(req.params.postId);
            if (!post) {
              return res.status(404).json({ message: 'Пост не найден' });
            }
        
            const user = req.user;
        
            if (user.role !== 'admin') {
              if (post.status === 'not_active' && post.user_id !== user.id) {
                return res.status(403).json({ message: 'Доступ запрещён' });
              }
            }
        
            res.status(200).json(post);
          } catch (error) {
            console.error('Ошибка при получении поста:', error);
            res.status(500).json({ message: 'Server error', error: error.message });
          }
    }

    async updatePost(req, res) {
        const { title, content, categoryIds } = req.body;
        const userId = req.user.id;

        try {
            const post = await postModel.findPostById(req.params.postId);
            if (!post) {
            return res.status(404).json({ message: 'Пост не найден' });
            }

            if (post.user_id !== userId) {
            return res.status(403).json({ message: 'Доступ запрещён' });
            }

            const updatedPost = await postModel.updatePost(req.params.postId, { title, content }, categoryIds || []);
            res.status(200).json(updatedPost);
        } catch (error) {
            console.error('Ошибка при обновлении поста:', error);
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    }

    async deletePost(req, res) {
        const postId = req.params.postId;
        const userId = req.user.id;
        const userRole = req.user.role;

        try {
            const post = await postModel.findPostById(postId);
            if (!post) {
            return res.status(404).json({ message: 'Пост не найден' });
            }

            if (userRole !== 'admin' && post.user_id !== userId) {
            return res.status(403).json({ message: 'Доступ запрещён' });
            }

            const deletedPost = await postModel.deletePost(postId);
            res.status(200).json({ message: 'Пост успешно удалён', post: deletedPost });
        } catch (error) {
            console.error('Ошибка при удалении поста:', error);
            res.status(500).json({ message: 'Ошибка при удалении поста', error: error.message });
        }
    }
    async updatePostStatus(req, res) {
        const { status } = req.body;
        const { postId } = req.params;
        const user = req.user;

        if (!['active', 'not_active'].includes(status)) {
            return res.status(400).json({ message: 'Неверный статус' });
        }

        try {
            const post = await postModel.findPostById(postId);
            if (!post) {
            return res.status(404).json({ message: 'Пост не найден' });
            }

            if (user.role !== 'admin' && post.user_id !== user.id) {
            return res.status(403).json({ message: 'Доступ запрещён' });
            }

            const updatedPost = await postModel.updatePostStatus(postId, status);
            res.status(200).json(updatedPost);
        } catch (error) {
            console.error('Ошибка при обновлении статуса поста:', error);
            res.status(500).json({ message: 'Внутренняя ошибка сервера', error: error.message });
        }
    }
}

module.exports = new postController();
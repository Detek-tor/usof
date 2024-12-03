const pool = require('../config/db');
const userModel = require('./userModel');

class likeModel {
    async addLike(postId, userId, type, commentId = null) {
        try {
            console.log(`Добавление лайка: postId=${postId}, commentId=${commentId}, userId=${userId}`);
            
            let ownerId;
            if (commentId !== null) {
              const comment = await pool.query('SELECT user_id FROM comments WHERE id = $1', [commentId]);
              ownerId = comment.rows[0]?.user_id;
              console.log(`Владелец комментария: ownerId=${ownerId}`);
            } else if (postId !== null) {
              const post = await pool.query('SELECT user_id FROM posts WHERE id = $1', [postId]);
              ownerId = post.rows[0]?.user_id;
              console.log(`Владелец поста: ownerId=${ownerId}`);
            }
        
            if (ownerId === userId) {
              console.log('Пользователь пытается поставить лайк/дизлайк своему собственному контенту. Операция игнорируется.');
              return { message: 'Нельзя лайкать или дизлайкать свой собственный контент.' };
            }
        
            const result = await pool.query(
              `INSERT INTO likes (post_id, user_id, type, comment_id)
               VALUES ($1, $2, $3, $4)
               ON CONFLICT (user_id, post_id, comment_id)
               DO UPDATE SET type = EXCLUDED.type
               RETURNING *`,
              [postId, userId, type, commentId]
            );
        
            if (ownerId) {
              await userModel.updateUserRating(ownerId);
            }
        
            return result.rows[0];
          } catch (error) {
            console.error('Ошибка в addLike:', error);
            throw error;
          }
    }

    async removeLike(postId, userId, commentId = null) {
        try {
            let query = 'DELETE FROM likes WHERE user_id = $1 AND post_id = $2';
            let params = [userId, postId];
        
            if (commentId !== null) {
              query += ' AND comment_id = $3';
              params.push(commentId);
            } else {
              query += ' AND comment_id IS NULL';
            }
        
            const result = await pool.query(query, params);
        
            let ownerId;
            if (commentId !== null) {
              const comment = await pool.query('SELECT user_id FROM comments WHERE id = $1', [commentId]);
              ownerId = comment.rows[0]?.user_id;
              console.log(`Владелец комментария: ownerId=${ownerId}`);
            } else if (postId !== null) {
              const post = await pool.query('SELECT user_id FROM posts WHERE id = $1', [postId]);
              ownerId = post.rows[0]?.user_id;
              console.log(`Владелец поста: ownerId=${ownerId}`);
            }
        
            console.log(`Лайк удален пользователем ID: ${userId}, владельцем контента ID: ${ownerId}`);
        
            if (ownerId && ownerId !== userId) {
              await userModel.updateUserRating(ownerId);
            }
        
            return result.rows[0];
          } catch (error) {
            console.error('Ошибка в removeLike:', error);
            throw error;
          }
    }

    async getLikesCount(postId = null, commentId = null) {
        try {
            let query = 'SELECT type, COUNT(*) AS count FROM likes WHERE post_id = $1';
            let params = [postId];
        
            if (commentId !== null) {
              query += ' AND comment_id = $2';
              params.push(commentId);
            } else {
              query += ' AND comment_id IS NULL';
            }
        
            query += ' GROUP BY type';
        
            const result = await pool.query(query, params);
            return result.rows;
          } catch (error) {
            console.error('Ошибка в getLikesCount:', error);
            throw error;
          }
    }

    async getUserLike(postId = null, userId, commentId = null) {
        try {
            let query = 'SELECT * FROM likes WHERE user_id = $1 AND post_id = $2';
            let params = [userId, postId];
        
            if (commentId !== null) {
              query += ' AND comment_id = $3';
              params.push(commentId);
            } else {
              query += ' AND comment_id IS NULL';
            }
        
            const result = await pool.query(query, params);
            return result.rows[0];
          } catch (error) {
            console.error('Ошибка в getUserLike:', error);
            throw error;
          }
    }
}

module.exports = new likeModel();
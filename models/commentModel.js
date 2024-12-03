const pool = require('../config/db');

class commentModel {
    async createComment(content, postId, userId) {
        const result = await pool.query(
            'INSERT INTO comments (content, post_id, user_id) VALUES ($1, $2, $3) RETURNING *',
            [content, postId, userId]
          );
          return result.rows[0];
    }

    async findAllCommentsByPostId(postId) {
        const result = await pool.query(`
            SELECT comments.*, users.username 
            FROM comments 
            JOIN users ON comments.user_id = users.id 
            WHERE post_id = $1
          `, [postId]);
          return result.rows;
    }

    async findCommentById(commentId) {
        const result = await pool.query('SELECT * FROM comments WHERE id = $1', [commentId]);
        return result.rows[0];
    }

    async updateComment(commentId, comment) {
        const result = await pool.query(
            'UPDATE comments SET content = $1 WHERE id = $2 RETURNING *',
            [comment.content, commentId]
          );
          return result.rows[0];
    }

    async deleteComment(commentId) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            await client.query('DELETE FROM likes WHERE comment_id = $1', [commentId]);
            const result = await client.query('DELETE FROM comments WHERE id = $1 RETURNING *', [commentId]);
            await client.query('COMMIT');
            return result.rows[0];
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async updateCommentStatus(commentId, status) {
        const result = await pool.query(
            'UPDATE comments SET status = $1 WHERE id = $2 RETURNING *',
            [status, commentId]
          );
          return result.rows[0];
    }
}

module.exports = new commentModel();
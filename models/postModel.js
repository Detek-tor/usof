const pool = require('../config/db');

class postModel {
    async createPost(title, content, userId, categoryIds) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            const result = await client.query(
            'INSERT INTO posts (title, content, user_id) VALUES ($1, $2, $3) RETURNING *',
            [title, content, userId]
            );
            const postId = result.rows[0].id;

            for (const categoryId of categoryIds) {
            await client.query(
                'INSERT INTO post_categories (post_id, category_id) VALUES ($1, $2)',
                [postId, categoryId]
            );
            }

            await client.query('COMMIT');
            return result.rows[0];
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async findAllPostsWithCategories(user) {
        let query = `
            SELECT p.*, u.username,
            COALESCE(
            JSON_AGG(
                JSON_BUILD_OBJECT('id', c.id, 'name', c.name)
            ) FILTER (WHERE c.id IS NOT NULL), 
            '[]'
            ) AS categories
            FROM posts p
            LEFT JOIN users u ON p.user_id = u.id
            LEFT JOIN post_categories pc ON p.id = pc.post_id
            LEFT JOIN categories c ON pc.category_id = c.id
        `;
        
        if (user && user.role !== 'admin') {
            query += `
            WHERE p.status = 'active' OR p.user_id = $1
            `;
        }
        
        query += `
            GROUP BY p.id, u.username
            ORDER BY p.publish_date DESC
        `;
        
        const values = user && user.role !== 'admin' ? [user.id] : [];
        const result = await pool.query(query, values);
        return result.rows;
    }

    async findAllPosts() {
        const result = await pool.query('SELECT * FROM posts');
        return result.rows;
    }

    async findPostById(postId) {
        const result = await pool.query('SELECT * FROM posts WHERE id = $1', [postId]);
        return result.rows[0];
    }

    async updatePost(postId, post, categoryIds) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const updatePostQuery = `
            UPDATE posts
            SET title = $1, content = $2
            WHERE id = $3
            RETURNING *
            `;
            const updatePostValues = [post.title, post.content, postId];
            const postResult = await client.query(updatePostQuery, updatePostValues);

            await client.query('DELETE FROM post_categories WHERE post_id = $1', [postId]);

            if (categoryIds && categoryIds.length > 0) {
            const insertCategoryQuery = 'INSERT INTO post_categories (post_id, category_id) VALUES ($1, $2)';
            for (const categoryId of categoryIds) {
                await client.query(insertCategoryQuery, [postId, categoryId]);
            }
            }

            await client.query('COMMIT');
            return postResult.rows[0];
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Ошибка при обновлении поста в базе данных:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    async deletePost(postId) {
        const result = await pool.query('DELETE FROM posts WHERE id = $1 RETURNING *', [postId]);
        return result.rows[0];
    }

    async updateLikesCount(postId, likesCount, dislikesCount) {
        const result = await pool.query(
            'UPDATE posts SET likes_count = $1, dislikes_count = $2 WHERE id = $3 RETURNING *',
            [likesCount, dislikesCount, postId]
          );
          return result.rows[0];
    }

    async updatePostStatus(postId, status) {
        if (!['active', 'not_active'].includes(status)) {
            throw new Error('Неверный статус');
          }
        
          const result = await pool.query(
            'UPDATE posts SET status = $1 WHERE id = $2 RETURNING *',
            [status, postId]
          );
          return result.rows[0];
    }
}

module.exports = new postModel();
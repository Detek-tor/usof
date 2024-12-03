const pool = require('../config/db');

class userModel {
    async createUser(username, fullName, email, password, role = 'user', avatar = 'uploads/avatar_default.jpeg', is_confirmed = false) {
        try {
            const newUserQuery = `
                INSERT INTO users (username, full_name, email, password, role, avatar, is_confirmed)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING id, username, full_name, email, role, avatar, is_confirmed
            `;
            const values = [username, fullName, email, password, role, avatar, is_confirmed];
            const { rows } = await pool.query(newUserQuery, values);
            return rows[0];
        } catch (error) {
            console.error('Ошибка при создании пользователя в базе данных:', error);
            throw error;
        }
    }

    async confirmUser(userId) {
        const query = `UPDATE users SET is_confirmed = TRUE WHERE id = $1 RETURNING *`;
        const values = [userId];

        try {
            const { rows } = await pool.query(query, values);
            return rows[0];
        } catch (error) {
            console.error('Ошибка при подтверждении пользователя:', error);
            throw error;
        }
    }

    async confirmUserById(userId) {
        const result = await pool.query(
            `UPDATE users SET is_confirmed = true WHERE id = $1 RETURNING *`,
            [userId]
        );
        return result.rows[0];
    }

    async updateUserRating(userId) {
        try {
            const postLikesResult = await pool.query(`
              SELECT type, COUNT(*) AS count
              FROM likes
              JOIN posts ON likes.post_id = posts.id
              WHERE posts.user_id = $1
              GROUP BY type
            `, [userId]);

            const commentLikesResult = await pool.query(`
                SELECT type, COUNT(*) AS count
                FROM likes
                JOIN comments ON likes.comment_id = comments.id
                WHERE comments.user_id = $1
                GROUP BY type
            `, [userId]);
        
            let rating = 0;
        
            postLikesResult.rows.forEach(row => {
                if (row.type === 'like') {
                rating += parseInt(row.count, 10);
                } else if (row.type === 'dislike') {
                rating -= parseInt(row.count, 10);
                }
            });

            commentLikesResult.rows.forEach(row => {
                if (row.type === 'like') {
                rating += parseInt(row.count, 10);
                } else if (row.type === 'dislike') {
                rating -= parseInt(row.count, 10);
                }
            });
        
            await pool.query(`
                UPDATE users
                SET rating = $1
                WHERE id = $2
            `, [rating, userId]);
        
            return rating;
            } catch (error) {
            console.error('Ошибка при обновлении рейтинга пользователя:', error);
            throw error;
            }
    }

    async findUserByEmail(email) {
        const result = await pool.query(
            `SELECT * FROM users WHERE email = $1`,
            [email]
        );
        return result.rows[0];
    }

    async findAllUsers() {
        const query = `SELECT id, username, full_name, email, role, avatar FROM users`;
        const { rows } = await pool.query(query);
        return rows;
    }

    async findUserById(userId) {
        try {
            const query = `SELECT id, username, full_name, email, role, avatar FROM users WHERE id = $1`;
            const values = [userId];
            const { rows } = await pool.query(query, values);
            return rows[0];
          } catch (error) {
            console.error('Ошибка при поиске пользователя по ID:', error);
            throw error;
          }
    }

    async updateUser(userId, fields) {
        const setClauses = [];
        const values = [];
        let index = 1;

        if (fields.username) {
            setClauses.push(`username = $${index}`);
            values.push(fields.username);
            index++;
        }

        if (fields.full_name) {
            setClauses.push(`full_name = $${index}`);
            values.push(fields.full_name);
            index++;
        }

        if (fields.email) {
            setClauses.push(`email = $${index}`);
            values.push(fields.email);
            index++;
        }

        if (fields.role) {
            setClauses.push(`role = $${index}`);
            values.push(fields.role);
            index++;
        }

        if (fields.avatar) {
            setClauses.push(`avatar = $${index}`);
            values.push(fields.avatar);
            index++;
        }

        if (fields.password) {
            setClauses.push(`password = $${index}`);
            values.push(fields.password);
            index++;
        }

        if (setClauses.length === 0) {
            throw new Error('Нет полей для обновления');
        }

        const query = `
            UPDATE users
            SET ${setClauses.join(', ')}
            WHERE id = $${index}
            RETURNING id, username, full_name, email, role, avatar
        `;
        values.push(userId);

        try {
            const { rows } = await pool.query(query, values);
            return rows[0];
        } catch (error) {
            console.error('Ошибка при обновлении пользователя:', error);
            throw error;
        }
    }

    async deleteUser(userId) {
        const query = `DELETE FROM users WHERE id = $1 RETURNING *`;
        const values = [userId];
        const { rows } = await pool.query(query, values);
        return rows[0];
    }
}

module.exports = new userModel();
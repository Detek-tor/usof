const pool = require('../config/db');

class categoryModel {
    async createCategory(name, description) {
        const result = await pool.query(
            'INSERT INTO categories (name, description) VALUES ($1, $2) RETURNING *',
            [name, description]
          );
          return result.rows[0];
    }

    async findAllCategories() {
        const result = await pool.query('SELECT * FROM categories');
        return result.rows;
    }

    async findCategoryById(categoryId) {
        const result = await pool.query('SELECT * FROM categories WHERE id = $1', [categoryId]);
        return result.rows[0];
    }

    async updateCategory(categoryId, { name, description }) {
        const result = await pool.query(
            'UPDATE categories SET name = $1, description = $2 WHERE id = $3 RETURNING *',
            [name, description, categoryId]
          );
          return result.rows[0];
    }

    async deleteCategory(categoryId) {
        const result = await pool.query(
            'DELETE FROM categories WHERE id = $1 RETURNING *',
            [categoryId]
          );
          return result.rows[0];
    }
}

module.exports = new categoryModel();
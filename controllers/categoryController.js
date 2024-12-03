const categoryModel = require('../models/categoryModel');

class categoryController {
    async createCategory(req, res) {
        try {
            const { name, description } = req.body;
            const category = await categoryModel.createCategory(name, description);
            res.status(201).json(category);
          } catch (error) {
            console.error('Ошибка при создании категории:', error);
            res.status(500).json({ message: 'Ошибка при создании категории', error: error.message });
          }
    }

    async getAllCategories(req, res) {
        try {
            const categories = await categoryModel.findAllCategories();
            res.status(200).json(categories);
          } catch (error) {
            console.error('Ошибка при получении категорий:', error);
            res.status(500).json({ message: 'Ошибка при получении категорий', error: error.message });
          }
    }

    async getCategoryById(req, res) {
        try {
            const category = await categoryModel.findCategoryById(req.params.categoryId);
            if (!category) {
              return res.status(404).json({ message: 'Категория не найдена' });
            }
            res.status(200).json(category);
          } catch (error) {
            console.error('Ошибка при получении категории:', error);
            res.status(500).json({ message: 'Ошибка при получении категории', error: error.message });
          }
    }

    async updateCategory(req, res) {
        try {
            const category = await categoryModel.updateCategory(req.params.categoryId, req.body);
            if (!category) {
              return res.status(404).json({ message: 'Категория не найдена' });
            }
            res.status(200).json(category);
          } catch (error) {
            console.error('Ошибка при обновлении категории:', error);
            res.status(500).json({ message: 'Ошибка при обновлении категории', error: error.message });
          }
    }

    async deleteCategory(req, res) {
        try {
            const category = await categoryModel.deleteCategory(req.params.categoryId);
            if (!category) {
              return res.status(404).json({ message: 'Категория не найдена' });
            }
            res.status(200).json({ message: 'Категория удалена' });
          } catch (error) {
            console.error('Ошибка при удалении категории:', error);
            res.status(500).json({ message: 'Ошибка при удалении категории', error: error.message });
          }
    }
}

module.exports = new categoryController();
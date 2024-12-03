const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel')
const sendEmail = require('../utils/mailer');

class userController {
    async updateProfile(req, res) {
        try {
            const userId = req.user.id;
            const { username, full_name, email } = req.body;
      
            if (!username || !full_name || !email) {
                return res.status(400).json({ message: 'Все поля обязательны для заполнения' });
            }
      
            const existingUser = await userModel.findUserByEmail(email);
            if (existingUser && existingUser.id !== userId) {
                return res.status(400).json({ message: 'Пользователь с таким email уже существует' });
            }
      
            const updatedUser = await userModel.updateUser(userId, { username, full_name, email });
            res.status(200).json(updatedUser);
        } catch (error) {
            console.error('Ошибка при обновлении профиля:', error);
            res.status(500).json({ message: 'Внутренняя ошибка сервера', error: error.message });
        }
    }

    async requestPasswordChange(req, res) {
        try {
            const { email } = req.body;
      
            if (!email) {
                return res.status(400).json({ message: 'Email обязательный' });
            }
      
            const user = await userModel.findUserByEmail(email);
            if (!user) {
                return res.status(400).json({ message: 'Пользователь с таким email не найден' });
            }
      
            const resetToken = jwt.sign(
                { id: user.id },
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            );
      
            const resetLink = `http://localhost:${process.env.PORT || 3000}/reset-password.html?token=${resetToken}`;
      
            const subject = 'Сброс пароля';
            const html = `
                <p>Здравствуйте, ${user.full_name}!</p>
                <p>Вы запросили сброс пароля. Нажмите на ссылку ниже, чтобы установить новый пароль:</p>
                <a href="${resetLink}">Сбросить пароль</a>
                <p>Если вы не запрашивали сброс пароля, просто проигнорируйте это письмо.</p>
            `;
      
            await sendEmail(user.email, subject, html);
      
            res.status(200).json({ message: 'Ссылка для сброса пароля отправлена на ваш email' });
        } catch (error) {
            console.error('Ошибка при запросе на смену пароля:', error);
            res.status(500).json({ message: 'Внутренняя ошибка сервера', error: error.message });
        }
    }

    async resetPassword(req, res) {
        try {
            const { token, newPassword } = req.body;
        
            if (!token || !newPassword) {
              return res.status(400).json({ message: 'Токен и новый пароль обязательны' });
            }
        
            let decoded;
            try {
              decoded = jwt.verify(token, process.env.JWT_SECRET);
            } catch (err) {
              return res.status(401).json({ message: 'Неверный или истекший токен сброса пароля' });
            }
        
            const userId = decoded.id;
        
            const hashedPassword = await bcrypt.hash(newPassword, 10);
        
            const updatedUser = await userModel.updateUser(userId, { password: hashedPassword });
        
            if (!updatedUser) {
              return res.status(404).json({ message: 'Пользователь не найден' });
            }
        
            res.status(200).json({ message: 'Пароль успешно обновлен' });
          } catch (error) {
            console.error('Ошибка при сбросе пароля:', error);
            res.status(500).json({ message: 'Внутренняя ошибка сервера', error: error.message });
          }
    }

    async changePassword(req, res) {
        try {
            const userId = req.user.id;
            const { newPassword } = req.body;
      
            if (!newPassword) {
                return res.status(400).json({ message: 'Новый пароль обязателен' });
            }
      
            const hashedPassword = await bcrypt.hash(newPassword, 10);
      
            const updatedUser = await userModel.updateUser(userId, { password: hashedPassword });
      
            if (!updatedUser) {
                return res.status(404).json({ message: 'Пользователь не найден' });
            }
      
            res.status(200).json({ message: 'Пароль успешно обновлен' });
        } catch (error) {
            console.error('Ошибка при смене пароля:', error);
            res.status(500).json({ message: 'Ошибка при смене пароля', error: error.message });
        }
    }

    async createUser(req, res) {
        try {
            const { username, full_name, email, password, role } = req.body;
            const avatar = req.file ? req.file.path.replace(/\\/g, '/') : 'uploads/avatar_default.jpeg';
        
            if (!username || !full_name || !email || !password || !role) {
              return res.status(400).json({ message: 'Все поля обязательны для заполнения' });
            }
        
            if (!['user', 'admin'].includes(role)) {
              return res.status(400).json({ message: 'Неверная роль пользователя' });
            }
        
            const existingUser = await userModel.findUserByEmail(email);
            if (existingUser) {
              return res.status(400).json({ message: 'Пользователь с таким email уже существует' });
            }
        
            const hashedPassword = await bcrypt.hash(password, 10);
        
            const user = await userModel.createUser(username, full_name, email, hashedPassword, role, avatar);
            res.status(201).json(user);
          } catch (error) {
            console.error('Ошибка при создании пользователя:', error);
            res.status(500).json({ message: 'Ошибка при создании пользователя', error: error.message });
          }
    }

    async updateAvatar(req, res) {
        try {
            if (!req.file) {
              return res.status(400).json({ message: 'Файл не загружен' });
            }
        
            const avatarPath = req.file.path.replace(/\\/g, '/');
            const userId = req.user.id;
        
            const updatedUser = await userModel.updateUser(userId, { avatar: avatarPath });
        
            res.status(200).json(updatedUser);
          } catch (error) {
            console.error('Ошибка при обновлении аватара:', error);
            res.status(500).json({ message: 'Ошибка при обновлении аватара', error: error.message });
          }
    }

    async getAllUsers(req, res) {
        try {
            const users = await userModel.findAllUsers();
            res.status(200).json(users);
          } catch (error) {
            res.status(500).json({ message: 'Ошибка при получении пользователей', error: error.message });
          }
    }

    async getUserById(req, res) {
        try {
            const user = await userModel.findUserById(req.params.userId);
            if (!user) {
              return res.status(404).json({ message: 'Пользователь не найден' });
            }
            res.status(200).json(user);
          } catch (error) {
            res.status(500).json({ message: 'Ошибка при получении пользователя', error: error.message });
          }
    }

    async updateUser(req, res) {
        try {
            const userId = req.params.userId;
            const { username, full_name, email, role } = req.body;
            const avatar = req.file ? req.file.path.replace(/\\/g, '/') : null;
        
            if (role && !['user', 'admin'].includes(role)) {
              return res.status(400).json({ message: 'Неверная роль пользователя' });
            }
        
            const fieldsToUpdate = {};
            if (username) fieldsToUpdate.username = username;
            if (full_name) fieldsToUpdate.full_name = full_name;
            if (email) fieldsToUpdate.email = email;
            if (role) fieldsToUpdate.role = role;
            if (avatar) fieldsToUpdate.avatar = avatar;
        
            if ('id' in req.body) {
              return res.status(400).json({ message: 'Нельзя изменять поле id' });
            }
        
            const updatedUser = await userModel.updateUser(userId, fieldsToUpdate);
        
            if (!updatedUser) {
              return res.status(404).json({ message: 'Пользователь не найден' });
            }
        
            res.status(200).json(updatedUser);
          } catch (error) {
            console.error('Ошибка при обновлении пользователя:', error);
            res.status(500).json({ message: 'Ошибка при обновлении пользователя', error: error.message });
          }
    }

    async getCurrentUser(req, res) {
        try {
            console.log('Получение текущего пользователя. ID:', req.user.id);
            const user = await userModel.findUserById(req.user.id);
            if (!user) {
              return res.status(404).json({ message: 'Пользователь не найден' });
            }
            res.status(200).json(user);
          } catch (error) {
            console.error('Ошибка при получении информации о пользователе:', error);
            res.status(500).json({ message: 'Ошибка при получении информации о пользователе', error: error.message });
          }
    }

    async deleteUser(req, res) {
        try {
            const userId = req.params.userId;
        
            if (userId == req.user.id) {
              return res.status(400).json({ message: 'Невозможно удалить самого себя' });
            }
        
            const user = await userModel.findUserById(userId);
            if (!user) {
              return res.status(404).json({ message: 'Пользователь не найден' });
            }
        
            const deletedUser = await userModel.deleteUser(userId);
            res.status(200).json({ message: 'Пользователь успешно удалён', user: deletedUser });
          } catch (error) {
            console.error('Ошибка при удалении пользователя:', error);
            res.status(500).json({ message: 'Ошибка при удалении пользователя', error: error.message });
          }
    }
}

module.exports = new userController();
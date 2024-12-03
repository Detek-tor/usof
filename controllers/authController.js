const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');
const sendEmail = require('../utils/mailer');

class authController {
    constructor() {
      this.register = this.register.bind(this);
      this.confirmEmail = this.confirmEmail.bind(this);
      this.login = this.login.bind(this);
    }
    async generateToken(user) {
        return jwt.sign(
            { 
                id: user.id, 
                username: user.username, 
                full_name: user.full_name, 
                email: user.email, 
                role: user.role 
            },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );
    }

    async register(req, res) {
        try {
            const { username, full_name, email, password, role } = req.body;
        
            console.log('Регистрация запроса:', { username, full_name, email, role });
        
            if (!full_name) {
              console.log('Ошибка: Полное имя отсутствует');
              return res.status(400).json({ message: 'Полное имя обязательно' });
            }
        
            if (role && !['user', 'admin'].includes(role)) {
              console.log('Ошибка: Неверная роль пользователя:', role);
              return res.status(400).json({ message: 'Неверная роль пользователя' });
            }
        
            const existingUser = await userModel.findUserByEmail(email);
            if (existingUser) {
              console.log('Ошибка: Пользователь с email уже существует:', email);
              return res.status(400).json({ message: 'Пользователь с таким email уже существует' });
            }
        
            const hashedPassword = await bcrypt.hash(password, 10);
            console.log('Хешированный пароль создан');
        
            const user = await userModel.createUser(
              username,
              full_name,
              email,
              hashedPassword,
              role || 'user',
              'uploads/avatar_default.jpeg',
              false
            );

            const confirmToken = jwt.sign(
                { id: user.id },
                process.env.JWT_SECRET,
                { expiresIn: '1d' }
            );

            const confirmLink = `http://localhost:${process.env.PORT || 3000}/api/auth/confirm/${confirmToken}`;

            const subject = 'Подтверждение регистрации';
            const html = `
                <p>Здравствуйте, ${user.full_name}!</p>
                <p>Пожалуйста, подтвердите свою регистрацию, перейдя по следующей ссылке:</p>
                <a href="${confirmLink}">Подтвердить регистрацию</a>
            `;

            const token = await this.generateToken(user);

            console.log('Пользователь создан:', user);
            await sendEmail(user.email, subject, html);
        
            res.status(201).json({ token, user });
          } catch (error) {
            console.error('Ошибка при регистрации пользователя:', error);
            res.status(500).json({ message: 'Внутренняя ошибка сервера', error: error.message });
          }
    }

    async confirmEmail(req, res) {
      try {
          const { token } = req.params;
          if (!token) {
              return res.status(400).json({ message: 'Токен подтверждения отсутствует' });
          }

          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          const userId = decoded.id;

          const user = await userModel.confirmUser(userId);
          if (!user) {
              return res.status(400).json({ message: 'Пользователь не найден' });
          }

          res.status(200).json({ message: 'Email успешно подтвержден. Теперь вы можете войти в систему.' });
      } catch (error) {
          console.error('Ошибка при подтверждении email:', error);
          res.status(400).json({ message: 'Неверный или истекший токен подтверждения' });
      }
  }

    async login(req, res) {
        try {
            const { email, password } = req.body;
        
            console.log('Запрос на авторизацию:', { email });
        
            if (!email || !password) {
              console.log('Ошибка: Отсутствует email или пароль');
              return res.status(400).json({ message: 'Email и пароль обязательны для входа' });
            }
        
            const user = await userModel.findUserByEmail(email);
            if (!user) {
              console.log('Ошибка: Пользователь с таким email не найден:', email);
              return res.status(400).json({ message: 'Неверный email или пароль' });
            }

            if (!user.is_confirmed) {
              return res.status(400).json({ message: 'Пожалуйста, подтвердите свой email для входа' });
            }
        
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
              console.log('Ошибка: Неверный пароль для email:', email);
              return res.status(400).json({ message: 'Неверный email или пароль' });
            }
        
            const token = await this.generateToken(user);
            console.log('JWT токен сгенерирован для пользователя:', user.id);
        
            res.status(200).json({ token, user });
          } catch (error) {
            console.error('Ошибка при авторизации пользователя:', error);
            res.status(500).json({ message: 'Внутренняя ошибка сервера', error: error.message });
          }
    }
}

module.exports = new authController();
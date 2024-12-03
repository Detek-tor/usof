const jwt = require('jsonwebtoken');
require('dotenv').config();

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  
  if (!authHeader) {
    return res.status(401).json({ message: 'Отсутствует заголовок авторизации' });
  }

  const token = authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Отсутствует токен' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.error('Ошибка при проверке токена:', err);
      return res.status(403).json({ message: 'Неверный токен' });
    }
    req.user = user;
    next();
  });
};

module.exports = authMiddleware;
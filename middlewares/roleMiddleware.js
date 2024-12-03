const roleMiddleware = (requiredRole) => {
    return (req, res, next) => {
      const userRole = req.user.role;
      console.log(`Проверка роли пользователя: требуется ${requiredRole}, у пользователя ${userRole}`);
      if (userRole !== requiredRole) {
        console.warn(`Доступ запрещён: требуется роль ${requiredRole}, у пользователя роль ${userRole}`);
        return res.status(403).json({ message: 'Доступ запрещён' });
      }
      next();
    };
};

module.exports = roleMiddleware;
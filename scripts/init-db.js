const { Pool } = require('pg');
const bcrypt = require('bcrypt');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: String(process.env.DB_PASSWORD),
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
});

const hashPassword = async (password) => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

const createTables = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'user',
        rating INTEGER DEFAULT 0,
        is_confirmed BOOLEAN DEFAULT FALSE,
        avatar VARCHAR(255) DEFAULT 'uploads/avatar_default.jpeg'
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS posts (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        publish_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status VARCHAR(50) NOT NULL DEFAULT 'active',
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        likes_count INTEGER DEFAULT 0,
        dislikes_count INTEGER DEFAULT 0
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS comments (
        id SERIAL PRIMARY KEY,
        content TEXT NOT NULL,
        publish_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS likes (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
        comment_id INTEGER REFERENCES comments(id) ON DELETE CASCADE,
        type VARCHAR(10) NOT NULL CHECK (type IN ('like', 'dislike')),
        UNIQUE (user_id, post_id, comment_id)
      );
    `);

    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS unique_post_like 
      ON likes (user_id, post_id) 
      WHERE comment_id IS NULL;
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS post_categories (
        id SERIAL PRIMARY KEY,
        post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
        category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
        UNIQUE (post_id, category_id)
      );
    `);

    await client.query(`
      ALTER TABLE post_categories
      DROP CONSTRAINT IF EXISTS post_categories_post_id_fkey;
    `);

    await client.query(`
      ALTER TABLE post_categories
      ADD CONSTRAINT post_categories_post_id_fkey
      FOREIGN KEY (post_id)
      REFERENCES posts(id)
      ON DELETE CASCADE;
    `);

    await client.query(`
      ALTER TABLE post_categories
      DROP CONSTRAINT IF EXISTS post_categories_category_id_fkey;
    `);

    await client.query(`
      ALTER TABLE post_categories
      ADD CONSTRAINT post_categories_category_id_fkey
      FOREIGN KEY (category_id)
      REFERENCES categories(id)
      ON DELETE CASCADE;
    `);

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating tables', error);
  } finally {
    client.release();
  }
};

const insertTestData = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await client.query('TRUNCATE TABLE comments RESTART IDENTITY CASCADE;');
    await client.query('TRUNCATE TABLE post_categories RESTART IDENTITY CASCADE;');
    await client.query('TRUNCATE TABLE likes RESTART IDENTITY CASCADE;');
    await client.query('TRUNCATE TABLE posts RESTART IDENTITY CASCADE;');
    await client.query('TRUNCATE TABLE categories RESTART IDENTITY CASCADE;');
    await client.query('TRUNCATE TABLE users RESTART IDENTITY CASCADE;');

    const adminPassword = await hashPassword('adminpass');
    const admin2Password = await hashPassword('admin2pass');
    const user1Password = await hashPassword('user1pass');
    const user2Password = await hashPassword('user2pass');

    await client.query(
      'INSERT INTO users (username, full_name, email, password, role, is_confirmed) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (email) DO NOTHING',
      ['Admin', 'Администратор', 'admin@example.com', adminPassword, 'admin', true]
    );
    await client.query(
      'INSERT INTO users (username, full_name, email, password, role, is_confirmed) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (email) DO NOTHING',
      ['Admin2', 'Администратор Два', 'admin2@example.com', admin2Password, 'admin', true]
    );

    const users = [
      { username: 'user1', full_name: 'Пользователь Один', email: 'user1@example.com', password: 'password1', is_confirmed: true},
      { username: 'user2', full_name: 'Пользователь Два', email: 'user2@example.com', password: 'password2', is_confirmed: true },
      { username: 'user3', full_name: 'Пользователь Три', email: 'user3@example.com', password: 'password3', is_confirmed: true },
      { username: 'user4', full_name: 'Пользователь Четыре', email: 'user4@example.com', password: 'password4', is_confirmed: true },
      { username: 'user5', full_name: 'Пользователь Пять', email: 'user5@example.com', password: 'password5', is_confirmed: true },
      { username: 'user6', full_name: 'Пользователь Шесть', email: 'user6@example.com', password: 'password6', is_confirmed: true },
      { username: 'user7', full_name: 'Пользователь Семь', email: 'user7@example.com', password: 'password7', is_confirmed: true },
    ];
    
    for (const user of users) {
      const hashedPwd = await hashPassword(user.password);
      await client.query(
        'INSERT INTO users (username, full_name, email, password, is_confirmed) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (email) DO NOTHING',
        [user.username, user.full_name, user.email, hashedPwd, user.is_confirmed]
      );
    }

    await client.query(`
      INSERT INTO categories (name, description)
      VALUES
      ('Общее', 'Общие обсуждения'),
      ('Программирование', 'Темы, связанные с программированием'),
      ('Музыка', 'Обсуждение музыкальных новинок'),
      ('Игры', 'Обсуждение компьютерных игр'),
      ('Фильмы', 'Обсуждение киноновинок');
    `);

    await client.query(`
      INSERT INTO posts (title, content, user_id)
      VALUES
      ('Первый Пост', 'Содержимое первого поста', 1),
      ('Второй Пост', 'Содержимое второго поста', 2),
      ('Третий Пост', 'Содержимое третьего поста', 3),
      ('Четвертый Пост', 'Содержимое четвертого поста', 4),
      ('Пятый Пост', 'Содержимое пятого поста', 5),
      ('Шестой Пост', 'Содержимое шестого поста', 6),
      ('Седьмой Пост', 'Содержимое седьмого поста', 7);
    `);

    await client.query(`
      INSERT INTO post_categories (post_id, category_id)
      VALUES
      (1, 1),
      (1, 2),
      (2, 1),
      (3, 3),
      (4, 3),
      (5, 4),
      (6, 3),
      (7, 2);
    `);

    await client.query(`
      INSERT INTO comments (content, post_id, user_id)
      VALUES
      ('Комментарий к первому посту', 1, 2),
      ('Еще один комментарий к первому посту', 1, 3),
      ('Комментарий ко второму посту', 2, 3),
      ('Комментарий к третьему посту', 3, 4),
      ('Комментарий к четвертому посту', 4, 5),
      ('Комментарий к пятому посту', 5, 6),
      ('Комментарий к шестому посту', 6, 7),
      ('Комментарий к седьмому посту', 7, 1);
    `);

    await client.query(`
      INSERT INTO likes (post_id, user_id, type)
      VALUES
      (1, 2, 'like'),
      (1, 3, 'dislike'),
      (2, 3, 'like'),
      (3, 4, 'like'),
      (7, 5, 'dislike'),
      (2, 6, 'dislike'),
      (2, 7, 'dislike'),
      (7, 1, 'like');
    `);

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error inserting test data', error);
  } finally {
    client.release();
  }
};

const initDb = async () => {
  await createTables();
  await insertTestData();
  console.log('База данных инициализирована');
  pool.end();
};

initDb();
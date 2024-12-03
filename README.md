# Q&A Service

Welcome to **Q&A Service** — a platform designed for professionals and programming enthusiasts. Here you can share your challenges and solutions, receive feedback from the community, and improve your professional profile ranking.

---

## 📋 Overview

**Q&A Service** is a user-friendly platform for communication, knowledge sharing, and problem-solving. It includes a variety of features covering post creation, commenting, liking, and profile management.

---

## ⚙️ Features

### 👩‍💼 Admin Features

#### 📂 Authentication
- Log in to the system.
- Log out of the system.
- Password reset.

#### 🧑‍🤝‍🧑 User Management
- Create users or admins.
- View all profiles.
- Update profile information.
- Delete profiles.

#### 📝 Post Management
- Create posts.
- View all posts (active and inactive).
- Edit posts (change categories or toggle active/inactive status).
- Delete posts.

#### 🗂️ Category Management
- Create categories.
- View all categories.
- Edit categories.
- Delete categories.

#### 💬 Comment Management
- Create comments.
- View all comments.
- Update comment status (active/inactive).
- Delete comments.

#### 👍 Like Management
- Add likes/dislikes to posts or comments.
- View all likes.
- Remove likes.

---

### 👤 User Features

#### 📂 Authentication
- Register a new account.
- Log in to the system.
- Log out of the system.
- Password reset.

#### 📝 Post Management
- Create posts.
- View active posts from all users and their own inactive posts.
- Edit their own posts (change categories and content).
- Delete their own posts.

#### 💬 Comment Management
- Add comments to active posts.
- View all comments for a specific post.
- Update comment status (active/inactive).
- Delete their own comments.

#### 👍 Like Management
- Add likes/dislikes to posts or comments.
- View all likes for a specific active post or comment.
- Remove their own likes.

---

## 🛠 Installation and Running the Project

### 1. Install dependencies
```sh
npm install
```
### 2. Initialize the database
```sh
npm run init-db
```
### 3. Start the project
```sh
npm start
```
#### 📋 Requirements and Dependencies
- Node.js
- npm
- PostgreSQL

## 📖 Development Stages

### Engage:

#### Initial stage focused on planning and defining project goals, emphasizing user authentication and post management.

### Investigate:

#### Research best practices for authentication, token management, and data validation. Develop the database schema for users, posts, categories, and comments.

### Act:

#### Implement routes for handling authentication, user, post, and comment operations.

## 🧩 Models and Methods

### **User Model**

| Method              | HTTP Method | Description                          |
|---------------------|-------------|--------------------------------------|
| `createUser`        | POST        | Create a new user.                   |
| `findUserByEmail`   | GET         | Find a user by email.                |
| `findAllUsers`      | GET         | Retrieve all users.                  |
| `findUserById`      | GET         | Find a user by ID.                   |
| `updateUser`        | PATCH       | Update user information.             |
| `updateUserRating`  | PATCH       | Update user rating.                  |

---

### **Post Model**

| Method                     | HTTP Method | Description                            |
|----------------------------|-------------|----------------------------------------|
| `createPost`               | POST        | Create a new post.                     |
| `findAllPostsWithCategories`| GET         | Retrieve all posts with categories.    |
| `findAllPosts`             | GET         | Retrieve all posts.                    |
| `findPostById`             | GET         | Find a post by ID.                     |
| `updatePost`               | PATCH       | Update post information.               |
| `deletePost`               | DELETE      | Delete a post.                         |
| `updateLikesCount`         | PATCH       | Update the like count for a post.      |
| `updatePostStatus`         | PATCH       | Update the status of a post.           |

---

### **Like Model**

| Method          | HTTP Method | Description                               |
|-----------------|-------------|-------------------------------------------|
| `addLike`       | POST        | Add a like/dislike to a post or comment.  |
| `removeLike`    | DELETE      | Remove a like/dislike.                   |
| `getLikesCount` | GET         | Retrieve the number of likes.            |
| `getUserLike`   | GET         | Retrieve a user's like.                  |

---

### **Comment Model**

| Method                   | HTTP Method | Description                            |
|--------------------------|-------------|----------------------------------------|
| `createComment`          | POST        | Add a comment to a post.               |
| `findAllCommentsByPostId`| GET         | Retrieve all comments for a post.      |
| `findCommentById`        | GET         | Find a comment by ID.                  |
| `updateComment`          | PATCH       | Update comment information.            |
| `deleteComment`          | DELETE      | Delete a comment.                      |
| `updateCommentStatus`    | PATCH       | Update the status of a comment.        |

---

### **Category Model**

| Method            | HTTP Method | Description                            |
|-------------------|-------------|----------------------------------------|
| `createCategory`  | POST        | Create a new category.                 |
| `findAllCategories`| GET         | Retrieve all categories.               |
| `findCategoryById`| GET         | Find a category by ID.                 |
| `updateCategory`  | PATCH       | Update category information.           |
| `deleteCategory`  | DELETE      | Delete a category.                     |

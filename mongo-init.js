// mongo-init.js
db = db.getSiblingDB('simple-MERN');
db.createCollection('users');

db.users.insertOne({
	email: 'user@example.com',
	password: '$2b$10$XxFuBoCBLtWpbd2PPerF5OEc9wTz3gK8R9OmJ8740Ho5VvR8ZTK4.',
	createdAt: new Date(),
});

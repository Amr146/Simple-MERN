import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import cookieParser from 'cookie-parser';
import router from '../../src/auth/router';

let mongoServer: MongoMemoryServer;
let app: express.Application;

beforeAll(async () => {
	mongoServer = await MongoMemoryServer.create();
	const mongoUri = mongoServer.getUri();

	app = express();
	app.use(express.json());
	app.use(cookieParser());
	app.use(router);

	await mongoose.connect(mongoUri);
});

afterAll(async () => {
	await mongoose.disconnect();
	await mongoServer.stop();
});

describe('Auth Routes Integration Test', () => {
	let accessToken: string;
	let refreshToken: string;

	it('should register a new user', async () => {
		const res = await request(app).post('/register').send({
			email: 'test@example.com',
			password: 'P@ssw0rd',
			confirmPassword: 'P@ssw0rd',
		});

		expect(res.status).toBe(201);
		expect(res.body).toHaveProperty('accessToken');
		expect(res.body).toHaveProperty('message', 'User registered successfully');

		accessToken = res.body.accessToken;
		refreshToken = res.headers['set-cookie'][0].split(';')[0].split('=')[1];
	});

	it('should login with correct credentials', async () => {
		const res = await request(app).post('/login').send({
			email: 'test@example.com',
			password: 'P@ssw0rd',
		});

		expect(res.status).toBe(200);
		expect(res.body).toHaveProperty('accessToken');
		accessToken = res.body.accessToken;
		refreshToken = res.headers['set-cookie'][0].split(';')[0].split('=')[1];
	});

	it('should access protected route with valid access token', async () => {
		const res = await request(app)
			.get('/me')
			.set('Authorization', `Bearer ${accessToken}`);
		expect(res.status).toBe(200);
		expect(res.body).toHaveProperty('email', 'test@example.com');
	});

	it('should fail to access protected route with invalid access token', async () => {
		const res = await request(app)
			.get('/me')
			.set('Authorization', 'Bearer invalidAccessToken');
		expect(res.status).toBe(401);
		expect(res.body).toHaveProperty('error', 'Invalid token');
	});

	it('should refresh the access token using the refresh token', async () => {
		const res = await request(app)
			.post('/refresh')
			.set('Cookie', `refreshToken=${refreshToken}`);
		expect(res.status).toBe(200);
		expect(res.body).toHaveProperty('accessToken');
	});

	it('should log out the user and clear the refresh token', async () => {
		const res = await request(app)
			.post('/logout')
			.set('Authorization', `Bearer ${accessToken}`)
			.set('Cookie', `refreshToken=${refreshToken}`);
		expect(res.status).toBe(200);
		expect(res.body).toHaveProperty('message', 'Logged out successfully');
	});
});

import {
	isAuthenticated,
	register,
	login,
	getData,
	logout,
	refresh,
} from '../../../src/auth/controller';

import * as userService from '../../../src/users/service';
import * as utils from '../../../src/auth/utils';
import * as blacklistService from '../../../src/auth/service';

const mockRequest = (body = {}, headers = {}, cookies = {}, user = {}) =>
	({
		body,
		headers,
		cookies,
		user,
	} as any);

const mockResponse = () => {
	const res: any = {};
	res.status = jest.fn().mockReturnValue(res);
	res.json = jest.fn().mockReturnValue(res);
	res.cookie = jest.fn().mockReturnValue(res);
	res.clearCookie = jest.fn().mockReturnValue(res);
	return res;
};

const mockUser = {
	_id: '1',
	email: 'test@test.com',
	password: 'hashedpassword',
	save: jest.fn(),
	toObject: () => ({ _id: '1', email: 'test@test.com' }),
} as any;

describe('Auth Controller Unit Tests', () => {
	beforeEach(() => jest.clearAllMocks());

	describe('register', () => {
		it('should return 400 if email is missing', async () => {
			const req = mockRequest({ email: '', password: 'Password123!' });
			const res = mockResponse();
			await register(req, res);
			expect(res.status).toHaveBeenCalledWith(400);
		});
		it('should return 400 if password is missing', async () => {
			const req = mockRequest({ email: 'test@test.com', password: '' });
			const res = mockResponse();
			await register(req, res);
			expect(res.status).toHaveBeenCalledWith(400);
		});

		it('should return 400 if email is invalid', async () => {
			jest.spyOn(utils, 'validateEmail').mockReturnValue(false);
			jest.spyOn(utils, 'validatePassword').mockReturnValue(true);
			jest.spyOn(utils, 'hashPassword').mockResolvedValue('hashed');

			const req = mockRequest({
				email: 'invalid-email',
				password: 'Password123!',
			});
			const res = mockResponse();
			await register(req, res);
			expect(res.status).toHaveBeenCalledWith(400);
		});
		it('should return 400 if password is weak', async () => {
			jest.spyOn(utils, 'validateEmail').mockReturnValue(true);
			jest.spyOn(userService, 'findUserByEmail').mockResolvedValue(null);
			jest.spyOn(utils, 'validatePassword').mockReturnValue(false);
			jest.spyOn(userService, 'createUser').mockResolvedValue(mockUser);
			const req = mockRequest({
				email: 'test@test.com',
				password: 'weakpass',
			});
			const res = mockResponse();
			await register(req, res);
			expect(res.status).toHaveBeenCalledWith(400);
		});
		it('should return 400 if user already exists', async () => {
			jest.spyOn(userService, 'findUserByEmail').mockResolvedValue(mockUser);
			const req = mockRequest({
				email: 'test@test.com',
				password: 'Password123!',
			});
			const res = mockResponse();
			await register(req, res);
			expect(res.status).toHaveBeenCalledWith(400);
		});

		it('should return 500 if password hashing fails', async () => {
			jest.spyOn(userService, 'findUserByEmail').mockResolvedValue(null);
			jest.spyOn(utils, 'validateEmail').mockReturnValue(true);
			jest.spyOn(utils, 'validatePassword').mockReturnValue(true);
			jest.spyOn(utils, 'hashPassword').mockResolvedValue('');
			const req = mockRequest({
				email: 'test@test.com',
				password: 'Password123!',
			});
			const res = mockResponse();
			await register(req, res);
			expect(res.status).toHaveBeenCalledWith(500);
		});

		it('should return 500 if user creation fails', async () => {
			jest.spyOn(userService, 'findUserByEmail').mockResolvedValue(null);
			jest.spyOn(utils, 'validateEmail').mockReturnValue(true);
			jest.spyOn(utils, 'validatePassword').mockReturnValue(true);
			jest.spyOn(utils, 'hashPassword').mockResolvedValue('hashed');
			jest
				.spyOn(userService, 'createUser')
				.mockRejectedValue(new Error('Failed to create user'));
			const req = mockRequest({
				email: 'test@test.com',
				password: 'Password123!',
			});
			const res = mockResponse();
			await register(req, res);
			expect(res.status).toHaveBeenCalledWith(500);
		});

		it('should return 500 if access token generation fails', async () => {
			jest.spyOn(userService, 'findUserByEmail').mockResolvedValue(null);
			jest.spyOn(utils, 'validateEmail').mockReturnValue(true);
			jest.spyOn(utils, 'validatePassword').mockReturnValue(true);
			jest.spyOn(utils, 'hashPassword').mockResolvedValue('hashed');
			jest.spyOn(userService, 'createUser').mockResolvedValue(mockUser);
			jest.spyOn(utils, 'generateAccessToken').mockReturnValue('');
			const req = mockRequest({
				email: 'test@test.com',
				password: 'Password123!',
			});
			const res = mockResponse();
			await register(req, res);
			expect(res.status).toHaveBeenCalledWith(500);
		});
		it('should return 500 if refresh token generation fails', async () => {
			jest.spyOn(userService, 'findUserByEmail').mockResolvedValue(null);
			jest.spyOn(utils, 'validateEmail').mockReturnValue(true);
			jest.spyOn(utils, 'validatePassword').mockReturnValue(true);
			jest.spyOn(utils, 'hashPassword').mockResolvedValue('hashed');
			jest.spyOn(userService, 'createUser').mockResolvedValue(mockUser);
			jest.spyOn(utils, 'generateAccessToken').mockReturnValue('access');
			jest.spyOn(utils, 'generateRefreshToken').mockReturnValue('');
			const req = mockRequest({
				email: 'test@test.com',
				password: 'Password123!',
			});
			const res = mockResponse();
			await register(req, res);
			expect(res.status).toHaveBeenCalledWith(500);
		});
		it('should return 500 if setting cookie fails', async () => {
			jest.spyOn(userService, 'findUserByEmail').mockResolvedValue(null);
			jest.spyOn(utils, 'validateEmail').mockReturnValue(true);
			jest.spyOn(utils, 'validatePassword').mockReturnValue(true);
			jest.spyOn(utils, 'hashPassword').mockResolvedValue('hashed');
			jest.spyOn(userService, 'createUser').mockResolvedValue(mockUser);
			jest.spyOn(utils, 'generateAccessToken').mockReturnValue('access');
			jest.spyOn(utils, 'generateRefreshToken').mockReturnValue('refresh');
			jest.spyOn(utils, 'setRefreshTokenCookie').mockImplementation(() => {
				throw new Error('Failed to set cookie');
			});
			const req = mockRequest({
				email: 'test@test.com',
				password: 'Password123!',
			});
			const res = mockResponse();

			await register(req, res);
			expect(res.status).toHaveBeenCalledWith(500);
		});

		it('should register successfully', async () => {
			jest.spyOn(userService, 'findUserByEmail').mockResolvedValue(null);
			jest.spyOn(utils, 'validateEmail').mockReturnValue(true);
			jest.spyOn(utils, 'validatePassword').mockReturnValue(true);
			jest.spyOn(utils, 'hashPassword').mockResolvedValue('hashed');
			jest.spyOn(userService, 'createUser').mockResolvedValue(mockUser);
			jest.spyOn(utils, 'generateAccessToken').mockReturnValue('access');
			jest.spyOn(utils, 'generateRefreshToken').mockReturnValue('refresh');
			jest.spyOn(utils, 'setRefreshTokenCookie').mockReturnValue(undefined);

			const req = mockRequest({
				email: 'test@test.com',
				password: 'Password123!',
			});
			const res = mockResponse();
			await register(req, res);

			expect(res.status).toHaveBeenCalledWith(201);
			expect(res.json).toHaveBeenCalledWith({
				message: 'User registered successfully',
				accessToken: 'access',
			});
		});
	});

	describe('login', () => {
		it('should return 400 if email is missing', async () => {
			const req = mockRequest({ email: '', password: 'Password123!' });
			const res = mockResponse();
			await login(req, res);
			expect(res.status).toHaveBeenCalledWith(400);
		});
		it('should return 400 if password is missing', async () => {
			const req = mockRequest({ email: 'test@test.com', password: '' });
			const res = mockResponse();
			await login(req, res);
			expect(res.status).toHaveBeenCalledWith(400);
		});
		it('should return 401 if user not found', async () => {
			jest.spyOn(userService, 'findUserByEmail').mockResolvedValue(null);
			const req = mockRequest({
				email: 'test@test.com',
				password: 'Password123!',
			});
			const res = mockResponse();
			await login(req, res);
			expect(res.status).toHaveBeenCalledWith(401);
		});
		it('should return 401 if password is incorrect', async () => {
			jest.spyOn(userService, 'findUserByEmail').mockResolvedValue(mockUser);
			jest.spyOn(utils, 'comparePassword').mockResolvedValue(false);
			const req = mockRequest({
				email: 'test@test.com',
				password: 'WrongPassword',
			});
			const res = mockResponse();
			await login(req, res);
			expect(res.status).toHaveBeenCalledWith(401);
		});
		it('should return 500 if access token generation fails', async () => {
			jest.spyOn(userService, 'findUserByEmail').mockResolvedValue(mockUser);
			jest.spyOn(utils, 'comparePassword').mockResolvedValue(true);
			jest.spyOn(utils, 'generateAccessToken').mockReturnValue('');
			const req = mockRequest({
				email: 'test@test.com',
				password: 'Password123!',
			});
			const res = mockResponse();
			await login(req, res);
			expect(res.status).toHaveBeenCalledWith(500);
		});
		it('should return 500 if refresh token generation fails', async () => {
			jest.spyOn(userService, 'findUserByEmail').mockResolvedValue(mockUser);
			jest.spyOn(utils, 'comparePassword').mockResolvedValue(true);
			jest.spyOn(utils, 'generateAccessToken').mockReturnValue('access');
			jest.spyOn(utils, 'generateRefreshToken').mockReturnValue('');
			const req = mockRequest({
				email: 'test@test.com',
				password: 'Password123!',
			});
			const res = mockResponse();
			await login(req, res);
			expect(res.status).toHaveBeenCalledWith(500);
		});
		it('should return 500 if setting cookie fails', async () => {
			jest.spyOn(userService, 'findUserByEmail').mockResolvedValue(mockUser);
			jest.spyOn(utils, 'comparePassword').mockResolvedValue(true);
			jest.spyOn(utils, 'generateAccessToken').mockReturnValue('access');
			jest.spyOn(utils, 'generateRefreshToken').mockReturnValue('refresh');
			jest.spyOn(utils, 'setRefreshTokenCookie').mockImplementation(() => {
				throw new Error('Failed to set cookie');
			});
			const req = mockRequest({
				email: 'test@test.com',
				password: 'Password123!',
			});
			const res = mockResponse();
			await login(req, res);
			expect(res.status).toHaveBeenCalledWith(500);
		});

		it('should login successfully', async () => {
			jest.spyOn(userService, 'findUserByEmail').mockResolvedValue(mockUser);
			jest.spyOn(utils, 'comparePassword').mockResolvedValue(true);
			jest.spyOn(utils, 'generateAccessToken').mockReturnValue('access');
			jest.spyOn(utils, 'generateRefreshToken').mockReturnValue('refresh');
			jest.spyOn(utils, 'setRefreshTokenCookie').mockReturnValue(undefined);

			const req = mockRequest({
				email: 'test@test.com',
				password: 'Password123!',
			});
			const res = mockResponse();
			await login(req, res);
			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.json).toHaveBeenCalledWith({
				message: 'Login successful',
				accessToken: 'access',
			});
		});
	});

	describe('getData', () => {
		it('should return 500 if user data retrieval fails', async () => {
			jest
				.spyOn(userService, 'getUserById')
				.mockRejectedValue(new Error('Failed to fetch user'));
			const req = mockRequest({}, {}, {}, { id: '1' });
			const res = mockResponse();
			await getData(req, res);
			expect(res.status).toHaveBeenCalledWith(500);
		});
		it('Should return 404 if user not found', async () => {
			jest.spyOn(userService, 'getUserById').mockResolvedValue(null);
			const req = mockRequest({}, {}, {}, { id: '1' });
			const res = mockResponse();
			await getData(req, res);
			expect(res.status).toHaveBeenCalledWith(404);
			expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
		});
		it('should return user data', async () => {
			jest.spyOn(userService, 'getUserById').mockResolvedValue(mockUser);
			const req = mockRequest({}, {}, {}, { id: '1' });
			const res = mockResponse();
			await getData(req, res);
			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.json).toHaveBeenCalledWith({
				id: '1',
				email: 'test@test.com',
			});
		});
	});

	describe('logout', () => {
		it('should handle logout', async () => {
			jest
				.spyOn(utils, 'verifyRefreshToken')
				.mockReturnValue({ exp: Date.now() / 1000 + 60 });
			jest
				.spyOn(blacklistService, 'isTokenBlacklisted')
				.mockResolvedValue(false);
			jest
				.spyOn(blacklistService, 'addTokenToBlacklist')
				.mockResolvedValue(undefined);

			const req = mockRequest({}, {}, { refreshToken: 'refresh' });
			const res = mockResponse();
			await logout(req, res);
			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.json).toHaveBeenCalledWith({
				message: 'Logged out successfully',
			});
		});
	});

	describe('refresh', () => {
		it('should refresh token', async () => {
			jest
				.spyOn(blacklistService, 'isTokenBlacklisted')
				.mockResolvedValue(false);
			jest.spyOn(utils, 'verifyRefreshToken').mockReturnValue({ id: '1' });
			jest.spyOn(utils, 'generateAccessToken').mockReturnValue('new-access');

			const req = mockRequest({}, {}, { refreshToken: 'refresh' });
			const res = mockResponse();
			await refresh(req, res);
			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.json).toHaveBeenCalledWith({ accessToken: 'new-access' });
		});
	});

	describe('isAuthenticated', () => {
		it('should pass authentication with valid token', async () => {
			jest.spyOn(utils, 'verifyAccessToken').mockReturnValue({ id: '1' });
			const next = jest.fn();
			const req = mockRequest({}, { authorization: 'Bearer token' });
			const res = mockResponse();
			await isAuthenticated(req, res, next);
			expect(next).toHaveBeenCalled();
		});

		it('should fail if token is missing', async () => {
			const req = mockRequest();
			const res = mockResponse();
			await isAuthenticated(req, res, jest.fn());
			expect(res.status).toHaveBeenCalledWith(401);
		});
	});
});

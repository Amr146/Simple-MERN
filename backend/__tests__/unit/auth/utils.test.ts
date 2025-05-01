import {
	hashPassword,
	comparePassword,
	generateAccessToken,
	generateRefreshToken,
	verifyAccessToken,
	verifyRefreshToken,
	validateEmail,
	validatePassword,
	setRefreshTokenCookie,
	clearRefreshTokenCookie,
	COOKIE_MAX_AGE,
} from '../../../src/auth/utils';
import jwt from 'jsonwebtoken';
import { Response } from 'express';

describe('Auth Utility Functions', () => {
	const testUserId = 'user123';

	describe('hashPassword()', () => {
		it('should hash the password and not return the same string', async () => {
			const password = 'MySecurePass!';
			const hashed = await hashPassword(password);
			expect(hashed).not.toBe(password);
			expect(typeof hashed).toBe('string');
		});
	});

	describe('comparePassword()', () => {
		it('should return true for correct password', async () => {
			const password = 'MySecurePass!';
			const hash = await hashPassword(password);
			const result = await comparePassword(password, hash);
			expect(result).toBe(true);
		});

		it('should return false for incorrect password', async () => {
			const hash = await hashPassword('CorrectPass');
			const result = await comparePassword('WrongPass', hash);
			expect(result).toBe(false);
		});
	});

	describe('generateAccessToken()', () => {
		it('should return a valid JWT access token', () => {
			const token = generateAccessToken(testUserId);
			const decoded = jwt.decode(token) as jwt.JwtPayload;
			expect(decoded).toHaveProperty('id', testUserId);
		});
	});

	describe('verifyAccessToken()', () => {
		it('should verify and return payload of access token', () => {
			const token = generateAccessToken(testUserId);
			const decoded = verifyAccessToken(token) as jwt.JwtPayload;
			expect(decoded).toHaveProperty('id', testUserId);
		});

		it('should throw error for invalid token', () => {
			expect(() => verifyAccessToken('invalid-token')).toThrow();
		});
	});

	describe('generateRefreshToken()', () => {
		it('should return a valid JWT refresh token', () => {
			const token = generateRefreshToken(testUserId);
			const decoded = jwt.decode(token) as jwt.JwtPayload;
			expect(decoded).toHaveProperty('id', testUserId);
		});
	});

	describe('verifyRefreshToken()', () => {
		it('should verify and return payload of refresh token', () => {
			const token = generateRefreshToken(testUserId);
			const decoded = verifyRefreshToken(token) as jwt.JwtPayload;
			expect(decoded).toHaveProperty('id', testUserId);
		});

		it('should throw error for invalid refresh token', () => {
			expect(() => verifyRefreshToken('bad-token')).toThrow();
		});
	});

	describe('validateEmail()', () => {
		it('should return true for a valid email', () => {
			expect(validateEmail('test@example.com')).toBe(true);
		});

		it('should return false for an invalid email', () => {
			expect(validateEmail('invalid-email')).toBe(false);
		});
	});

	describe('validatePassword()', () => {
		it('should return true for a strong password', () => {
			expect(validatePassword('Str0ngP@ssword!')).toBe(true);
		});

		it('should return false for a weak password', () => {
			expect(validatePassword('123')).toBe(false);
		});
	});
	describe('setRefreshTokenCookie()', () => {
		it('should set a cookie with the refresh token', () => {
			const res = {
				cookie: jest.fn(),
			} as unknown as Response;
			const refreshToken = 'testRefreshToken';
			setRefreshTokenCookie(res, refreshToken);
			expect(res.cookie).toHaveBeenCalledWith('refreshToken', refreshToken, {
				httpOnly: true,
				secure: process.env.NODE_ENV === 'production',
				sameSite: 'strict',
				maxAge: COOKIE_MAX_AGE,
			});
		});
	});
	describe('clearRefreshTokenCookie()', () => {
		it('should clear the refresh token cookie', () => {
			const res = {
				clearCookie: jest.fn(),
			} as unknown as Response;
			clearRefreshTokenCookie(res);
			expect(res.clearCookie).toHaveBeenCalledWith('refreshToken', {
				httpOnly: true,
				secure: process.env.NODE_ENV === 'production',
				sameSite: 'strict',
			});
		});
	});
});

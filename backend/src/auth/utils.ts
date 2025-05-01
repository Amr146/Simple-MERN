import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import validator from 'validator';
import { Response } from 'express';
import ms, { StringValue } from 'ms';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || '';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || '';
const JWT_EXPIRATION = process.env.JWT_EXPIRATION || '15m';
const JWT_REFRESH_EXPIRATION = process.env.JWT_REFRESH_EXPIRATION || '7d';

const COOKIE_EXPIRATION =
	(process.env.COOKIE_EXPIRATION as StringValue) || '1d';

export let COOKIE_MAX_AGE: number = 24 * 60 * 60 * 1000; // Default to 1 day in milliseconds

try {
	// convert to milliseconds using ms
	COOKIE_MAX_AGE = ms(COOKIE_EXPIRATION);
	if (!COOKIE_MAX_AGE) {
		throw new Error('Invalid time format');
	}
} catch (error) {
	console.error('Error parsing COOKIE_EXPIRATION:', (error as Error).message);
}

export const hashPassword = async (password: string) => {
	const salt = await bcrypt.genSalt(10);
	return await bcrypt.hash(password, salt);
};

export const generateAccessToken = (userId: string) => {
	return jwt.sign({ id: userId }, JWT_SECRET, {
		expiresIn: JWT_EXPIRATION as any,
	});
};

export const verifyAccessToken = (token: string) => {
	return jwt.verify(token, JWT_SECRET || '');
};

export const generateRefreshToken = (userId: string) => {
	return jwt.sign({ id: userId }, JWT_REFRESH_SECRET || '', {
		expiresIn: JWT_REFRESH_EXPIRATION as any,
	});
};

export const verifyRefreshToken = (token: string) => {
	return jwt.verify(token, JWT_REFRESH_SECRET || '');
};

export const comparePassword = async (password: string, hash: string) => {
	return await bcrypt.compare(password, hash);
};

export const validateEmail = (email: string) => {
	return validator.isEmail(email);
};

export const validatePassword = (password: string) => {
	return validator.isStrongPassword(password);
};

export const setRefreshTokenCookie = (res: Response, refreshToken: string) => {
	res.cookie('refreshToken', refreshToken, {
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'strict',
		maxAge: COOKIE_MAX_AGE,
	});
};

export const clearRefreshTokenCookie = (res: Response) => {
	res.clearCookie('refreshToken', {
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'strict',
	});
};

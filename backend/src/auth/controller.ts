import { Request, Response } from 'express';
import { addTokenToBlacklist, isTokenBlacklisted } from './service';

// Extend the Request interface to include the user property
declare global {
	namespace Express {
		interface Request {
			user?: any;
		}
	}
}

import { createUser, getUserById, findUserByEmail } from '../users/service';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import validator from 'validator';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || '';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || '';
const JWT_EXPIRATION = process.env.JWT_EXPIRATION || '15m';
const JWT_REFRESH_EXPIRATION = process.env.JWT_REFRESH_EXPIRATION || '7d';

// Get cookie expiration from environment variable
const COOKIE_EXPIRATION_MINUTES = parseInt(
	process.env.COOKIE_EXPIRATION_MINUTES || '1440',
	10
);
const COOKIE_MAX_AGE = COOKIE_EXPIRATION_MINUTES * 60 * 1000; // in ms

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

export const isAuthenticated = async (
	req: Request,
	res: Response,
	next: any
) => {
	const token = req.headers['authorization']?.split(' ')[1];
	if (!token) {
		res.status(401).json({ error: 'No token provided' });
		return;
	}
	try {
		const decoded = verifyAccessToken(token as string);
		req.user = decoded;
		next();
	} catch (error) {
		res.status(401).json({ error: 'Invalid token' });
		return;
	}
};

export const validateEmail = (email: string) => {
	return validator.isEmail(email);
};

export const validatePassword = (password: string) => {
	return validator.isStrongPassword(password);
};

export const register = async (req: Request, res: Response) => {
	const { email, password } = req.body;
	if (!email || !password) {
		return res.status(400).json({ error: 'Email and password are required' });
	}
	// Check if user already exists
	const existingUser = await findUserByEmail(email);
	if (existingUser) {
		return res.status(400).json({ error: 'User already exists' });
	}
	// Validate email and password
	if (!validateEmail(email)) {
		return res.status(400).json({ error: 'Invalid email format' });
	}
	if (!validatePassword(password)) {
		return res.status(400).json({ error: 'Password does not meet criteria' });
	}
	// Hash password
	const hashedPassword = await hashPassword(password);
	if (!hashedPassword) {
		return res.status(400).json({ error: 'Registration failed' });
	}
	// Create new user
	try {
		const user = await createUser({ email, password: hashedPassword });
		// Generate access token
		const accessToken = generateAccessToken(user._id as string);
		if (!accessToken) {
			return res.status(400).json({ error: 'Registration failed' });
		}
		// Generate refresh token
		const refreshToken = generateRefreshToken(user._id as string);
		if (!refreshToken) {
			return res.status(400).json({ error: 'Registration failed' });
		}
		if (!user) {
			return res.status(400).json({ error: 'User registration failed' });
		}
		// Set refresh token in a cookie
		res.cookie('refreshToken', refreshToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'strict',
			maxAge: COOKIE_MAX_AGE,
		});

		res.status(201).json({
			message: 'User registered successfully',
			accessToken,
		});
	} catch (error) {
		res.status(400).json({
			error:
				error instanceof Error ? error.message : 'An unknown error occurred',
		});
	}
};

export const login = async (req: Request, res: Response) => {
	const { email, password } = req.body;
	if (!email || !password) {
		return res.status(400).json({ error: 'Email and password are required' });
	}
	try {
		const user = await findUserByEmail(email);
		if (!user) {
			return res.status(401).json({ error: 'Invalid email or password' });
		}

		const isMatch = await comparePassword(password, user.password);
		if (!isMatch) {
			return res.status(401).json({ error: 'Invalid email or password' });
		}

		const accessToken = generateAccessToken(user._id as string);
		if (!accessToken) {
			return res.status(400).json({ error: 'Login failed' });
		}
		const refreshToken = generateRefreshToken(user._id as string);
		if (!refreshToken) {
			return res.status(400).json({ error: 'Login failed' });
		}

		// Set refresh token in a cookie
		res.cookie('refreshToken', refreshToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'strict',
			maxAge: COOKIE_MAX_AGE,
		});

		res.status(200).json({ message: 'Login successful', accessToken });
	} catch (error) {
		res.status(401).json({
			error:
				error instanceof Error ? error.message : 'An unknown error occurred',
		});
	}
};

export const getData = async (req: Request, res: Response) => {
	try {
		const user = await getUserById(req.user.id);
		res.status(200).json({ id: user?._id, email: user?.email });
	} catch (error) {
		res.status(404).json({
			error:
				error instanceof Error ? error.message : 'An unknown error occurred',
		});
	}
};

export const logout = async (req: Request, res: Response) => {
	const refreshToken = req.cookies?.refreshToken;
	if (!refreshToken) {
		return res.status(400).json({ error: 'Refresh token is required' });
	}

	try {
		const decoded: any = verifyRefreshToken(refreshToken);
		await isTokenBlacklisted(refreshToken).then((isBlacklisted) => {
			if (isBlacklisted) {
				return res.status(400).json({ error: 'Invalid refresh token' });
			}
		});
		// Add the refresh token to the blacklist
		await addTokenToBlacklist(refreshToken, new Date(decoded.exp * 1000));
		// Clear the cookie
		res.clearCookie('refreshToken', {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'strict',
		});
		res.status(200).json({ message: 'Logged out successfully' });
	} catch (error) {
		res.status(401).json({ error: 'Invalid refresh token' });
	}
};

export const refresh = async (req: Request, res: Response) => {
	const refreshToken = req.cookies?.refreshToken;
	if (!refreshToken) {
		return res.status(400).json({ error: 'Refresh token is required' });
	}

	try {
		const isBlacklisted = await isTokenBlacklisted(refreshToken);
		if (isBlacklisted) {
			return res.status(400).json({ error: 'Invalid refresh token' });
		}
	} catch (error) {
		return res.status(500).json({
			error:
				error instanceof Error ? error.message : 'An unknown error occurred',
		});
	}

	try {
		const decoded: any = verifyRefreshToken(refreshToken);
		const newAccessToken = generateAccessToken(decoded.id);
		res.status(200).json({ accessToken: newAccessToken });
	} catch (error) {
		res.status(401).json({ error: 'Invalid refresh token' });
	}
};

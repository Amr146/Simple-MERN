import { Request, Response } from 'express';
import { addTokenToBlacklist, isTokenBlacklisted } from './service';

import { createUser, getUserById, findUserByEmail } from '../users/service';

import {
	generateAccessToken,
	generateRefreshToken,
	verifyAccessToken,
	verifyRefreshToken,
	hashPassword,
	comparePassword,
	validateEmail,
	validatePassword,
	setRefreshTokenCookie,
	clearRefreshTokenCookie,
} from './utils';

// Extend the Request interface to include the user property
declare global {
	namespace Express {
		interface Request {
			user?: any;
		}
	}
}

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

export const register = async (req: Request, res: Response) => {
	const { email, password } = req.body;
	if (!email || !password) {
		return res.status(400).json({ error: 'Email and password are required' });
	}

	// Validate email and password
	if (!validateEmail(email)) {
		return res.status(400).json({ error: 'Invalid email format' });
	}
	if (!validatePassword(password)) {
		return res.status(400).json({ error: 'Password does not meet criteria' });
	}

	// Check if user already exists
	const existingUser = await findUserByEmail(email);
	if (existingUser) {
		return res.status(400).json({ error: 'User already exists' });
	}

	// Hash password
	const hashedPassword = await hashPassword(password);
	if (!hashedPassword) {
		return res.status(500).json({ error: 'Registration failed' });
	}
	// Create new user
	try {
		const user = await createUser({ email, password: hashedPassword });
		if (!user) {
			return res.status(500).json({ error: 'User registration failed' });
		}

		// Generate access token
		const accessToken = generateAccessToken(user._id as string);
		if (!accessToken) {
			return res.status(500).json({ error: 'Access token generation failed' });
		}

		// Generate refresh token
		const refreshToken = generateRefreshToken(user._id as string);

		if (!refreshToken) {
			return res.status(500).json({ error: 'Refresh token generation failed' });
		}

		try {
			// Set refresh token in a cookie
			setRefreshTokenCookie(res, refreshToken);
		} catch (error) {
			return res.status(500).json({ error: 'Refresh token cookie failed' });
		}

		res.status(201).json({
			message: 'User registered successfully',
			accessToken,
		});
	} catch (error) {
		res.status(500).json({
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
			return res.status(500).json({ error: 'Login failed' });
		}
		const refreshToken = generateRefreshToken(user._id as string);
		if (!refreshToken) {
			return res.status(500).json({ error: 'Login failed' });
		}
		try {
			// Set refresh token in a cookie
			setRefreshTokenCookie(res, refreshToken);
		} catch (error) {
			return res.status(500).json({ error: 'Login failed' });
		}

		res.status(200).json({ message: 'Login successful', accessToken });
	} catch (error) {
		res.status(500).json({
			error:
				error instanceof Error ? error.message : 'An unknown error occurred',
		});
	}
};

export const getData = async (req: Request, res: Response) => {
	try {
		const user = await getUserById(req.user.id);
		if (!user) {
			return res.status(404).json({ error: 'User not found' });
		}
		res.status(200).json({ id: user?._id, email: user?.email });
	} catch (error) {
		res.status(500).json({
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
		clearRefreshTokenCookie(res);
		// Send a response
		res.status(200).json({ message: 'Logged out successfully' });
	} catch (error) {
		res.status(401).json({ error: 'Invalid refresh token' });
	}
};

export const refresh = async (req: Request, res: Response) => {
	const refreshToken = req.cookies?.refreshToken;
	if (!refreshToken) {
		return res.status(401).json({ error: 'Refresh token is required' });
	}

	try {
		const isBlacklisted = await isTokenBlacklisted(refreshToken);
		if (isBlacklisted) {
			return res.status(401).json({ error: 'Invalid refresh token' });
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

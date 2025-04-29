import { Request, Response } from 'express';
import {createUser, getUserById, findUserByEmail} from '../users/service';

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import validator from 'validator';
dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET

export const generateToken = (userId: string) => {
    return jwt.sign({ id: userId }, JWT_SECRET || '', {
        expiresIn: '1h',
    });
};
export const verifyToken = (token: string) => {
    return jwt.verify(token, JWT_SECRET || '');
};
export const hashPassword = async (password: string) => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
};

export const comparePassword = async (password: string, hash: string) => {
    return await bcrypt.compare(password, hash);
};
export const isAuthenticated = async (req: Request, res: Response, next: any) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
        res.status(401).json({ error: 'No token provided' });
    }
    try {
        const decoded = verifyToken(token);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
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
        return res.status(400).json({ error: 'Registeration failed' });
    }
    // Create new user
    try {
        const user = await createUser({ email, password: hashedPassword });
        // Generate token
        const token = generateToken(user._id);
        if (!token) {
            return res.status(400).json({ error: 'Registeration failed' });
        }
        if (!user) {
            return res.status(400).json({ error: 'User registration failed' });
        }
        res.status(201).json({ message: 'User registered successfully', token });
    } catch (error) {
        res.status(400).json({ error: error.message });
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
        // Check password
        const isMatch = await comparePassword(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        // Generate token
        const token = generateToken(user._id);
        if (!token) {
            return res.status(400).json({ error: 'Login failed' });
        }        
        res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
        res.status(401).json({ error: error.message });
    }
};

export const getData = async (req: Request, res: Response) => {
    try {
        const user = await getUserById(req.user.id);
        res.status(200).json( {'id': user?._id, 'email' : user?.email} );
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
};
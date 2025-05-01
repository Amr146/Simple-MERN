import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import router from '../router';
import cookieParser from 'cookie-parser';

export const createApp = () => {
	dotenv.config();
	const app = express();
	app.use(express.json());
	app.use(cookieParser());

	const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

	const corsOptions = {
		origin: FRONTEND_URL,
		methods: ['GET', 'POST', 'PUT', 'DELETE'],
		credentials: true,
		optionSuccessStatus: 200,
	};

	app.use(cors(corsOptions));

	const PORT = process.env.PORT || 3000;
	const MONGO_URI = process.env.MONGO_URI || '';

	// Set the main router
	app.use('/api', router);

	return app;
};

import dotenv from 'dotenv';
import mongoose from 'mongoose';

import { createApp } from './utils/server';

dotenv.config();

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || '';

const app = createApp();
// Connect to MongoDB

mongoose
	.connect(MONGO_URI)
	.then(() => {
		console.log('DB connected');
		// Start the API
		app.listen(PORT, () => {
			console.log(
				`Backend server is listening on  http://localhost:${PORT} ....`
			);
			console.log('press CTRL+C to stop server');
		});
	})
	.catch((err) => console.log(err));

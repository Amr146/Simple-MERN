import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';
import router from './router';

dotenv.config();

const app = express();
app.use(express.json());

const corsOptions = {
	origin: '*',
	credentials: true, // access-control-allow-credentials:true
	optionSuccessStatus: 200,
};
app.use(cors(corsOptions));

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || '';

// Set the main router
app.use('/api', router);

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

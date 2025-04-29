import express from 'express';
import { Request, Response } from 'express';
import authRouter from './auth/router';

const router = express.Router();

router.use('/auth', authRouter);
router.get('/', (req: Request, res: Response) => {
	res.send('Hello, TypeScript with Express and MongoDB!');
});

export default router;

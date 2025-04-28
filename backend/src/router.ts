import express from 'express';
import { Request, Response } from 'express';

const router = express.Router();

router.get('/', (req: Request, res: Response) => {
	res.send('Hello, TypeScript with Express and MongoDB!');
});

export default router;

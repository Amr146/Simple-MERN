import express from 'express';
import { Request, Response } from 'express';
import {
	register,
	login,
	getData,
	isAuthenticated,
	logout,
	refresh,
} from './controller';

const router = express.Router();

router.post('/register', (req: Request, res: Response) => {
	register(req, res);
});
router.post('/login', (req: Request, res: Response) => {
	login(req, res);
});

router.get('/me', isAuthenticated, (req: Request, res: Response) => {
	getData(req, res);
});

router.post('/logout', isAuthenticated, (req: Request, res: Response) => {
	logout(req, res);
});
router.post('/refresh', (req: Request, res: Response) => {
	refresh(req, res);
});

export default router;

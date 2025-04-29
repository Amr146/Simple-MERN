import express from 'express';
import { Request, Response } from 'express';
import { register, login, getData, isAuthenticated } from './controller';

const router = express.Router();

router.post('/register', (req : Request, res: Response) => {
    register(req, res);
}
);
router.post('/login', (req : Request, res: Response) => {
    login(req, res);
}
);

router.get('/me', isAuthenticated, (req : Request, res: Response) => {
    getData(req, res);
}
);

export default router;
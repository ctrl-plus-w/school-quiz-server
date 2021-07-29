import { Router } from 'express';

import { login, validateToken } from './auth.controller';

import authenticateMiddleware from '../../middlewares/authenticate.middleware';

const router = Router();

router.post('/login', login);

router.post('/validateToken', authenticateMiddleware, validateToken);

export default router;

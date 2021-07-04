import { Router } from 'express';

import { getGlobalAnswer, getGlobalAnswers } from './answer.controller';

import { checkIsAdmin } from '../../middlewares/authorization.middleware';

const router = Router();

router.get('/', checkIsAdmin, getGlobalAnswers);
router.get('/:answerId', checkIsAdmin, getGlobalAnswer);

export default router;

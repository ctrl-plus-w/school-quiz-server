import { Router } from 'express';

import { getGlobalQuestion, getGlobalQuestions } from './question.controller';

import { checkIsAdmin } from '../../middlewares/authorization.middleware';

const router = Router();

router.get('/', checkIsAdmin, getGlobalQuestions);
router.get('/:questionId', checkIsAdmin, getGlobalQuestion);

export default router;

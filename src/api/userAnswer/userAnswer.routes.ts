import { Router } from 'express';

import { getGlobalUserAnswer, getGlobalUserAnswers } from './userAnswer.controller';

import { checkIsAdmin } from '../../middlewares/authorization.middleware';

const router = Router();

router.get('/', checkIsAdmin, getGlobalUserAnswers);
router.get('/:userAnswerId', checkIsAdmin, getGlobalUserAnswer);

export default router;

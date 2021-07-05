import { Router } from 'express';

import { createUserAnswer, deleteUserAnswer, getUserAnswer, getUserAnswers } from './userAnswer.controller';

import { checkIsAdmin } from '../../middlewares/authorization.middleware';
import { checkQuizPossesion } from '../../middlewares/checkPossesion.middleware';

const router = Router();

router.get('/', checkIsAdmin, getUserAnswers);
router.get('/:userAnswerId', checkIsAdmin, getUserAnswer);

router.post('/', checkIsAdmin, createUserAnswer);

router.delete('/:userAnswerId', checkIsAdmin, checkQuizPossesion, deleteUserAnswer);

export default router;

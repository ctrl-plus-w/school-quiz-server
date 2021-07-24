import { Router } from 'express';

import { createUserAnswer, deleteUserAnswer, getUserAnswer, getUserAnswers } from './userAnswer.controller';

import { checkIsAdmin } from '../../middlewares/authorization.middleware';
import { checkQuizModifyPermission } from '../../middlewares/checkPossesion.middleware';

const router = Router();

router.get('/', checkIsAdmin, getUserAnswers);
router.get('/:userAnswerId', checkIsAdmin, getUserAnswer);

router.post('/', checkIsAdmin, createUserAnswer);

router.delete('/:userAnswerId', checkIsAdmin, checkQuizModifyPermission, deleteUserAnswer);

export default router;

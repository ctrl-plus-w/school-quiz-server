import { Router } from 'express';

import { createAnswer, deleteAnswer, getAnswer, getAnswers } from './answer.controller';

import { checkIsAdmin } from '../../middlewares/authorization.middleware';
import { checkQuizModifyPermission } from '../../middlewares/checkPossesion.middleware';

const router = Router();

router.get('/', checkIsAdmin, getAnswers);
router.get('/:answerId', checkIsAdmin, getAnswer);

router.post('/:answerType', checkIsAdmin, checkQuizModifyPermission, createAnswer);

router.delete('/:answerId', checkIsAdmin, checkQuizModifyPermission, deleteAnswer);

export default router;

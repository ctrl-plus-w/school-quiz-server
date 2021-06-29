import { Router } from 'express';

import { createAnswer, deleteAnswer, getAnswer, getAnswers } from './answer.controller';

import { checkIsAdmin } from '../../middlewares/authorization.middleware';

const router = Router();

router.get('/', checkIsAdmin, getAnswers);
router.get('/:answerId', checkIsAdmin, getAnswer);

router.post('/:answerType', checkIsAdmin, createAnswer);

router.delete('/:answerId', checkIsAdmin, deleteAnswer);

export default router;

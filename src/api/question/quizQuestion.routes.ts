import { Router } from 'express';

import { createQuestion, deleteQuestion, getQuestion, getQuestions } from './question.controller';

import { checkIsAdmin } from '../../middlewares/authorization.middleware';
import { checkQuizPossesion } from '../../middlewares/checkPossesion.middleware';

const router = Router();

router.get('/', checkIsAdmin, getQuestions);
router.get('/:questionId', checkIsAdmin, getQuestion);

router.post('/:questionType', checkIsAdmin, checkQuizPossesion, createQuestion);

router.delete('/:questionId', checkIsAdmin, checkQuizPossesion, deleteQuestion);

export default router;

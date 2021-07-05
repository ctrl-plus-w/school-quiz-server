import { Router } from 'express';

import { createQuestion, deleteQuestion, getQuestion, getQuestions } from './question.controller';

import answerRoutes from '../answer/questionAnswer.routes';
import userAnswerRoutes from '../userAnswer/questionUserAnswer.routes';

import { checkIsAdmin } from '../../middlewares/authorization.middleware';
import { checkQuizPossesion } from '../../middlewares/checkPossesion.middleware';
import { checkQuestionExists } from '../../middlewares/checkExists.middleware';

const router = Router();

/* Quiz -> Question */

router.get('/', checkIsAdmin, getQuestions);
router.get('/:questionId', checkIsAdmin, getQuestion);

router.post('/:questionType', checkIsAdmin, checkQuizPossesion, createQuestion);

router.delete('/:questionId', checkIsAdmin, checkQuizPossesion, deleteQuestion);

/* Quiz -> Question -> Answer */

router.use('/:questionId/answers', checkQuestionExists, answerRoutes);

/* Quiz -> Question -> User Answer */

router.use('/:questionId/userAnswers', checkQuestionExists, userAnswerRoutes);

export default router;

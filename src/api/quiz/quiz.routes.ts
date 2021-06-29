import { Router } from 'express';

import { createQuiz, deleteQuiz, getQuiz, getQuizzes } from './quiz.controller';

import questionRoutes from '../question/quizQuestion.routes';

import { checkIsAdmin } from '../../middlewares/authorization.middleware';
import { checkQuizExists } from '../../middlewares/checkExists.middleware';
import { checkQuizPossesion } from '../../middlewares/checkPossesion.middleware';

const router = Router();

/* Quiz */

router.get('/', checkIsAdmin, getQuizzes);
router.get('/:quizId', checkIsAdmin, getQuiz);

router.post('/', checkIsAdmin, createQuiz);

router.delete('/:quizId', checkIsAdmin, checkQuizPossesion, deleteQuiz);

/* Quiz -> Question */

router.use('/:quizId/questions', checkQuizExists, questionRoutes);

export default router;

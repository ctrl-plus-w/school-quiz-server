import { Router } from 'express';

import { createQuiz, deleteQuiz, getQuiz, getQuizzes } from './quiz.controller';

import questionRoutes from '../question/quizQuestion.routes';

import checkPermission from '../../middlewares/authorization.middleware';
import { checkQuizExists } from '../../middlewares/checkExists.middleware';
import { checkQuizPossesion } from '../../middlewares/checkPossesion.middleware';

import roles from '../../constants/roles';

const router = Router();

/* Quiz */

router.get('/', checkPermission(roles.ADMIN.PERMISSION), getQuizzes);
router.get('/:quizId', checkPermission(roles.ADMIN.PERMISSION), getQuiz);

router.post('/', checkPermission(roles.ADMIN.PERMISSION), createQuiz);

router.delete('/:quizId', checkPermission(roles.ADMIN.PERMISSION), checkQuizPossesion, deleteQuiz);

/* Quiz -> Question */

router.use('/:quizId/questions', checkQuizExists, questionRoutes);

export default router;

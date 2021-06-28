import { Router } from 'express';

import { createQuiz, deleteQuiz, getQuiz, getQuizzes } from './quiz.controller';

import checkPermission from '../../middlewares/authorization.middleware';

import roles from '../../constants/roles';

const router = Router();

router.get('/', checkPermission(roles.ADMIN.PERMISSION), getQuizzes);
router.get('/:quizId', checkPermission(roles.ADMIN.PERMISSION), getQuiz);

router.post('/', checkPermission(roles.ADMIN.PERMISSION), createQuiz);

router.delete('/:quizId', checkPermission(roles.ADMIN.PERMISSION), deleteQuiz);

export default router;

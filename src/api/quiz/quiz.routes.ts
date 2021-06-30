import { Router } from 'express';

import {
  addCollaborator,
  createQuiz,
  deleteQuiz,
  getQuiz,
  getQuizCollaborator,
  getQuizCollaborators,
  getQuizOwner,
  getQuizzes,
  removeCollaborator,
} from './quiz.controller';

import questionRoutes from '../question/quizQuestion.routes';

import { checkIsAdmin } from '../../middlewares/authorization.middleware';
import { checkQuizExists } from '../../middlewares/checkExists.middleware';
import { checkQuizPossesion } from '../../middlewares/checkPossesion.middleware';

const router = Router();

/* Quiz */

router.get('/', checkIsAdmin, getQuizzes);
router.get('/:quizId', checkIsAdmin, getQuiz);
router.get('/:quizId/owner', checkIsAdmin, checkQuizExists, getQuizOwner);
router.get('/:quizId/collaborators', checkIsAdmin, checkQuizExists, getQuizCollaborators);
router.get('/:quizId/collaborators/:collaboratorId', checkIsAdmin, checkQuizExists, getQuizCollaborator);

router.post('/', checkIsAdmin, createQuiz);
router.post('/:quizId/collaborators', checkIsAdmin, checkQuizPossesion, addCollaborator);

router.delete('/:quizId', checkIsAdmin, checkQuizPossesion, deleteQuiz);
router.delete('/:quizId/collaborators/:collaboratorId', checkIsAdmin, checkQuizPossesion, removeCollaborator);

/* Quiz -> Question */

router.use('/:quizId/questions', checkQuizExists, questionRoutes);

export default router;

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

import { authorize, checkIsProfessor, checkIsStudent } from '../../middlewares/authorization.middleware';
import { checkQuizExists } from '../../middlewares/checkExists.middleware';
import { checkQuizOwner } from '../../middlewares/checkPossesion.middleware';

const router = Router();

/* Quiz */

router.get('/', authorize([checkIsStudent]), getQuizzes);
router.get('/:quizId', authorize([checkIsStudent]), getQuiz);
router.get('/:quizId/owner', authorize([checkIsStudent], [checkQuizExists]), getQuizOwner);
router.get('/:quizId/collaborators', authorize([checkIsStudent], [checkQuizExists]), getQuizCollaborators);
router.get(
  '/:quizId/collaborators/:collaboratorId',
  authorize([checkIsStudent], [checkQuizExists]),
  getQuizCollaborator
);

router.post('/', authorize([checkIsProfessor]), createQuiz);
router.post('/:quizId/collaborators', authorize([checkIsProfessor, checkQuizOwner]), addCollaborator);

router.delete('/:quizId', authorize([checkIsProfessor, checkQuizOwner]), deleteQuiz);
router.delete(
  '/:quizId/collaborators/:collaboratorId',
  authorize([checkIsProfessor, checkQuizOwner]),
  removeCollaborator
);

/* Quiz -> Question */

router.use('/:quizId/questions', authorize([], [checkQuizExists]), questionRoutes);

export default router;

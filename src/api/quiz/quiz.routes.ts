import { Router } from 'express';

import {
  addCollaborator,
  updateQuiz,
  deleteQuiz,
  getQuiz,
  getQuizCollaborator,
  getQuizCollaborators,
  getQuizOwner,
  getQuizzes,
  removeCollaborator,
  createQuiz,
} from './quiz.controller';

import questionRoutes from '../question/quizQuestion.routes';

import { authorize, checkIsProfessor } from '../../middlewares/authorization.middleware';
import { checkQuizExists } from '../../middlewares/checkExists.middleware';
import { checkQuizOwner } from '../../middlewares/checkPossesion.middleware';

const router = Router();

/* Quiz */

router.get('/', authorize([checkIsProfessor]), getQuizzes);
router.get('/:quizId', authorize([checkIsProfessor]), getQuiz);
router.get('/:quizId/owner', authorize([checkIsProfessor], [checkQuizExists]), getQuizOwner);
router.get('/:quizId/collaborators', authorize([checkIsProfessor], [checkQuizExists]), getQuizCollaborators);
router.get('/:quizId/collaborators/:collaboratorId', authorize([checkIsProfessor], [checkQuizExists]), getQuizCollaborator);

router.post('/', authorize([checkIsProfessor]), createQuiz);
router.post('/:quizId/collaborators', authorize([checkIsProfessor, checkQuizOwner]), addCollaborator);

router.put('/:quizId', authorize([checkIsProfessor, checkQuizOwner]), updateQuiz);

router.delete('/:quizId', authorize([checkIsProfessor, checkQuizOwner]), deleteQuiz);
router.delete('/:quizId/collaborators/:collaboratorId', authorize([checkIsProfessor, checkQuizOwner]), removeCollaborator);

/* Quiz -> Question */

router.use('/:quizId/questions', authorize([], [checkQuizExists]), questionRoutes);

export default router;

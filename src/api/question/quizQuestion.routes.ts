import { Router } from 'express';

import { createQuestion, deleteQuestion, getQuestion, getQuestions } from './question.controller';

import answerRoutes from '../answer/questionAnswer.routes';
import userAnswerRoutes from '../userAnswer/questionUserAnswer.routes';
import choiceRoutes from '../choice/questionChoice.routes';

import { authorize, checkIsProfessor } from '../../middlewares/authorization.middleware';
import { checkQuizModifyPermission } from '../../middlewares/checkPossesion.middleware';
import { checkQuestionExists } from '../../middlewares/checkExists.middleware';
import { checkIsChoice, checkIsTextualOrNumeric, checkQuestionHasType } from '../../middlewares/checkQuestionType';

const router = Router();

/* Quiz -> Question */

router.get('/', authorize([checkIsProfessor]), getQuestions);
router.get('/:questionId', authorize([checkIsProfessor]), getQuestion);

router.post('/:questionType', authorize([checkIsProfessor, checkQuizModifyPermission]), createQuestion);

router.delete('/:questionId', authorize([checkIsProfessor, checkQuizModifyPermission]), deleteQuestion);

/* Quiz -> Question -> Answer */

router.use(
  '/:questionId/answers',
  authorize([], [checkQuestionExists, checkQuestionHasType, checkIsTextualOrNumeric]),
  answerRoutes
);

/* Quiz -> Question -> User Answer */

router.use('/:questionId/userAnswers', authorize([], [checkQuestionExists]), userAnswerRoutes);

/* Quiz -> Question -> Choice */

router.use(
  '/:questionId/choices',
  authorize([], [checkQuestionExists, checkQuestionHasType, checkIsChoice]),
  choiceRoutes
);

export default router;

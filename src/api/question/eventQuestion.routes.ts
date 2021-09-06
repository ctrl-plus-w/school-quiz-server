import { Router } from 'express';

import { getQuestionsToCorrect, getQuestionToCorrect } from './question.controller';
import { updateUserAnswerValidity } from '../userAnswer/userAnswer.controller';

const router = Router();

/* Event -> Question */

router.get('/', getQuestionsToCorrect);
router.get('/:questionId', getQuestionToCorrect);

/* Event -> Question -> User answers */

router.use('/:questionId/userAnswers/:userAnswerId', updateUserAnswerValidity);

export default router;

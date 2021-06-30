import { Router } from 'express';

import { getChoiceQuestion, getChoiceQuestions } from './choiceQuestion.controller';

import { checkIsAdmin } from '../../middlewares/authorization.middleware';

const router = Router();

router.get('/', checkIsAdmin, getChoiceQuestions);
router.get('/:choiceQuestionId', checkIsAdmin, getChoiceQuestion);

export default router;

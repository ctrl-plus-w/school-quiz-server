import { Router } from 'express';

import { getChoiceQuestion, getChoiceQuestions } from './choiceQuestion.controller';

import { authorize, checkIsAdmin } from '../../middlewares/authorization.middleware';

const router = Router();

router.get('/', authorize([checkIsAdmin]), getChoiceQuestions);
router.get('/:choiceQuestionId', authorize([checkIsAdmin]), getChoiceQuestion);

export default router;

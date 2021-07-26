import { Router } from 'express';

import { getNumericQuestion, getNumericQuestions } from './numericQuestion.controller';

import { authorize, checkIsAdmin } from '../../middlewares/authorization.middleware';

const router = Router();

router.get('/', authorize([checkIsAdmin]), getNumericQuestions);
router.get('/:numericQuestionId', authorize([checkIsAdmin]), getNumericQuestion);

export default router;

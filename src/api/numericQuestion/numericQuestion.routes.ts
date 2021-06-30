import { Router } from 'express';

import { getNumericQuestion, getNumericQuestions } from './numericQuestion.controller';

import { checkIsAdmin } from '../../middlewares/authorization.middleware';

const router = Router();

router.get('/', checkIsAdmin, getNumericQuestions);
router.get('/:numericQuestionId', checkIsAdmin, getNumericQuestion);

export default router;

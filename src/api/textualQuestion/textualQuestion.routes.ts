import { Router } from 'express';

import { getTextualQuestions } from './textualQuestion.controller';

import { checkIsAdmin } from '../../middlewares/authorization.middleware';

const router = Router();

router.get('/', checkIsAdmin, getTextualQuestions);
router.get('/:textualQuestionId', checkIsAdmin, getTextualQuestions);

export default router;

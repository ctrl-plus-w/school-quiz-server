import { Router } from 'express';

import { getTextualQuestions } from './textualQuestion.controller';

import { authorize, checkIsAdmin } from '../../middlewares/authorization.middleware';

const router = Router();

router.get('/', authorize([checkIsAdmin]), getTextualQuestions);
router.get('/:textualQuestionId', authorize([checkIsAdmin]), getTextualQuestions);

export default router;

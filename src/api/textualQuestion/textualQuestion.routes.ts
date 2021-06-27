import { Router } from 'express';

import { getTextualQuestions } from './textualQuestion.controller';

import checkPermission from '../../middlewares/authorization.middleware';

import roles from '../../constants/roles';

const router = Router();

router.get('/', checkPermission(roles.ADMIN.PERMISSION), getTextualQuestions);
router.get('/:textualQuestionId', checkPermission(roles.ADMIN.PERMISSION), getTextualQuestions);

export default router;

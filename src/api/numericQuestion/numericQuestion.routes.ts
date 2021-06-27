import { Router } from 'express';

import { getNumericQuestion, getNumericQuestions } from './numericQuestion.controller';

import checkPermission from '../../middlewares/authorization.middleware';

import roles from '../../constants/roles';

const router = Router();

router.get('/', checkPermission(roles.ADMIN.PERMISSION), getNumericQuestions);
router.get('/:numericQuestionId', checkPermission(roles.ADMIN.PERMISSION), getNumericQuestion);

export default router;

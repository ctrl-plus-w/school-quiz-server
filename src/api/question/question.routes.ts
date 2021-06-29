import { Router } from 'express';

import { getGlobalQuestion, getGlobalQuestions } from './question.controller';

import checkPermission from '../../middlewares/authorization.middleware';

import roles from '../../constants/roles';

const router = Router();

router.get('/', checkPermission(roles.ADMIN.PERMISSION), getGlobalQuestions);
router.get('/:questionId', checkPermission(roles.ADMIN.PERMISSION), getGlobalQuestion);

export default router;

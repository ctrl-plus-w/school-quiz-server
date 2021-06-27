import { Router } from 'express';

import { getChoiceQuestion, getChoiceQuestions } from './choiceQuestion.controller';

import checkPermission from '../../middlewares/authorization.middleware';

import roles from '../../constants/roles';

const router = Router();

router.get('/', checkPermission(roles.ADMIN.PERMISSION), getChoiceQuestions);
router.get('/:choiceQuestionId', checkPermission(roles.ADMIN.PERMISSION), getChoiceQuestion);

export default router;

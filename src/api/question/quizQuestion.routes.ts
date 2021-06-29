import { Router } from 'express';

import { createQuestion, deleteQuestion, getQuestion, getQuestions } from './question.controller';

import checkPermission from '../../middlewares/authorization.middleware';
import { checkQuizPossesion } from '../../middlewares/checkPossesion.middleware';

import roles from '../../constants/roles';

const router = Router();

router.get('/', checkPermission(roles.ADMIN.PERMISSION), getQuestions);
router.get('/:questionId', checkPermission(roles.ADMIN.PERMISSION), getQuestion);

router.post('/:questionType', checkPermission(roles.ADMIN.PERMISSION), checkQuizPossesion, createQuestion);

router.delete('/:questionId', checkPermission(roles.ADMIN.PERMISSION), checkQuizPossesion, deleteQuestion);

export default router;

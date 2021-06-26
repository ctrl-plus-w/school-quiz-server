import { Router } from 'express';

import { deleteAnswer, getAnswer, getAnswers } from './answers.controller';

import checkPermission from '../../middlewares/authorization.middleware';

import roles from '../../constants/roles';

const router = Router();

router.get('/', checkPermission(roles.ADMIN.PERMISSION), getAnswers);
router.get('/:answerId', checkPermission(roles.ADMIN.PERMISSION), getAnswer);

router.delete('/:answerId', checkPermission(roles.ADMIN.PERMISSION), deleteAnswer);

export default router;

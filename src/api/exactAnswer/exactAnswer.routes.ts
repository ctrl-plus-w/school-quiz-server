import { Router } from 'express';

import { deleteExactAnswer, getExactAnswer, getExactAnswers } from './exactAnswer.controller';

import checkPermission from '../../middlewares/authorization.middleware';

import roles from '../../constants/roles';

const router = Router();

router.get('/', checkPermission(roles.ADMIN.PERMISSION), getExactAnswers);
router.get('/:exactAnswerId', checkPermission(roles.ADMIN.PERMISSION), getExactAnswer);

router.delete('/:exactAnswerId', checkPermission(roles.ADMIN.PERMISSION), deleteExactAnswer);

export default router;

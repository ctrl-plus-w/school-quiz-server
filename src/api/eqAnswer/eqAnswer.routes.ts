import { Router } from 'express';

import { deleteEqAnswer, getEqAnswer, getEqAnswers } from './eqAnswer.controller';

import checkPermission from '../../middlewares/authorization.middleware';

import roles from '../../constants/roles';

const router = Router();

router.get('/', checkPermission(roles.ADMIN.PERMISSION), getEqAnswers);
router.get('/:eqAnswerId', checkPermission(roles.ADMIN.PERMISSION), getEqAnswer);

router.delete('/:eqAnswerId', checkPermission(roles.ADMIN.PERMISSION), deleteEqAnswer);

export default router;

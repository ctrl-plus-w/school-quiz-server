import { Router } from 'express';

import { createGtLtAnswer, deleteGtLtAnswer, getGtLtAnswer, getGtLtAnswers } from './gtLtAnswer.controller';

import checkPermission from '../../middlewares/authorization.middleware';

import roles from '../../constants/roles';

const router = Router();

router.get('/', checkPermission(roles.ADMIN.PERMISSION), getGtLtAnswers);
router.get('/:gtLtAnswerId', checkPermission(roles.ADMIN.PERMISSION), getGtLtAnswer);

router.post('/', checkPermission(roles.ADMIN.PERMISSION), createGtLtAnswer);

router.delete('/:gtLtAnswerId', checkPermission(roles.ADMIN.PERMISSION), deleteGtLtAnswer);

export default router;

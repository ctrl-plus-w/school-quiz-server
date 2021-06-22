import { Router } from 'express';

import { createLabel, deleteLabel, getLabel, getLabels } from './label.controller';

import checkPermission from '../../middlewares/authorization.middleware';

import roles from '../../constants/roles';

const router = Router();

router.get('/', checkPermission(roles.ADMIN.PERMISSION), getLabels);
router.get('/:labelId', checkPermission(roles.ADMIN.PERMISSION), getLabel);

router.post('/', checkPermission(roles.ADMIN.PERMISSION), createLabel);

router.delete('/', checkPermission(roles.ADMIN.PERMISSION), deleteLabel);

export default router;

import { Router } from 'express';

import { getGroups, getGroup, createGroup, deleteGroup } from './group.controller';

import checkPermission from '../../middlewares/authorization.middleware';

import roles from '../../constants/roles';

const router = Router();

router.get('/', checkPermission(roles.ADMIN.PERMISSION), getGroups);
router.get('/:groupId', checkPermission(roles.ADMIN.PERMISSION), getGroup);

router.post('/', checkPermission(roles.ADMIN.PERMISSION), createGroup);

router.delete('/:groupId', checkPermission(roles.ADMIN.PERMISSION), deleteGroup);

export default router;

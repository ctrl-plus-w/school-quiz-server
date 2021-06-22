import { Router } from 'express';

import { getGroups, getGroup, createGroup, deleteGroup, getGroupLabel, getGroupLabels, addLabel, removeLabel } from './group.controller';

import checkPermission from '../../middlewares/authorization.middleware';

import roles from '../../constants/roles';

const router = Router();

router.get('/', checkPermission(roles.ADMIN.PERMISSION), getGroups);
router.get('/:groupId', checkPermission(roles.ADMIN.PERMISSION), getGroup);
router.get('/:groupId/labels', checkPermission(roles.ADMIN.PERMISSION), getGroupLabels);
router.get('/:groupId/labels/:labelId', checkPermission(roles.ADMIN.PERMISSION), getGroupLabel);

router.post('/', checkPermission(roles.ADMIN.PERMISSION), createGroup);
router.post('/:groupId/labels', checkPermission(roles.ADMIN.PERMISSION), addLabel);

router.delete('/:groupId', checkPermission(roles.ADMIN.PERMISSION), deleteGroup);
router.delete('/:groupId/labels', checkPermission(roles.ADMIN.PERMISSION), removeLabel);

export default router;

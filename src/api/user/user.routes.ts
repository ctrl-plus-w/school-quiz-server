import { Router } from 'express';

import {
  createUser,
  deleteUser,
  getRole,
  getUser,
  getUsers,
  getGroups,
  getGroup,
  setRole,
  addGroup,
  removeGroup,
} from './user.controller';

import checkPermission from '../../middlewares/authorization.middleware';

import roles from '../../constants/roles';

const router = Router();

router.get('/', checkPermission(roles.ADMIN.PERMISSION), getUsers);
router.get('/:userId', checkPermission(roles.ADMIN.PERMISSION), getUser);
router.get('/:userId/role', checkPermission(roles.ADMIN.PERMISSION), getRole);
router.get('/:userId/groups', checkPermission(roles.ADMIN.PERMISSION), getGroups);
router.get('/:userId/groups/:groupId', checkPermission(roles.ADMIN.PERMISSION), getGroup);

router.post('/', checkPermission(roles.ADMIN.PERMISSION), createUser);
router.post('/:userId/role', checkPermission(roles.ADMIN.PERMISSION), setRole);
router.post('/:userId/groups', checkPermission(roles.ADMIN.PERMISSION), addGroup);

router.delete('/:userId', checkPermission(roles.ADMIN.PERMISSION), deleteUser);
router.delete('/:userId/groups', checkPermission(roles.ADMIN.PERMISSION), removeGroup);

export default router;

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

import { checkIsAdmin } from '../../middlewares/authorization.middleware';

const router = Router();

router.get('/', checkIsAdmin, getUsers);
router.get('/:userId', checkIsAdmin, getUser);
router.get('/:userId/role', checkIsAdmin, getRole);
router.get('/:userId/groups', checkIsAdmin, getGroups);
router.get('/:userId/groups/:groupId', checkIsAdmin, getGroup);

router.post('/', checkIsAdmin, createUser);
router.post('/:userId/role', checkIsAdmin, setRole);
router.post('/:userId/groups', checkIsAdmin, addGroup);

router.delete('/:userId', checkIsAdmin, deleteUser);
router.delete('/:userId/groups', checkIsAdmin, removeGroup);

export default router;

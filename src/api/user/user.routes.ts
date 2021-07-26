import { Router } from 'express';

import {
  createUser,
  deleteUser,
  getUserRole,
  getUser,
  getUsers,
  getUserGroups,
  getUserGroup,
  setRole,
  addGroup,
  removeGroup,
} from './user.controller';

import { authorize, checkIsAdmin, checkIsProfessor } from '../../middlewares/authorization.middleware';

const router = Router();

router.get('/', authorize([checkIsProfessor]), getUsers);
router.get('/:userId', authorize([checkIsProfessor]), getUser);
router.get('/:userId/role', authorize([checkIsProfessor]), getUserRole);
router.get('/:userId/groups', authorize([checkIsProfessor]), getUserGroups);
router.get('/:userId/groups/:groupId', authorize([checkIsProfessor]), getUserGroup);

router.post('/', authorize([checkIsAdmin]), createUser);
router.post('/:userId/role', authorize([checkIsAdmin]), setRole);
router.post('/:userId/groups', authorize([checkIsAdmin]), addGroup);

router.delete('/:userId', authorize([checkIsAdmin]), deleteUser);
router.delete('/:userId/groups', authorize([checkIsAdmin]), removeGroup);

export default router;

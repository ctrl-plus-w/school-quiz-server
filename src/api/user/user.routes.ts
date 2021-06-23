import { Router } from 'express';

import { createUser, deleteUser, getUser, getUsers } from './user.controller';

import checkPermission from '../../middlewares/authorization.middleware';

import roles from '../../constants/roles';

const router = Router();

router.get('/', checkPermission(roles.ADMIN.PERMISSION), getUsers);
router.get('/:userId', checkPermission(roles.ADMIN.PERMISSION), getUser);

router.post('/', checkPermission(roles.ADMIN.PERMISSION), createUser);

router.delete('/:userId', checkPermission(roles.ADMIN.PERMISSION), deleteUser);

export default router;

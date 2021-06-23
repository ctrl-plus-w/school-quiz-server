import { Router } from 'express';

import { createRole, deleteRole, getRole, getRoles } from './role.controller';

import checkPermission from '../../middlewares/authorization.middleware';

import roles from '../../constants/roles';

const router = Router();

router.get('/', checkPermission(roles.ADMIN.PERMISSION), getRoles);
router.get('/:roleId', checkPermission(roles.ADMIN.PERMISSION), getRole);

router.post('/', checkPermission(roles.ADMIN.PERMISSION), createRole);

router.delete('/:roleId', checkPermission(roles.ADMIN.PERMISSION), deleteRole);

export default router;

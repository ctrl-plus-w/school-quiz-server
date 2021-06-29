import { Router } from 'express';

import { createRole, deleteRole, getRole, getRoles } from './role.controller';

import { checkIsAdmin } from '../../middlewares/authorization.middleware';

const router = Router();

router.get('/', checkIsAdmin, getRoles);
router.get('/:roleId', checkIsAdmin, getRole);

router.post('/', checkIsAdmin, createRole);

router.delete('/:roleId', checkIsAdmin, deleteRole);

export default router;

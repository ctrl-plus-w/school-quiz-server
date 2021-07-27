import { Router } from 'express';

import { createRole, deleteRole, getRole, getRoles, updateRole } from './role.controller';

import { authorize, checkIsAdmin, checkIsStudent } from '../../middlewares/authorization.middleware';

const router = Router();

router.get('/', authorize([checkIsStudent]), getRoles);
router.get('/:roleId', authorize([checkIsStudent]), getRole);

router.post('/', authorize([checkIsAdmin]), createRole);

router.put('/:roleId', authorize([checkIsAdmin]), updateRole);

router.delete('/:roleId', authorize([checkIsAdmin]), deleteRole);

export default router;

import { Router } from 'express';

import { getGroups } from './group.controller';

import checkPermission from '../../middlewares/authorization.middleware';

import roles from '../../constants/roles';

const router = Router();

router.get('/', checkPermission(roles.PROFESSOR.PERMISSION), getGroups);

export default router;

import { Router } from 'express';

import {
  createVerificationType,
  deleteVerificationType,
  getVerificationType,
  getVerificationTypes,
} from './verificationType.controller';

import checkPermission from '../../middlewares/authorization.middleware';

import roles from '../../constants/roles';

const router = Router();

router.get('/', checkPermission(roles.ADMIN.PERMISSION), getVerificationTypes);
router.get('/:verificationTypeId', checkPermission(roles.ADMIN.PERMISSION), getVerificationType);

router.post('/', checkPermission(roles.ADMIN.PERMISSION), createVerificationType);

router.delete('/:verificationTypeId', checkPermission(roles.ADMIN.PERMISSION), deleteVerificationType);

export default router;

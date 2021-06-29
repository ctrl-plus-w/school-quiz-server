import { Router } from 'express';

import {
  createVerificationType,
  deleteVerificationType,
  getVerificationType,
  getVerificationTypes,
} from './verificationType.controller';

import { checkIsAdmin } from '../../middlewares/authorization.middleware';

const router = Router();

router.get('/', checkIsAdmin, getVerificationTypes);
router.get('/:verificationTypeId', checkIsAdmin, getVerificationType);

router.post('/', checkIsAdmin, createVerificationType);

router.delete('/:verificationTypeId', checkIsAdmin, deleteVerificationType);

export default router;

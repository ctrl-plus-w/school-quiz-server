import { Router } from 'express';

import {
  createVerificationType,
  deleteVerificationType,
  getVerificationType,
  getVerificationTypes,
} from './verificationType.controller';

import { authorize, checkIsAdmin, checkIsProfessor } from '../../middlewares/authorization.middleware';

const router = Router();

router.get('/', authorize([checkIsProfessor]), getVerificationTypes);
router.get('/:verificationTypeId', authorize([checkIsProfessor]), getVerificationType);

router.post('/', authorize([checkIsAdmin]), createVerificationType);

router.delete('/:verificationTypeId', authorize([checkIsAdmin]), deleteVerificationType);

export default router;

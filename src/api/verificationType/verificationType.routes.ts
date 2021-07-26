import { Router } from 'express';

import {
  createVerificationType,
  deleteVerificationType,
  getVerificationType,
  getVerificationTypes,
  updateVerificationType,
} from './verificationType.controller';

import { authorize, checkIsAdmin, checkIsProfessor } from '../../middlewares/authorization.middleware';

const router = Router();

router.get('/', authorize([checkIsProfessor]), getVerificationTypes);
router.get('/:verificationTypeId', authorize([checkIsProfessor]), getVerificationType);

router.post('/', authorize([checkIsAdmin]), createVerificationType);

router.put('/:verificationTypeId', authorize([checkIsAdmin]), updateVerificationType);

router.delete('/:verificationTypeId', authorize([checkIsAdmin]), deleteVerificationType);

export default router;

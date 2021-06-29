import { Router } from 'express';

import {
  createQuestionSpecification,
  deleteQuestionSpecification,
  getQuestionSpecification,
  getQuestionSpecifications,
} from './questionSpecification.controller';

import checkPermission from '../../middlewares/authorization.middleware';

import roles from '../../constants/roles';

const router = Router();

router.get('/', checkPermission(roles.ADMIN.PERMISSION), getQuestionSpecifications);
router.get('/:questionSpecificationId', checkPermission(roles.ADMIN.PERMISSION), getQuestionSpecification);

router.post('/', checkPermission(roles.ADMIN.PERMISSION), createQuestionSpecification);

router.delete(
  '/:questionSpecificationId',
  checkPermission(roles.ADMIN.PERMISSION),
  deleteQuestionSpecification
);

export default router;

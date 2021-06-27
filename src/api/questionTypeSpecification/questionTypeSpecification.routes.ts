import { Router } from 'express';

import {
  createQuestionTypeSpecification,
  deleteQuestionTypeSpecification,
  getQuestionTypeSpecification,
  getQuestionTypeSpecifications,
} from './questionTypeSpecification.controller';

import checkPermission from '../../middlewares/authorization.middleware';

import roles from '../../constants/roles';

const router = Router();

router.get('/', checkPermission(roles.ADMIN.PERMISSION), getQuestionTypeSpecifications);
router.get('/:questionTypeSpecificationId', checkPermission(roles.ADMIN.PERMISSION), getQuestionTypeSpecification);

router.post('/', checkPermission(roles.ADMIN.PERMISSION), createQuestionTypeSpecification);

router.delete(
  '/:questionTypeSpecificationId',
  checkPermission(roles.ADMIN.PERMISSION),
  deleteQuestionTypeSpecification
);

export default router;

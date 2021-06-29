import { Router } from 'express';

import {
  createQuestionSpecification,
  deleteQuestionSpecification,
  getQuestionSpecification,
  getQuestionSpecifications,
} from './questionSpecification.controller';

import { checkIsAdmin } from '../../middlewares/authorization.middleware';

const router = Router();

router.get('/', checkIsAdmin, getQuestionSpecifications);
router.get('/:questionSpecificationId', checkIsAdmin, getQuestionSpecification);

router.post('/', checkIsAdmin, createQuestionSpecification);

router.delete('/:questionSpecificationId', checkIsAdmin, deleteQuestionSpecification);

export default router;

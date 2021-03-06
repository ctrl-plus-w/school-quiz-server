import { Router } from 'express';

import {
  createQuestionSpecification,
  deleteQuestionSpecification,
  getQuestionSpecification,
  getQuestionSpecifications,
  updateQuestionSpecification,
} from './questionSpecification.controller';

import { authorize, checkIsAdmin, checkIsProfessor } from '../../middlewares/authorization.middleware';

const router = Router();

router.get('/', authorize([checkIsProfessor]), getQuestionSpecifications);
router.get('/:questionSpecificationId', authorize([checkIsProfessor]), getQuestionSpecification);

router.post('/', authorize([checkIsAdmin]), createQuestionSpecification);

router.put('/:questionSpecificationId', authorize([checkIsAdmin]), updateQuestionSpecification);

router.delete('/:questionSpecificationId', authorize([checkIsAdmin]), deleteQuestionSpecification);

export default router;

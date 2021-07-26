import { Router } from 'express';

import { deleteComparisonAnswer, getComparisonAnswer, getComparisonAnswers } from './comparisonAnswer.controller';

import { authorize, checkIsAdmin, checkIsProfessor } from '../../middlewares/authorization.middleware';

const router = Router();

router.get('/', authorize([checkIsProfessor]), getComparisonAnswers);
router.get('/:comparisonAnswerId', authorize([checkIsProfessor]), getComparisonAnswer);

router.delete('/:comparisonAnswerId', authorize([checkIsAdmin]), deleteComparisonAnswer);

export default router;

import { Router } from 'express';

import { getComparisonAnswer, getComparisonAnswers } from './comparisonAnswer.controller';

import { authorize, checkIsProfessor } from '../../middlewares/authorization.middleware';

const router = Router();

router.get('/', authorize([checkIsProfessor]), getComparisonAnswers);
router.get('/:comparisonAnswerId', authorize([checkIsProfessor]), getComparisonAnswer);

export default router;

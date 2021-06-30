import { Router } from 'express';

import { deleteComparisonAnswer, getComparisonAnswer, getComparisonAnswers } from './comparisonAnswer.controller';

import { checkIsAdmin } from '../../middlewares/authorization.middleware';

const router = Router();

router.get('/', checkIsAdmin, getComparisonAnswers);
router.get('/:comparisonAnswerId', checkIsAdmin, getComparisonAnswer);

router.delete('/:comparisonAnswerId', checkIsAdmin, deleteComparisonAnswer);

export default router;

import { Router } from 'express';

import { deleteComparisonAnswer, getComparisonAnswer, getComparisonAnswers } from './comparisonAnswer.controller';

import checkPermission from '../../middlewares/authorization.middleware';

import roles from '../../constants/roles';

const router = Router();

router.get('/', checkPermission(roles.ADMIN.PERMISSION), getComparisonAnswers);
router.get('/:comparisonAnswerId', checkPermission(roles.ADMIN.PERMISSION), getComparisonAnswer);

router.delete('/:comparisonAnswerId', checkPermission(roles.ADMIN.PERMISSION), deleteComparisonAnswer);

export default router;

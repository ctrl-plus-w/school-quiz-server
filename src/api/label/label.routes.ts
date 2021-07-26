import { Router } from 'express';

import { createLabel, deleteLabel, getLabel, getLabels } from './label.controller';

import { authorize, checkIsAdmin, checkIsProfessor } from '../../middlewares/authorization.middleware';

const router = Router();

router.get('/', authorize([checkIsProfessor]), getLabels);
router.get('/:labelId', authorize([checkIsProfessor]), getLabel);

router.post('/', authorize([checkIsAdmin]), createLabel);

router.delete('/:labelId', authorize([checkIsAdmin]), deleteLabel);

export default router;

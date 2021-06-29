import { Router } from 'express';

import { createLabel, deleteLabel, getLabel, getLabels } from './label.controller';

import { checkIsAdmin } from '../../middlewares/authorization.middleware';

const router = Router();

router.get('/', checkIsAdmin, getLabels);
router.get('/:labelId', checkIsAdmin, getLabel);

router.post('/', checkIsAdmin, createLabel);

router.delete('/:labelId', checkIsAdmin, deleteLabel);

export default router;

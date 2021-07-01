import { Router } from 'express';

import { createState, deleteState, getState, getStates } from './state.controller';

import { checkIsAdmin } from '../../middlewares/authorization.middleware';

const router = Router();

router.get('/', checkIsAdmin, getStates);
router.get('/:stateId', checkIsAdmin, getState);

router.post('/', checkIsAdmin, createState);

router.delete('/:stateId', checkIsAdmin, deleteState);

export default router;

import { Router } from 'express';

import { createState, deleteState, getState, getStates, updateState } from './state.controller';

import { authorize, checkIsAdmin, checkIsStudent } from '../../middlewares/authorization.middleware';

const router = Router();

router.get('/', authorize([checkIsStudent]), getStates);
router.get('/:stateId', authorize([checkIsStudent]), getState);

router.post('/', authorize([checkIsAdmin]), createState);

router.put('/:stateId', authorize([checkIsAdmin]), updateState);

router.delete('/:stateId', authorize([checkIsAdmin]), deleteState);

export default router;

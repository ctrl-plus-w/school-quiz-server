import { Router } from 'express';

import { deleteExactAnswer, getExactAnswer, getExactAnswers } from './exactAnswer.controller';

import { checkIsAdmin } from '../../middlewares/authorization.middleware';

const router = Router();

router.get('/', checkIsAdmin, getExactAnswers);
router.get('/:exactAnswerId', checkIsAdmin, getExactAnswer);

router.delete('/:exactAnswerId', checkIsAdmin, deleteExactAnswer);

export default router;

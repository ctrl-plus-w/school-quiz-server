import { Router } from 'express';

import { deleteExactAnswer, getExactAnswer, getExactAnswers } from './exactAnswer.controller';

import { authorize, checkIsAdmin, checkIsProfessor } from '../../middlewares/authorization.middleware';

const router = Router();

router.get('/', authorize([checkIsProfessor]), getExactAnswers);
router.get('/:exactAnswerId', authorize([checkIsProfessor]), getExactAnswer);

router.delete('/:exactAnswerId', authorize([checkIsAdmin]), deleteExactAnswer);

export default router;

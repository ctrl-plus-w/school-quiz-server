import { Router } from 'express';

import { getExactAnswer, getExactAnswers } from './exactAnswer.controller';

import { authorize, checkIsProfessor } from '../../middlewares/authorization.middleware';

const router = Router();

router.get('/', authorize([checkIsProfessor]), getExactAnswers);
router.get('/:exactAnswerId', authorize([checkIsProfessor]), getExactAnswer);

export default router;

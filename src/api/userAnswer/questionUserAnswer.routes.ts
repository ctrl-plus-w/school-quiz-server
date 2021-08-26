import { Router } from 'express';

import { createUserAnswer, deleteUserAnswer, getUserAnswer, getUserAnswers } from './userAnswer.controller';

import { authorize, checkIsProfessor, checkIsStudent } from '../../middlewares/authorization.middleware';
import { checkQuizModifyPermission } from '../../middlewares/checkPossesion.middleware';

const router = Router();

router.get('/', authorize([checkIsStudent]), getUserAnswers);
router.get('/:userAnswerId', authorize([checkIsStudent]), getUserAnswer);

router.post('/', authorize([checkIsStudent]), createUserAnswer);

router.delete('/:userAnswerId', authorize([checkIsProfessor, checkQuizModifyPermission]), deleteUserAnswer);

export default router;

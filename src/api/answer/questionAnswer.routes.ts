import { Router } from 'express';

import { createAnswer, deleteAnswer, getAnswer, getAnswers } from './answer.controller';

import { authorize, checkIsProfessor } from '../../middlewares/authorization.middleware';
import { checkQuizModifyPermission } from '../../middlewares/checkPossesion.middleware';

const router = Router();

router.get('/', authorize([checkIsProfessor]), getAnswers);
router.get('/:answerId', authorize([checkIsProfessor]), getAnswer);

router.post('/:answerType', authorize([checkIsProfessor, checkQuizModifyPermission]), createAnswer);

router.delete('/:answerId', authorize([checkIsProfessor, checkQuizModifyPermission]), deleteAnswer);

export default router;

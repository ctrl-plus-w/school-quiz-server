import { Router } from 'express';

import { postAnswerSpreader, deleteAnswer, getAnswer, getAnswers, updateAnswer } from './answer.controller';

import { authorize, checkIsProfessor } from '../../middlewares/authorization.middleware';
import { checkQuizModifyPermission } from '../../middlewares/checkPossesion.middleware';

const router = Router();

router.get('/', authorize([checkIsProfessor]), getAnswers);
router.get('/:answerId', authorize([checkIsProfessor]), getAnswer);

router.post('/:answerType', authorize([checkIsProfessor, checkQuizModifyPermission]), postAnswerSpreader);

router.put('/:answerId', authorize([checkIsProfessor, checkQuizModifyPermission]), updateAnswer);

router.delete('/:answerId', authorize([checkIsProfessor, checkQuizModifyPermission]), deleteAnswer);

export default router;

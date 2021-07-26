import { Router } from 'express';

import { updateChoice, deleteChoice, getChoice, getChoices, createChoice } from './choice.controller';

import { authorize, checkIsProfessor } from '../../middlewares/authorization.middleware';
import { checkQuizModifyPermission } from '../../middlewares/checkPossesion.middleware';

const router = Router();

router.get('/', authorize([checkIsProfessor]), getChoices);
router.get('/:choiceId', authorize([checkIsProfessor]), getChoice);

router.post('/', authorize([checkIsProfessor, checkQuizModifyPermission]), createChoice);

router.put('/:choiceId', authorize([checkIsProfessor, checkQuizModifyPermission]), updateChoice);

router.delete('/:choiceId', authorize([checkIsProfessor, checkQuizModifyPermission]), deleteChoice);

export default router;

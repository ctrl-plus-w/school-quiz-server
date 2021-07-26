import { Router } from 'express';

import { createChoice, deleteChoice, getChoice, getChoices } from './choice.controller';

import { authorize, checkIsProfessor } from '../../middlewares/authorization.middleware';
import { checkQuizModifyPermission } from '../../middlewares/checkPossesion.middleware';

const router = Router();

router.get('/', authorize([checkIsProfessor]), getChoices);
router.get('/:choiceId', authorize([checkIsProfessor]), getChoice);

router.post('/', authorize([checkIsProfessor, checkQuizModifyPermission]), createChoice);

router.delete('/:choiceID', authorize([checkIsProfessor, checkQuizModifyPermission]), deleteChoice);

export default router;

import { Router } from 'express';

import { createChoice, deleteChoice, getChoice, getChoices } from './choice.controller';

import { checkIsAdmin } from '../../middlewares/authorization.middleware';
import { checkQuizModifyPermission } from '../../middlewares/checkPossesion.middleware';

const router = Router();

router.get('/', checkIsAdmin, getChoices);
router.get('/:choiceId', checkIsAdmin, getChoice);

router.post('/', checkIsAdmin, checkQuizModifyPermission, createChoice);

router.delete('/:choiceID', checkIsAdmin, checkQuizModifyPermission, deleteChoice);

export default router;

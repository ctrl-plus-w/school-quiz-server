import { Router } from 'express';

import { getGlobalChoice, getGlobalChoices } from './choice.controller';

import { checkIsAdmin } from '../../middlewares/authorization.middleware';

const router = Router();

router.get('/', checkIsAdmin, getGlobalChoices);
router.get('/:choiceId', checkIsAdmin, getGlobalChoice);

export default router;

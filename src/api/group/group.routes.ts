import { Router } from 'express';

import { getGroups, getGroup, createGroup, deleteGroup, getGroupLabel, getGroupLabels, addLabel, removeLabel } from './group.controller';

import { authorize, checkIsAdmin, checkIsProfessor } from '../../middlewares/authorization.middleware';

const router = Router();

router.get('/', authorize([checkIsProfessor]), getGroups);
router.get('/:groupId', authorize([checkIsProfessor]), getGroup);
router.get('/:groupId/labels', authorize([checkIsProfessor]), getGroupLabels);
router.get('/:groupId/labels/:labelId', authorize([checkIsProfessor]), getGroupLabel);

router.post('/', authorize([checkIsAdmin]), createGroup);
router.post('/:groupId/labels', authorize([checkIsAdmin]), addLabel);

router.delete('/:groupId', authorize([checkIsAdmin]), deleteGroup);
router.delete('/:groupId/labels', authorize([checkIsAdmin]), removeLabel);

export default router;

import { Router } from 'express';

import { getGroups, getGroup, updateGroup, deleteGroup, getGroupLabel, getGroupLabels, addLabel, removeLabel, createGroup } from './group.controller';

import { authorize, checkIsAdmin, checkIsProfessor } from '../../middlewares/authorization.middleware';

const router = Router();

router.get('/', authorize([checkIsProfessor]), getGroups);
router.get('/:groupId', authorize([checkIsProfessor]), getGroup);
router.get('/:groupId/labels', authorize([checkIsProfessor]), getGroupLabels);
router.get('/:groupId/labels/:labelId', authorize([checkIsProfessor]), getGroupLabel);

router.post('/', authorize([checkIsAdmin]), createGroup);
router.post('/:groupId/labels', authorize([checkIsAdmin]), addLabel);

router.put('/:groupId', authorize([checkIsAdmin]), updateGroup);

router.delete('/:groupId', authorize([checkIsAdmin]), deleteGroup);
router.delete('/:groupId/labels/:labelId', authorize([checkIsAdmin]), removeLabel);

export default router;

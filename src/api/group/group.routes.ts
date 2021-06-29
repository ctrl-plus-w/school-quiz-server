import { Router } from 'express';

import {
  getGroups,
  getGroup,
  createGroup,
  deleteGroup,
  getGroupLabel,
  getGroupLabels,
  addLabel,
  removeLabel,
} from './group.controller';

import { checkIsAdmin } from '../../middlewares/authorization.middleware';

const router = Router();

router.get('/', checkIsAdmin, getGroups);
router.get('/:groupId', checkIsAdmin, getGroup);
router.get('/:groupId/labels', checkIsAdmin, getGroupLabels);
router.get('/:groupId/labels/:labelId', checkIsAdmin, getGroupLabel);

router.post('/', checkIsAdmin, createGroup);
router.post('/:groupId/labels', checkIsAdmin, addLabel);

router.delete('/:groupId', checkIsAdmin, deleteGroup);
router.delete('/:groupId/labels', checkIsAdmin, removeLabel);

export default router;

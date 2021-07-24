import { Router } from 'express';

import {
  addCollaborator,
  createEvent,
  deleteEvent,
  getEvent,
  getEventCollaborator,
  getEventOwner,
  getEvents,
  removeCollaborator,
} from './event.controller';

import { checkIsAdmin } from '../../middlewares/authorization.middleware';
import { checkEventExists } from '../../middlewares/checkExists.middleware';
import { checkEventPossesion } from '../../middlewares/checkPossesion.middleware';

const router = Router();

/* Event */

router.get('/', checkIsAdmin, getEvents);
router.get('/:eventId', checkIsAdmin, getEvent);
router.get('/:eventId/owner', checkIsAdmin, checkEventExists, getEventOwner);
router.get('/:eventId/collaborators', checkIsAdmin, checkEventExists, getEventCollaborator);

router.post('/', checkIsAdmin, createEvent);
router.post('/:eventId/collaborators', checkIsAdmin, checkEventPossesion, addCollaborator);

router.delete('/:eventId', checkIsAdmin, checkEventPossesion, deleteEvent);
router.delete('/:eventId/collaborators/:collaboratorId', checkIsAdmin, checkEventPossesion, removeCollaborator);

export default router;

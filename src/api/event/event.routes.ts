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

import { authorize, checkIsProfessor, checkIsStudent } from '../../middlewares/authorization.middleware';
import { checkEventExists } from '../../middlewares/checkExists.middleware';
import { checkEventOwner } from '../../middlewares/checkPossesion.middleware';

const router = Router();

/* Event */

router.get('/', authorize([checkIsStudent]), getEvents);
router.get('/:eventId', authorize([checkIsStudent]), getEvent);
router.get('/:eventId/owner', authorize([checkIsStudent], [checkEventExists]), getEventOwner);
router.get('/:eventId/collaborators', authorize([checkIsStudent], [checkEventExists]), getEventCollaborator);

router.post('/', authorize([checkIsProfessor]), createEvent);
router.post('/:eventId/collaborators', authorize([checkIsProfessor, checkEventOwner]), addCollaborator);

router.delete('/:eventId', authorize([checkIsProfessor, checkEventOwner]), deleteEvent);

router.delete(
  '/:eventId/collaborators/:collaboratorId',
  authorize([checkIsProfessor, checkEventOwner]),
  removeCollaborator
);

export default router;

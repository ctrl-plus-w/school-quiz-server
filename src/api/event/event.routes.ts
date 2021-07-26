import { Router } from 'express';

import {
  addCollaborator,
  createEvent,
  deleteEvent,
  getEvent,
  getEventCollaborator,
  getEventGroup,
  getEventOwner,
  getEventQuiz,
  getEvents,
  removeCollaborator,
  updateEvent,
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
router.get('/:eventId/collaborators/:collaboratorId', authorize([checkIsStudent], [checkEventExists]), getEventCollaborator);
router.get('/:eventId/quiz', authorize([checkIsStudent], [checkEventExists]), getEventQuiz);
router.get('/:eventId/group', authorize([checkIsStudent], [checkEventExists]), getEventGroup);

router.post('/', authorize([checkIsProfessor]), createEvent);
router.post('/:eventId/collaborators', authorize([checkIsProfessor, checkEventOwner]), addCollaborator);

router.put('/:eventId', authorize([checkIsProfessor, checkEventOwner]), updateEvent);

router.delete('/:eventId', authorize([checkIsProfessor, checkEventOwner]), deleteEvent);
router.delete('/:eventId/collaborators/:collaboratorId', authorize([checkIsProfessor, checkEventOwner]), removeCollaborator);

export default router;

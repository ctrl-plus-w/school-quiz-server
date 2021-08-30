import { Router } from 'express';

import {
  addCollaborator,
  createEvent,
  deleteEvent,
  getActualEvent,
  getActualEventQuestion,
  getEvent,
  getEventCollaborator,
  getEventCollaborators,
  getEventGroup,
  getEventOwner,
  getEventQuiz,
  getEvents,
  removeCollaborator,
  updateEvent,
  warnActualEvent,
} from './event.controller';

import { authorize, checkIsProfessor, checkIsStudent } from '../../middlewares/authorization.middleware';
import { checkActualEventExists, checkEventExists } from '../../middlewares/checkExists.middleware';
import { checkIsNotBlocked } from '../../middlewares/checkAuthorization.middleware';
import { checkEventOwner } from '../../middlewares/checkPossesion.middleware';

const router = Router();

/* Event */

router.get('/', authorize([checkIsStudent]), getEvents);
router.get('/event', authorize([checkIsStudent], [checkActualEventExists]), getActualEvent);
router.get('/event/question', authorize([], [checkIsStudent, checkActualEventExists, checkIsNotBlocked]), getActualEventQuestion);
router.get('/:eventId', authorize([checkIsStudent]), getEvent);
router.get('/:eventId/owner', authorize([checkIsStudent], [checkEventExists]), getEventOwner);
router.get('/:eventId/collaborators', authorize([checkIsStudent], [checkEventExists]), getEventCollaborators);
router.get('/:eventId/collaborators/:collaboratorId', authorize([checkIsStudent], [checkEventExists]), getEventCollaborator);
router.get('/:eventId/quiz', authorize([checkIsStudent], [checkEventExists]), getEventQuiz);
router.get('/:eventId/group', authorize([checkIsStudent], [checkEventExists]), getEventGroup);

router.post('/', authorize([checkIsProfessor]), createEvent);
router.post('/event/warn', authorize([], [checkIsStudent, checkActualEventExists, checkIsNotBlocked]), warnActualEvent);
router.post('/:eventId/collaborators', authorize([checkIsProfessor, checkEventOwner]), addCollaborator);

router.put('/:eventId', authorize([checkIsProfessor, checkEventOwner]), updateEvent);

router.delete('/:eventId', authorize([checkIsProfessor, checkEventOwner]), deleteEvent);
router.delete('/:eventId/collaborators/:collaboratorId', authorize([checkIsProfessor, checkEventOwner]), removeCollaborator);

export default router;

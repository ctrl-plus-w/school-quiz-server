import { Router } from 'express';

import {
  createUser,
  deleteUser,
  getUserRole,
  getUser,
  getUsers,
  getUserGroups,
  getUserGroup,
  setRole,
  addGroup,
  removeGroup,
  getUserEvents,
  getUserQuizzes,
  getUserQuiz,
  updateUser,
  getUserEvent,
} from './user.controller';

import { authorize, checkIsAdmin, checkIsStudent } from '../../middlewares/authorization.middleware';

const router = Router();

router.get('/', authorize([checkIsStudent]), getUsers);
router.get('/:userId', authorize([checkIsStudent]), getUser);
router.get('/:userId/role', authorize([checkIsStudent]), getUserRole);
router.get('/:userId/groups', authorize([checkIsStudent]), getUserGroups);
router.get('/:userId/groups/:groupId', authorize([checkIsStudent]), getUserGroup);
router.get('/:userId/events', authorize([checkIsStudent]), getUserEvents);
router.get('/:userId/events/:eventId', authorize([checkIsStudent]), getUserEvent);
router.get('/:userId/quizzes', authorize([checkIsStudent]), getUserQuizzes);
router.get('/:userId/quizzes/:quizId', authorize([checkIsStudent]), getUserQuiz);

router.post('/', authorize([checkIsAdmin]), createUser);
router.post('/:userId/groups', authorize([checkIsAdmin]), addGroup);

router.put('/:userId', authorize([checkIsAdmin]), updateUser);
router.put('/:userId/role', authorize([checkIsAdmin]), setRole);

router.delete('/:userId', authorize([checkIsAdmin]), deleteUser);
router.delete('/:userId/groups/:groupId', authorize([checkIsAdmin]), removeGroup);

export default router;

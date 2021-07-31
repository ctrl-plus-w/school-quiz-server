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
  getUserState,
  updateUser,
  setState,
} from './user.controller';

import { authorize, checkIsAdmin, checkIsProfessor } from '../../middlewares/authorization.middleware';

const router = Router();

router.get('/', authorize([checkIsProfessor]), getUsers);
router.get('/:userId', authorize([checkIsProfessor]), getUser);
router.get('/:userId/role', authorize([checkIsProfessor]), getUserRole);
router.get('/:userId/state', authorize([checkIsProfessor]), getUserState);
router.get('/:userId/groups', authorize([checkIsProfessor]), getUserGroups);
router.get('/:userId/groups/:groupId', authorize([checkIsProfessor]), getUserGroup);
router.get('/:userId/events', authorize([checkIsProfessor]), getUserEvents);
router.get('/:userId/events/:eventId', authorize([checkIsProfessor]), getUserEvents);
router.get('/:userId/quizzes', authorize([checkIsProfessor]), getUserQuizzes);
router.get('/:userId/quizzes/:quizId', authorize([checkIsProfessor]), getUserQuiz);

router.post('/', authorize([checkIsAdmin]), createUser);
router.post('/:userId/groups', authorize([checkIsAdmin]), addGroup);

router.put('/:userId', authorize([checkIsAdmin]), updateUser);
router.put('/:userId/role', authorize([checkIsAdmin]), setRole);
router.put('/:userId/state', authorize([checkIsAdmin]), setState);

router.delete('/:userId', authorize([checkIsAdmin]), deleteUser);
router.delete('/:userId/groups/:groupId', authorize([checkIsAdmin]), removeGroup);

export default router;

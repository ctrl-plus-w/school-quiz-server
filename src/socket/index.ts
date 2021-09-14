import util from 'util';

import { Socket } from 'socket.io';
import { Op } from 'sequelize';

import { UserAnswer } from '../models/userAnswer';
import { EventWarn } from '../models/eventWarn';
import { Event } from '../models/event';
import { User } from '../models/user';

import { getValidQuestionConditions } from '../helpers/question.helper';
import { userFormatter } from '../helpers/mapper.helper';
import { getEvent } from '../helpers/socket.helper';

import { ISocketWithData } from '../types/auth.types';

import registerUserHandlers from './userHandler';
import registerQuizHandlers from './quizHandler';

import STATES from '../constants/states';

const onConnection = (_socket: Socket): void => {
  const socket = _socket as ISocketWithData;

  // const redisGetAsync = util.promisify(socket.redisClient.get).bind(socket.redisClient);
  const redisSetAsync = util.promisify(socket.redisClient.set).bind(socket.redisClient);

  registerUserHandlers(socket);
  registerQuizHandlers(socket);

  socket.on('disconnect', async () => {
    const user = socket.user;
    const role = socket.jwt.role;

    // Only apply computations on students
    if (role === 'professeur') return;

    await redisSetAsync(socket.user.id.toString(), JSON.stringify(STATES.OFFLINE));

    const [actualEvent, nextEvent] = await getEvent(user, role);
    const event = actualEvent || nextEvent;

    // Send the leave event to the professors
    if (event) {
      const warn = await EventWarn.findOne({
        include: [
          { model: User, where: { id: user.id }, attributes: [] },
          { model: Event, where: { id: event.id }, attributes: [] },
        ],
        attributes: ['amount'],
      });

      const quiz = await event.getQuiz({ attributes: ['id'] });
      const questions = await quiz.getQuestions({
        include: { model: UserAnswer, where: { [Op.or]: [{ id: null }, { userId: { [Op.not]: user.id } }] }, required: false, attributes: [] },
        where: { ...getValidQuestionConditions(user.id) },
        attributes: [],
      });

      // Update the warns if the user leave the page and if there is an actual event
      const newWarnAmount = warn ? warn.amount + 1 : 1;
      const shouldUpdateWarn = actualEvent && newWarnAmount <= 3 && questions.length > 0;

      if (shouldUpdateWarn) {
        await event.addWarnedUser(user, { through: { amount: newWarnAmount } });
      }

      socket
        .to(`professor-event-${event.id}`)
        .emit('user:update', { ...userFormatter(user), state: STATES.OFFLINE, eventWarns: [shouldUpdateWarn ? { amount: newWarnAmount } : warn] });
    }
  });
};

export default onConnection;

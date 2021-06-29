import { Sequelize as SequelizeClass } from 'sequelize/types';
import { Sequelize } from 'sequelize';

import user from './user';
import role from './role';
import group from './group';
import label from './label';
import event from './event';
import quiz from './quiz';
import textualQuestion from './textualQuestion';
import numericQuestion from './numericQuestion';
import choiceQuestion from './choiceQuestion';
import question from './question';
import questionSpecification from './questionSpecification';
import verificationType from './verificationType';
import state from './state';
import exactAnswer from './exactAnswer';
import comparisonAnswer from './comparisonAnswer';
import answer from './answer';
import userAnswer from './userAnswer';
import choice from './choice';

import config from '../config/sequelize-credentials';

if (!config.database || !config.username || !config.password) throw new Error('Invalid database credentials.');
const sequelize: SequelizeClass = new Sequelize(config.database, config.username, config.password, config);

export default {
  sequelize,
  models: {
    User: user(sequelize),
    Role: role(sequelize),
    Group: group(sequelize),
    Label: label(sequelize),

    Event: event(sequelize),
    Quiz: quiz(sequelize),

    State: state(sequelize),

    Question: question(sequelize),
    QuestionSpecification: questionSpecification(sequelize),

    TextualQuestion: textualQuestion(sequelize),
    VerificationType: verificationType(sequelize),

    NumericQuestion: numericQuestion(sequelize),

    ChoiceQuestion: choiceQuestion(sequelize),
    Choice: choice(sequelize),

    Answer: answer(sequelize),

    UserAnswer: userAnswer(sequelize),

    ExactAnswer: exactAnswer(sequelize),
    ComparisonAnswer: comparisonAnswer(sequelize),
  },
};

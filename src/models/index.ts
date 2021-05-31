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
import questionType from './questionType';
import questionTypeSpecification from './questionTypeSpecification';
import verificationType from './verificationType';
import state from './state';
import eqAnswer from './eqAnswer';
import gtltAnswer from './gtltAnswer';
import answer from './answer';
import answerType from './answerType';
import userAnswer from './userAnswer';
import choice from './choice';

const config = require(__dirname + '/../../config/sequelize-credentials.json')[process.env.NODE_ENV || 'development'];
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
    QuestionType: questionType(sequelize),
    QuestionTypeSpecification: questionTypeSpecification(sequelize),

    TextualQuestion: textualQuestion(sequelize),
    VerificationType: verificationType(sequelize),

    NumericQuestion: numericQuestion(sequelize),

    ChoiceQuestion: choiceQuestion(sequelize),
    Choice: choice(sequelize),

    Answer: answer(sequelize),
    AnswerType: answerType(sequelize),

    UserAnswer: userAnswer(sequelize),

    EqAnswer: eqAnswer(sequelize),
    GTLTAnswer: gtltAnswer(sequelize),
  },
};

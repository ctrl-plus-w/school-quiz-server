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
import exactAnswer from './exactAnswer';
import comparisonAnswer from './comparisonAnswer';
import answer from './answer';
import userAnswer from './userAnswer';
import choice from './choice';
import eventWarn from './eventWarn';
import analytic from './analytics';

import sequelize from '../database';

export default {
  sequelize,
  models: {
    User: user(sequelize),
    Role: role(sequelize),
    Group: group(sequelize),
    Label: label(sequelize),

    Event: event(sequelize),
    Quiz: quiz(sequelize),

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

    EventWarns: eventWarn(sequelize),

    Analytic: analytic(sequelize),
  },
};

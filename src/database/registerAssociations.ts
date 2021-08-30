import database from '../models';

import { UserAnswer } from '../models/userAnswer';

export default async (): Promise<void> => {
  const {
    User,
    Role,
    Group,
    Label,
    Event,
    State,
    Quiz,
    Question,
    Choice,
    TextualQuestion,
    NumericQuestion,
    ChoiceQuestion,
    VerificationType,
    QuestionSpecification,
    Answer,
    ExactAnswer,
    ComparisonAnswer,
    EventWarns,
  } = database.models;

  // User & Role relation.
  User.belongsTo(Role);
  Role.hasOne(User);

  // User & Group relation.
  const USER_GROUP_TABLENAME = 'UserGroup';
  User.belongsToMany(Group, { through: USER_GROUP_TABLENAME });
  Group.belongsToMany(User, { through: USER_GROUP_TABLENAME });

  // User & State relation.
  User.belongsTo(State);
  State.hasOne(User);

  // Group & Label relation.
  const GROUP_LABEL_TABLENAME = 'GroupLabel';
  Group.belongsToMany(Label, { through: GROUP_LABEL_TABLENAME });
  Label.belongsToMany(Group, { through: GROUP_LABEL_TABLENAME });

  // Event, Quiz, Group, Owner & Collaborators relations.
  Event.belongsTo(Quiz);
  Quiz.hasMany(Event);

  const QUIZ_COLLABORATORS_TABLENAME = 'QuizCollaborators';

  Quiz.belongsTo(User, { as: 'owner' });
  User.hasMany(Quiz, { as: { singular: 'ownedQuiz', plural: 'ownedQuizzes' }, foreignKey: 'ownerId' });

  Quiz.belongsToMany(User, { through: QUIZ_COLLABORATORS_TABLENAME, as: 'collaborators' });
  User.belongsToMany(Quiz, { through: QUIZ_COLLABORATORS_TABLENAME, as: { singular: 'collaboratedQuiz', plural: 'collaboratedQuizzes' } });

  const EVENT_COLLABORATORS_TABLENAME = 'EventCollaborators';

  Event.belongsTo(User, { as: 'owner' });
  User.hasMany(Event, { as: 'ownedEvents', foreignKey: 'ownerId', constraints: true });

  Event.belongsTo(Group);
  Group.hasMany(Event);

  Event.belongsToMany(User, { through: EVENT_COLLABORATORS_TABLENAME, as: 'collaborators' });
  User.belongsToMany(Event, { through: EVENT_COLLABORATORS_TABLENAME, as: 'collaboratedEvents' });

  // Event & User warns.
  Event.belongsToMany(User, { through: EventWarns, as: 'warnedUsers' });
  User.belongsToMany(Event, { through: EventWarns, as: 'warnedEvents' });

  Event.hasMany(EventWarns);
  EventWarns.belongsTo(Event);

  User.hasMany(EventWarns);
  EventWarns.belongsTo(User);

  // Quiz & Question relation.
  Question.belongsTo(Quiz);
  Quiz.hasMany(Question);

  const QUESTION_TYPES_DEFAULT_PROPERTIES = {
    foreignKey: 'typedQuestionId',
    constraints: false,
  };

  Question.belongsTo(TextualQuestion, QUESTION_TYPES_DEFAULT_PROPERTIES);
  TextualQuestion.hasOne(Question, {
    ...QUESTION_TYPES_DEFAULT_PROPERTIES,
    scope: { questionType: 'textualQuestion' },
  });

  Question.belongsTo(NumericQuestion, QUESTION_TYPES_DEFAULT_PROPERTIES);
  NumericQuestion.hasOne(Question, {
    ...QUESTION_TYPES_DEFAULT_PROPERTIES,
    scope: { questionType: 'numericQuestion' },
  });

  Question.belongsTo(ChoiceQuestion, QUESTION_TYPES_DEFAULT_PROPERTIES);
  ChoiceQuestion.hasOne(Question, {
    ...QUESTION_TYPES_DEFAULT_PROPERTIES,
    scope: { questionType: 'choiceQuestion' },
  });

  // Textual question & Verification type relation.
  TextualQuestion.belongsTo(VerificationType);

  // Typed questions and Question type specification relation.
  TextualQuestion.belongsTo(QuestionSpecification);
  NumericQuestion.belongsTo(QuestionSpecification);
  ChoiceQuestion.belongsTo(QuestionSpecification);

  // Choice question & Choice realtion.
  ChoiceQuestion.hasMany(Choice);
  Choice.belongsTo(ChoiceQuestion);

  // Question & QuestionAnswer relation.
  Question.hasMany(Answer);
  Answer.belongsTo(Question);

  // QuestionAnswer & AnswerTypes relations.
  const ANSWER_TYPES_DEFAULT_PROPERTIES = {
    foreignKey: 'typedAnswerId',
    constraints: false,
  };

  Answer.belongsTo(ExactAnswer, ANSWER_TYPES_DEFAULT_PROPERTIES);
  ExactAnswer.hasOne(Answer, {
    ...ANSWER_TYPES_DEFAULT_PROPERTIES,
    scope: { answerType: 'exactAnswer' },
  });

  Answer.belongsTo(ComparisonAnswer, ANSWER_TYPES_DEFAULT_PROPERTIES);
  ComparisonAnswer.hasOne(Answer, {
    ...ANSWER_TYPES_DEFAULT_PROPERTIES,
    scope: { answerType: 'comparisonAnswer' },
  });

  // UserAnswers & (User / Question) relation.
  UserAnswer.belongsTo(Question);
  Question.hasMany(UserAnswer);

  UserAnswer.belongsTo(User);
  User.hasMany(UserAnswer);
};

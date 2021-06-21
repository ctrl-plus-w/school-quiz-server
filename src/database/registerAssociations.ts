import database from '../models';

export default async () => {
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
    QuestionTypeSpecification,
    Answer,
    EqAnswer,
    GTLTAnswer,
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
  Quiz.hasOne(Event);

  Event.belongsTo(Group);
  Group.hasOne(Event);

  Event.belongsTo(User, { as: 'owner' });
  User.hasOne(Event);

  const EVENT_COLLABORATORS_TABLENAME = 'Collaborators';
  Event.belongsToMany(User, { through: EVENT_COLLABORATORS_TABLENAME, as: 'collaborators' });
  User.belongsToMany(Event, { through: EVENT_COLLABORATORS_TABLENAME });

  // Quiz & Question relation.
  const QUIZ_QUESTION_TABLENAME = 'QuizQuestion';
  Quiz.belongsToMany(Question, { through: QUIZ_QUESTION_TABLENAME });
  Question.belongsToMany(Quiz, { through: QUIZ_QUESTION_TABLENAME });

  const QUESTION_TYPES_DEFAULT_PROPERTIES = {
    foreignKey: 'typedQuestionId',
    constraints: false,
  };

  Question.belongsTo(TextualQuestion, QUESTION_TYPES_DEFAULT_PROPERTIES);
  TextualQuestion.hasOne(Question, { ...QUESTION_TYPES_DEFAULT_PROPERTIES, scope: { questionType: 'textualQuestion' } });

  Question.belongsTo(NumericQuestion, QUESTION_TYPES_DEFAULT_PROPERTIES);
  NumericQuestion.hasOne(Question, { ...QUESTION_TYPES_DEFAULT_PROPERTIES, scope: { questionType: 'numericQuestion' } });

  Question.belongsTo(ChoiceQuestion, QUESTION_TYPES_DEFAULT_PROPERTIES);
  ChoiceQuestion.hasOne(Question, { ...QUESTION_TYPES_DEFAULT_PROPERTIES, scope: { questionType: 'choiceQuestion' } });

  // Textual question & Verification type relation.
  TextualQuestion.belongsTo(VerificationType);

  // Typed questions and Question type specification relation.
  TextualQuestion.belongsTo(QuestionTypeSpecification);
  NumericQuestion.belongsTo(QuestionTypeSpecification);
  ChoiceQuestion.belongsTo(QuestionTypeSpecification);

  // Numeric question & Choice realtion.
  const CHOICE_QUESTION_CHOICE_TABLENAME = 'ChoiceQuestionChoice';
  ChoiceQuestion.belongsToMany(Choice, { through: CHOICE_QUESTION_CHOICE_TABLENAME });
  Choice.belongsToMany(ChoiceQuestion, { through: CHOICE_QUESTION_CHOICE_TABLENAME });

  // Question & QuestionAnswer relation.
  const QUESTION_ANSWER_TABLENAME = 'QuestionAnswer';
  Question.belongsToMany(Answer, { through: QUESTION_ANSWER_TABLENAME });
  Answer.belongsToMany(Question, { through: QUESTION_ANSWER_TABLENAME });

  // QuestionAnswer & AnswerTypes relations.
  const ANSWER_TYPES_DEFAULT_PROPERTIES = {
    foreignKey: 'typedAnswerId',
    constraints: false,
  };

  Answer.belongsTo(EqAnswer, ANSWER_TYPES_DEFAULT_PROPERTIES);
  EqAnswer.hasOne(Answer, { ...ANSWER_TYPES_DEFAULT_PROPERTIES, scope: { answerType: 'eqAnswer' } });

  Answer.belongsTo(GTLTAnswer, ANSWER_TYPES_DEFAULT_PROPERTIES);
  GTLTAnswer.hasOne(Answer, { ...ANSWER_TYPES_DEFAULT_PROPERTIES, scope: { answerType: 'gtLtAnswer' } });
};

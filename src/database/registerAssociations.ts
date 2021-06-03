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
    TextualQuestion,
    NumericQuestion,
    ChoiceQuestion,
    VerificationType,
    QuestionTypeSpecification,
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

  Question.belongsTo(TextualQuestion, {
    foreignKey: 'questionnableId',
    constraints: false,
  });
  TextualQuestion.hasOne(Question, {
    foreignKey: 'questionnableId',
    constraints: false,

    scope: {
      questionType: 'textualQuestion',
    },
  });

  Question.belongsTo(NumericQuestion, {
    foreignKey: 'questionnableId',
    constraints: false,
  });
  NumericQuestion.hasOne(Question, {
    foreignKey: 'questionnableId',
    constraints: false,

    scope: {
      questionType: 'numericQuestion',
    },
  });

  Question.belongsTo(ChoiceQuestion, {
    foreignKey: 'questionnableId',
    constraints: false,
  });
  ChoiceQuestion.hasOne(Question, {
    foreignKey: 'questionnableId',
    constraints: false,

    scope: {
      questionType: 'choiceQuestion',
    },
  });

  // Textual question & Verification type relation.
  TextualQuestion.belongsTo(VerificationType);

  // Typed questions and Question type specification relation.
  TextualQuestion.belongsTo(QuestionTypeSpecification);
  NumericQuestion.belongsTo(QuestionTypeSpecification);
  ChoiceQuestion.belongsTo(QuestionTypeSpecification);
};

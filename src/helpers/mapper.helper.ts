import { Answer, FormattedAnswer } from '../models/answer';
import { FormattedQuestion, Question } from '../models/question';
import { FormattedQuiz, Quiz } from '../models/quiz';
import { FormattedUser, User } from '../models/user';
import { FormattedUserAnswer, UserAnswer } from '../models/userAnswer';
import { Event, FormattedEvent } from '../models/event';
import { Group } from '../models/group';

const isNull = <Type>(value: Type | null | undefined): value is Type => {
  return value === null || value === undefined;
};

const isNotNull = <Type>(value: Type | null | undefined): value is Type => {
  return !isNull(value);
};

export const answerFormatter = (answer: Answer | null | undefined): FormattedAnswer | null => {
  return answer
    ? {
        id: answer.id,
        answerType: answer.answerType,
        typedAnswer: answer.typedAnswer ? answer.typedAnswer : answer.exactAnswer || answer.comparisonAnswer,
        createdAt: answer.createdAt,
        updatedAt: answer.updatedAt,
      }
    : null;
};

export const answerMapper = (answers?: Array<Answer>): Array<FormattedAnswer> | undefined => {
  return answers?.map(answerFormatter).filter(isNotNull);
};

export const userAnswerFormatter = (userAnswer?: UserAnswer | null): FormattedUserAnswer | undefined => {
  return userAnswer
    ? {
        id: userAnswer.id,
        answerContent: userAnswer.answerContent,
        user: userFormatter(userAnswer.user),
        createdAt: userAnswer.createdAt,
        updatedAt: userAnswer.updatedAt,
      }
    : undefined;
};

export const userAnswerMapper = (userAnswers?: Array<UserAnswer>): Array<FormattedUserAnswer> | undefined => {
  return userAnswers?.map(userAnswerFormatter).filter(isNotNull);
};

export const questionFormatter = (question?: Question | null, answers: Array<Answer> | undefined = undefined): FormattedQuestion | undefined => {
  return question
    ? {
        id: question.id,
        slug: question.slug,
        title: question.title,
        shuffle: question?.choiceQuestion?.shuffle,
        description: question.description,
        questionType: question.questionType,
        typedQuestion: question.typedQuestion,
        answers: answers ? answerMapper(answers) : question.answers ? answerMapper(question.answers) : undefined,
        choices: question.choiceQuestion?.choices,
        userAnswers: question.userAnswers ? userAnswerMapper(question.userAnswers) : question.userAnswers,
        createdAt: question.createdAt,
        updatedAt: question.updatedAt,
      }
    : undefined;
};

export const questionMapper = (questions?: Array<Question>): Array<FormattedQuestion> | undefined => {
  return questions?.map((question) => questionFormatter(question)).filter(isNotNull);
};

export const quizFormatter = (quiz?: Quiz | null, owner?: User, collaborators?: Array<User>): FormattedQuiz | undefined => {
  return quiz
    ? {
        id: quiz.id,
        slug: quiz.slug,
        title: quiz.title,
        description: quiz.description,
        strict: quiz.strict,
        shuffle: quiz.shuffle,
        createdAt: quiz.createdAt,
        updatedAt: quiz.updatedAt,
        questions: questionMapper(quiz.questions),
        owner: userFormatter(owner),
        collaborators: userMapper(collaborators),
      }
    : undefined;
};

export const quizMapper = (quizzes?: Array<Quiz>): Array<FormattedQuiz> | undefined => {
  return quizzes?.map((quiz) => quizFormatter(quiz)).filter(isNotNull);
};

export const eventFormatter = (
  event?: Event | null,
  owner?: User,
  collaborators?: Array<User>,
  group?: Group,
  quiz?: Quiz,
  warnedUsers?: Array<User>
): FormattedEvent | null => {
  return event
    ? {
        id: event.id,
        start: event.start,
        end: event.end,
        quiz: event.quiz || quiz,
        countdown: event.countdown,
        owner: userFormatter(owner),
        collaborators: userMapper(collaborators),
        group: event.group || group,
        createdAt: event.createdAt,
        updatedAt: event.updatedAt,
        warnedUsers: userMapper(warnedUsers),
      }
    : null;
};

export const eventMapper = (events?: Array<Event>): Array<FormattedEvent> | undefined => {
  return events?.map((event) => eventFormatter(event)).filter(isNotNull);
};

export const userFormatter = (
  user?: User | null,
  quizzes: Array<Quiz> = [],
  events: Array<Event> = [],
  infoLevel: 0 | 1 | 2 | 3 = 3
): FormattedUser | undefined => {
  if (!user) return undefined;

  const defaultInfos = {
    id: user.id,
    username: user.username,
    firstName: user.firstName,
    lastName: user.lastName,
    gender: user.gender,
    warns: user.eventWarn?.amount,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };

  switch (infoLevel) {
    case 0:
      return {
        ...defaultInfos,
        password: user.password,
        events: eventMapper(events),
        groups: user.groups,
        quizzes: quizMapper(quizzes),
        role: user.role,
        state: user.state,
      };

    case 1:
      return {
        ...defaultInfos,
        events: eventMapper(events),
        groups: user.groups,
        quizzes: quizMapper(quizzes),
        role: user.role,
        state: user.state,
      };

    case 2:
      return {
        ...defaultInfos,
        password: user.password,
      };

    case 3:
      return defaultInfos;
  }
};

export const userMapper = (users?: Array<User>, infoLevel?: 0 | 1 | 2 | 3): Array<FormattedUser> | undefined => {
  return users?.map((user) => userFormatter(user, undefined, undefined, infoLevel)).filter(isNotNull);
};

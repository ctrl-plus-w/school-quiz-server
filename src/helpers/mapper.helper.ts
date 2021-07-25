import { Answer, FormattedAnswer } from '../models/answer';
import { FormattedQuestion, Question } from '../models/question';
import { FormattedQuiz, Quiz } from '../models/quiz';
import { User } from '../models/user';
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
        typedAnswer: answer.typedAnswer,
        createdAt: answer.createdAt,
        updatedAt: answer.updatedAt,
      }
    : null;
};

export const answerMapper = (answers: Array<Answer>): Array<FormattedAnswer> => {
  return answers.map(answerFormatter).filter(isNotNull);
};

export const userAnswerFormatter = (userAnswer: UserAnswer | null | undefined): FormattedUserAnswer | null => {
  return userAnswer
    ? {
        id: userAnswer.id,
        answerContent: userAnswer.answerContent,
        user: userAnswer.user,
        createdAt: userAnswer.createdAt,
        updatedAt: userAnswer.updatedAt,
      }
    : null;
};

export const userAnswerMapper = (userAnswers: Array<UserAnswer>): Array<FormattedUserAnswer> => {
  return userAnswers.map(userAnswerFormatter).filter(isNotNull);
};

export const questionFormatter = (question: Question | null | undefined): FormattedQuestion | null => {
  return question
    ? {
        id: question.id,
        slug: question.slug,
        title: question.title,
        shuffle: question?.choiceQuestion?.shuffle,
        description: question.description,
        questionType: question.questionType,
        typedQuestion: question.typedQuestion,
        answers: question.answers ? answerMapper(question.answers) : question.answers,
        userAnswers: question.userAnswers ? userAnswerMapper(question.userAnswers) : question.userAnswers,
        createdAt: question.createdAt,
        updatedAt: question.updatedAt,
      }
    : null;
};

export const questionMapper = (questions: Array<Question>): Array<FormattedQuestion> => {
  return questions.map(questionFormatter).filter(isNotNull);
};

export const quizFormatter = (quiz?: Quiz | null, owner?: User, collaborators?: Array<User>): FormattedQuiz | null => {
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
        questions: quiz.questions,
        owner: owner,
        collaborators: collaborators,
      }
    : null;
};

export const quizMapper = (quizzes: Array<Quiz>): Array<FormattedQuiz> => {
  return quizzes.map((quiz) => quizFormatter(quiz)).filter(isNotNull);
};

export const eventFormatter = (
  event?: Event | null,
  owner?: User,
  collaborators?: Array<User>,
  group?: Group,
  quiz?: Quiz
): FormattedEvent | null => {
  return event
    ? {
        id: event.id,
        start: event.start,
        end: event.end,
        quiz: event.quiz || quiz,
        countdown: event.countdown,
        owner: owner,
        collaborators: collaborators,
        group: event.group || group,
        createdAt: event.createdAt,
        updatedAt: event.updatedAt,
      }
    : null;
};

export const eventMapper = (events: Array<Event>): Array<FormattedEvent> => {
  return events.map((event) => eventFormatter(event)).filter(isNotNull);
};

import { Answer, FormatedAnswer } from '../models/answer';
import { FormatedQuestion, Question } from '../models/question';
import { FormatedQuiz, Quiz } from '../models/quiz';
import { User } from '../models/user';
import { FormatedUserAnswer, UserAnswer } from '../models/userAnswer';
import { Event, FormatedEvent } from '../models/event';
import { Group } from '../models/group';

const isNull = <Type>(value: Type | null | undefined): value is Type => {
  return value === null || value === undefined;
};

const isNotNull = <Type>(value: Type | null | undefined): value is Type => {
  return !isNull(value);
};

export const answerFormatter = (answer: Answer | null | undefined): FormatedAnswer | null => {
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

export const answerMapper = (answers: Array<Answer>): Array<FormatedAnswer> => {
  return answers.map(answerFormatter).filter(isNotNull);
};

export const userAnswerFormatter = (userAnswer: UserAnswer | null | undefined): FormatedUserAnswer | null => {
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

export const userAnswerMapper = (userAnswers: Array<UserAnswer>): Array<FormatedUserAnswer> => {
  return userAnswers.map(userAnswerFormatter).filter(isNotNull);
};

export const questionFormatter = (question: Question | null | undefined): FormatedQuestion | null => {
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

export const questionMapper = (questions: Array<Question>): Array<FormatedQuestion> => {
  return questions.map(questionFormatter).filter(isNotNull);
};

export const quizFormatter = (quiz?: Quiz | null, owner?: User, collaborators?: Array<User>): FormatedQuiz | null => {
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

export const quizMapper = (quizzes: Array<Quiz>): Array<FormatedQuiz> => {
  return quizzes.map((quiz) => quizFormatter(quiz)).filter(isNotNull);
};

export const eventFormatter = (
  event: Event | null | undefined,
  owner?: User,
  collaborators?: Array<User>,
  group?: Group,
  quiz?: Quiz
): FormatedEvent | null => {
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

export const eventMapper = (events: Array<Event>): Array<FormatedEvent> => {
  return events.map((event) => eventFormatter(event)).filter(isNotNull);
};

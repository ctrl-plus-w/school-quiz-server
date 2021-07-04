import { Answer, FormatedAnswer } from '../models/answer';
import { FormatedQuestion, Question } from '../models/question';
import { FormatedQuiz, Quiz } from '../models/quiz';

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

export const questionFormatter = (question: Question | null | undefined): FormatedQuestion | null => {
  return question
    ? {
        id: question.id,
        slug: question.slug,
        title: question.title,
        description: question.description,
        questionType: question.questionType,
        typedQuestion: question.typedQuestion,
        answers: question.answers ? answerMapper(question.answers) : question.answers,
        createdAt: question.createdAt,
        updatedAt: question.updatedAt,
      }
    : null;
};

export const questionMapper = (questions: Array<Question>): Array<FormatedQuestion> => {
  return questions.map(questionFormatter).filter(isNotNull);
};

export const quizFormatter = (quiz: Quiz | null | undefined): FormatedQuiz | null => {
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
      }
    : null;
};

export const quizMapper = (quizzes: Array<Quiz>): Array<FormatedQuiz> => {
  return quizzes.map(quizFormatter).filter(isNotNull);
};

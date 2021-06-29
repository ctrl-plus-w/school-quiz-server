import { Answer, FormatedAnswer } from '../models/answer';
import { FormatedQuestion, Question } from '../models/question';
import { FormatedQuiz, Quiz } from '../models/quiz';

export const answerFormatter = (answer: Answer | null | undefined): FormatedAnswer | null | undefined => {
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

export const answerMapper = (answers: Array<Answer>): Array<FormatedAnswer | null | undefined> => {
  return answers.map(answerFormatter);
};

export const questionFormatter = (question: Question | null | undefined): FormatedQuestion | null | undefined => {
  return question
    ? {
        id: question.id,
        title: question.title,
        slug: question.slug,
        description: question.description,
        questionType: question.questionType,
        typedQuestion: question.typedQuestion,
        createdAt: question.createdAt,
        updatedAt: question.updatedAt,
      }
    : null;
};

export const questionMapper = (questions: Array<Question>): Array<FormatedQuestion | null | undefined> => {
  return questions.map(questionFormatter);
};

export const quizFormatter = (quiz: Quiz | null | undefined): FormatedQuiz | null | undefined => {
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
        owner: quiz.owner,
      }
    : null;
};

export const quizMapper = (quizzes: Array<Quiz>): Array<FormatedQuiz | null | undefined> => {
  return quizzes.map(quizFormatter);
};

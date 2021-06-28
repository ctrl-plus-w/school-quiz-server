import { Answer, FormatedAnswer } from '../models/answer';
import { FormatedQuestion, Question } from '../models/question';

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

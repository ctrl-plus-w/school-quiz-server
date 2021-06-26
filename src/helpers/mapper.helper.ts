import { Answer, FormatedAnswer } from '../models/answer';

export const answerFormatter = (answer: Answer | null): FormatedAnswer | null => {
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

export const answerMapper = (answers: Array<Answer>): Array<FormatedAnswer | null> => {
  return answers.map(answerFormatter);
};

export const isNull = (val: unknown): boolean => {
  return val === undefined || val === null;
};

export const isNotNull = (val: unknown): boolean => {
  return val !== undefined && val !== null;
};

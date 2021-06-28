export const slugify = (str: string | undefined): string | undefined => {
  return str
    ? str
        .toLowerCase()
        .replace(/ /g, '-')
        .replace(/[àáâãäå]/g, 'a')
        .replace(/[èéêë]/g, 'e')
    : undefined;
};

export const uppercaseFirst = (str: string): string => {
  return `${str[0].toUpperCase()}${str.slice(1)}`;
};

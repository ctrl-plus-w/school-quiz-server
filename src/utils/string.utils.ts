export const slugify = (str: string): string => {
  return str
    .toLowerCase()
    .replace(/ /g, '-')
    .replace(/[àáâãäå]/g, 'a')
    .replace(/[èéêë]/g, 'e');
};

export const uppercaseFirst = (str: string): string => {
  return `${str[0].toUpperCase()}${str.slice(1)}`;
};

export const slugify = (str: string): string => {
  return str
    .toLowerCase()
    .replace(/ /g, '-')
    .replace(/[àáâãäå]/g, 'a')
    .replace(/[èéêë]/g, 'e');
};

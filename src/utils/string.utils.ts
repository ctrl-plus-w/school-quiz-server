/**
 * Slugify a string
 * @param str The string to slugify
 * @returns A string
 */
export const slugify = (str: string | undefined): string | undefined => {
  return str
    ? str
        .toLowerCase()
        .replace(/ /g, '-')
        .replace(/[àáâãäå]/g, 'a')
        .replace(/[èéêë]/g, 'e')
    : undefined;
};

/**
 * Uppercase the first letter of the string
 * @param str The string to uppercase the first letter
 * @returns A string
 */
export const uppercaseFirst = (str: string): string => {
  return `${str[0].toUpperCase()}${str.slice(1)}`;
};

/**
 * Make a multiline string a oneline string
 * @param str The string to oneline
 * @returns A string
 */
export const oneLine = (str: string): string => {
  return str
    .replace(/(\r\n|\n|\r)/gm, '')
    .replace(/\s\s+/g, ' ')
    .trim();
};

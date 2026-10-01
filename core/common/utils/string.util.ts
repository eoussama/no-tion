/**
 * @description
 * This utility function takes a string as input and returns a new string with the first character capitalized and the rest of the characters unchanged.
 * It is useful for formatting strings, such as titles or labels, to ensure that they start with an uppercase letter.
 *
 * @param str - The input string that you want to capitalize.
 * @returns A new string with the first character capitalized and the rest of the characters unchanged. If the input string is empty, it returns an empty string.
 */
export function capitalize(str: string): string {
  if (!str) {
    return "";
  }

  return str.charAt(0).toUpperCase() + str.slice(1);
}

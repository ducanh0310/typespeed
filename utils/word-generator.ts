export const generateRandomWords = (wordList: string[], count: number): string => {
  let words = '';
  for (let i = 0; i < count; i++) {
    const randomIndex = Math.floor(Math.random() * wordList.length);
    words += wordList[randomIndex] + ' ';
  }
  return words.trim();
};
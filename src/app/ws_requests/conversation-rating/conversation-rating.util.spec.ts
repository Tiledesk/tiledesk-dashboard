import { cleanAiSentiment, cleanRatingMessage, parseRatingScore } from './conversation-rating.util';

describe('conversation-rating.util', () => {
  it('accepts scores from 1 to 5, including numeric strings', () => {
    expect(parseRatingScore(1)).toBe(1);
    expect(parseRatingScore(3)).toBe(3);
    expect(parseRatingScore(5)).toBe(5);
    expect(parseRatingScore('4')).toBe(4);
    expect(parseRatingScore(' 2 ')).toBe(2);
  });

  it('rejects missing, zero, and out-of-range values', () => {
    expect(parseRatingScore(null)).toBeNull();
    expect(parseRatingScore(undefined)).toBeNull();
    expect(parseRatingScore(0)).toBeNull();
    expect(parseRatingScore(6)).toBeNull();
    expect(parseRatingScore(-1)).toBeNull();
    expect(parseRatingScore(1.5)).toBeNull();
    expect(parseRatingScore('')).toBeNull();
    expect(parseRatingScore('no')).toBeNull();
    expect(parseRatingScore(true)).toBeNull();
  });

  it('strips wrapping quotes from the AI sentiment and drops an empty one', () => {
    expect(cleanAiSentiment('"Molto soddisfatto — esito positivo"')).toBe('Molto soddisfatto — esito positivo');
    expect(cleanAiSentiment('  Molto soddisfatto  ')).toBe('Molto soddisfatto');
    expect(cleanAiSentiment('""')).toBeNull();
    expect(cleanAiSentiment(null)).toBeNull();
    expect(cleanAiSentiment(5)).toBeNull();
  });

  it('trims the user review and treats a blank one as missing', () => {
    expect(cleanRatingMessage('eccellente\n\n')).toBe('eccellente');
    expect(cleanRatingMessage('   ')).toBeNull();
    expect(cleanRatingMessage(undefined)).toBeNull();
  });
});

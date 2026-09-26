import { GeneratorOptions, PasswordAnalysis } from '@/models/generator.model';
import { PasswordStrengthService } from '@/services/passwordStrength.service';

const CHAR_SETS = {
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  numbers: '0123456789',
  symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
  ambiguous: '0Ool1I|`\'";:,.<>{}[]()',
};

export class PasswordGeneratorService {
  /**
   * Generates a cryptographically secure random password based on options
   */
  static generate(options: GeneratorOptions): string {
    let charset = '';
    const guaranteedChars: string[] = [];

    let upper = CHAR_SETS.uppercase;
    let lower = CHAR_SETS.lowercase;
    let nums = CHAR_SETS.numbers;
    let syms = CHAR_SETS.symbols;

    if (options.avoidAmbiguous) {
      const isAmbiguous = (c: string) => CHAR_SETS.ambiguous.includes(c);
      upper = upper.split('').filter((c) => !isAmbiguous(c)).join('');
      lower = lower.split('').filter((c) => !isAmbiguous(c)).join('');
      nums = nums.split('').filter((c) => !isAmbiguous(c)).join('');
      syms = syms.split('').filter((c) => !isAmbiguous(c)).join('');
    }

    if (options.uppercase && upper.length > 0) {
      charset += upper;
      guaranteedChars.push(this.getRandomChar(upper));
    }
    if (options.lowercase && lower.length > 0) {
      charset += lower;
      guaranteedChars.push(this.getRandomChar(lower));
    }
    if (options.numbers && nums.length > 0) {
      charset += nums;
      guaranteedChars.push(this.getRandomChar(nums));
    }
    if (options.symbols && syms.length > 0) {
      charset += syms;
      guaranteedChars.push(this.getRandomChar(syms));
    }

    // Fallback if user unchecks all
    if (!charset) {
      charset = CHAR_SETS.lowercase + CHAR_SETS.numbers;
    }

    const length = Math.max(4, Math.min(128, options.length));
    const resultChars: string[] = [...guaranteedChars];

    // Fill the rest
    while (resultChars.length < length) {
      const nextChar = this.getRandomChar(charset);
      if (options.avoidRepeated && resultChars.length > 0 && resultChars[resultChars.length - 1] === nextChar) {
        continue;
      }
      resultChars.push(nextChar);
    }

    // Shuffle characters using Fisher-Yates with crypto.getRandomValues
    this.cryptoShuffle(resultChars);

    return resultChars.slice(0, length).join('');
  }

  /**
   * Selects a single random character from a character set using crypto
   */
  private static getRandomChar(charset: string): string {
    const array = new Uint32Array(1);
    window.crypto.getRandomValues(array);
    const index = array[0] % charset.length;
    return charset.charAt(index);
  }

  /**
   * Cryptographically shuffles an array in place
   */
  private static cryptoShuffle(array: string[]): void {
    for (let i = array.length - 1; i > 0; i--) {
      const randArr = new Uint32Array(1);
      window.crypto.getRandomValues(randArr);
      const j = randArr[0] % (i + 1);
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  /**
   * Calculates entropy and analyzes password strength using pattern-aware strength engine
   */
  static analyze(password: string): PasswordAnalysis {
    return PasswordStrengthService.analyze(password);
  }
}

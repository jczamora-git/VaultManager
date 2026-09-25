import { GeneratorOptions, PasswordAnalysis, PasswordStrengthLevel } from '@/models/generator.model';

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
   * Calculates entropy and analyzes password strength
   */
  static analyze(password: string): PasswordAnalysis {
    if (!password) {
      return {
        score: 0,
        level: 'very-weak',
        label: '',
        color: 'var(--border-light)',
        entropy: 0,
        suggestions: [],
      };
    }

    let poolSize = 0;
    if (/[a-z]/.test(password)) poolSize += 26;
    if (/[A-Z]/.test(password)) poolSize += 26;
    if (/[0-9]/.test(password)) poolSize += 10;
    if (/[^a-zA-Z0-9]/.test(password)) poolSize += 32;

    const entropy = poolSize > 0 ? Math.round(password.length * (Math.log(poolSize) / Math.log(2))) : 0;
    const suggestions: string[] = [];

    if (password.length < 8) {
      suggestions.push('Make password at least 8 characters long');
    }
    if (!/[A-Z]/.test(password)) {
      suggestions.push('Add uppercase letters (A-Z)');
    }
    if (!/[a-z]/.test(password)) {
      suggestions.push('Add lowercase letters (a-z)');
    }
    if (!/[0-9]/.test(password)) {
      suggestions.push('Add numbers (0-9)');
    }
    if (!/[^a-zA-Z0-9]/.test(password)) {
      suggestions.push('Add symbols (!@#$...)');
    }

    let score = 0;
    let level: PasswordStrengthLevel = 'very-weak';
    let label = 'Very Weak';
    let color = '#ef4444'; // Red

    if (entropy < 28 || password.length < 6) {
      score = 0;
      level = 'very-weak';
      label = 'Very Weak';
      color = '#ef4444';
    } else if (entropy < 45 || password.length < 9) {
      score = 1;
      level = 'weak';
      label = 'Weak';
      color = '#f97316'; // Orange
    } else if (entropy < 65 || password.length < 13) {
      score = 2;
      level = 'fair';
      label = 'Fair';
      color = '#eab308'; // Yellow
    } else if (entropy < 85 || password.length < 16) {
      score = 3;
      level = 'strong';
      label = 'Strong';
      color = '#10b981'; // Green
    } else {
      score = 4;
      level = 'very-strong';
      label = 'Very Strong';
      color = '#059669'; // Emerald
    }

    return {
      score,
      level,
      label,
      color,
      entropy,
      suggestions,
    };
  }
}

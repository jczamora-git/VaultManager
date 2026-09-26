export interface GeneratorOptions {
  length: number;
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
  avoidAmbiguous: boolean; // e.g., 0, O, I, l, 1, ` | ' "
  avoidRepeated: boolean;
}

export const DEFAULT_GENERATOR_OPTIONS: GeneratorOptions = {
  length: 20,
  uppercase: true,
  lowercase: true,
  numbers: true,
  symbols: true,
  avoidAmbiguous: false,
  avoidRepeated: false,
};

export type PasswordStrengthLevel = 'very-weak' | 'weak' | 'fair' | 'strong' | 'very-strong';

export interface PasswordAnalysis {
  score: 0 | 1 | 2 | 3 | 4;
  level: PasswordStrengthLevel;
  label: 'Very Weak' | 'Weak' | 'Fair' | 'Strong' | 'Very Strong' | '';
  color: string;
  entropyBits: number;
  estimatedGuesses: number;
  crackTimes: {
    onlineThrottled: string;
    onlineUnthrottled: string;
    offlineSlow: string;
    offlineFast: string;
  };
  headlineCrackTime: string;
  warnings: string[];
  suggestions: string[];
  checks: {
    length: boolean;
    lengthCount: number;
    uppercase: boolean;
    lowercase: boolean;
    numbers: boolean;
    symbols: boolean;
    noCommonPatterns: boolean;
    noRepeatedSequences: boolean;
  };
}

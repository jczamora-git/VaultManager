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
  score: number; // 0 to 4
  level: PasswordStrengthLevel;
  label: string;
  color: string;
  entropy: number; // in bits
  suggestions: string[];
}

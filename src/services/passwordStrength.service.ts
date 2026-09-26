import { ZxcvbnFactory, ZxcvbnResult } from '@zxcvbn-ts/core';
import * as zxcvbnCommonPackage from '@zxcvbn-ts/language-common';
import * as zxcvbnEnPackage from '@zxcvbn-ts/language-en';

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

let zxcvbnInstance: ZxcvbnFactory | null = null;

function getZxcvbn(): ZxcvbnFactory {
  if (!zxcvbnInstance) {
    const options = {
      translations: zxcvbnEnPackage.translations,
      graphs: zxcvbnCommonPackage.adjacencyGraphs,
      dictionary: {
        ...zxcvbnCommonPackage.dictionary,
        ...zxcvbnEnPackage.dictionary,
      },
    };
    zxcvbnInstance = new ZxcvbnFactory(options);
  }
  return zxcvbnInstance;
}

const STRENGTH_CONFIG: Record<
  0 | 1 | 2 | 3 | 4,
  { level: PasswordStrengthLevel; label: 'Very Weak' | 'Weak' | 'Fair' | 'Strong' | 'Very Strong'; color: string }
> = {
  0: { level: 'very-weak', label: 'Very Weak', color: '#D3332F' },
  1: { level: 'weak', label: 'Weak', color: '#EA580C' },
  2: { level: 'fair', label: 'Fair', color: '#D97706' },
  3: { level: 'strong', label: 'Strong', color: '#16A34A' },
  4: { level: 'very-strong', label: 'Very Strong', color: '#059669' },
};

function cleanCrackTime(timeStr: string | number | undefined): string {
  if (!timeStr) return 'Instant';
  const str = String(timeStr).trim();
  if (!str || str === '0' || str.toLowerCase().includes('less than a second')) {
    return 'Instant';
  }
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export class PasswordStrengthService {
  /**
   * Evaluates password strength using pattern-aware zxcvbn analysis locally.
   * Never transmits or stores the evaluated password.
   */
  static analyze(password: string): PasswordAnalysis {
    if (!password || password.length === 0) {
      return {
        score: 0,
        level: 'very-weak',
        label: '',
        color: 'var(--vk-border)',
        entropyBits: 0,
        estimatedGuesses: 0,
        crackTimes: {
          onlineThrottled: 'Instant',
          onlineUnthrottled: 'Instant',
          offlineSlow: 'Instant',
          offlineFast: 'Instant',
        },
        headlineCrackTime: 'Instant',
        warnings: [],
        suggestions: [],
        checks: {
          length: false,
          lengthCount: 0,
          uppercase: false,
          lowercase: false,
          numbers: false,
          symbols: false,
          noCommonPatterns: true,
          noRepeatedSequences: true,
        },
      };
    }

    const engine = getZxcvbn();
    const result: ZxcvbnResult = engine.check(password);
    const score = (Math.max(0, Math.min(4, result.score || 0))) as 0 | 1 | 2 | 3 | 4;
    const config = STRENGTH_CONFIG[score];

    // Character pool calculation for entropy estimate
    let poolSize = 0;
    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSymbol = /[^a-zA-Z0-9]/.test(password);

    if (hasLower) poolSize += 26;
    if (hasUpper) poolSize += 26;
    if (hasNumber) poolSize += 10;
    if (hasSymbol) poolSize += 33;

    // Approximate Shannon entropy bits
    const rawEntropy = poolSize > 0 ? Math.round(password.length * (Math.log(poolSize) / Math.log(2))) : 0;
    const guesses = result.guesses || 1;
    const guessEntropy = Math.max(1, Math.round(Math.log2(guesses)));
    const entropyBits = Math.min(rawEntropy, Math.max(guessEntropy, 4));

    // Crack times from zxcvbn crackTimes displays
    const ct = result.crackTimes;
    const onlineThrottled = cleanCrackTime(ct?.onlineThrottlingXPerHour?.display);
    const onlineUnthrottled = cleanCrackTime(ct?.onlineNoThrottlingXPerSecond?.display);
    const offlineSlow = cleanCrackTime(ct?.offlineSlowHashingXPerSecond?.display);
    const offlineFast = cleanCrackTime(ct?.offlineFastHashingXPerSecond?.display);

    // Headline crack time: represent offline attack resistance realistically
    let headlineCrackTime = offlineSlow;
    if (score === 4) {
      headlineCrackTime = 'Centuries';
    } else if (score === 0) {
      headlineCrackTime = 'Seconds / Instant';
    }

    // Pattern checks from match sequence
    const sequence = result.sequence || [];
    let hasCommonWord = false;
    let hasRepeatedSeq = false;
    let hasSequencePattern = false;
    let hasDatePattern = false;
    let hasSpatialPattern = false;

    for (const match of sequence) {
      const pattern = match.pattern;
      if (pattern === 'dictionary') {
        hasCommonWord = true;
      } else if (pattern === 'repeat') {
        hasRepeatedSeq = true;
      } else if (pattern === 'sequence') {
        hasSequencePattern = true;
      } else if (pattern === 'date') {
        hasDatePattern = true;
      } else if (pattern === 'spatial') {
        hasSpatialPattern = true;
      }
    }

    // Human-readable warnings
    const warnings: string[] = [];
    if (result.feedback?.warning) {
      warnings.push(result.feedback.warning);
    }
    if (hasCommonWord && !warnings.some(w => w.toLowerCase().includes('common') || w.toLowerCase().includes('word'))) {
      warnings.push('Contains a common word or password pattern.');
    }
    if (hasSequencePattern && !warnings.some(w => w.toLowerCase().includes('sequence'))) {
      warnings.push('Contains a predictable sequence (e.g. 123, abc).');
    }
    if (hasRepeatedSeq && !warnings.some(w => w.toLowerCase().includes('repeat'))) {
      warnings.push('Contains repeated characters or sequences.');
    }
    if (hasDatePattern && !warnings.some(w => w.toLowerCase().includes('date'))) {
      warnings.push('Contains a date or year pattern.');
    }
    if (hasSpatialPattern && !warnings.some(w => w.toLowerCase().includes('keyboard') || w.toLowerCase().includes('pattern'))) {
      warnings.push('Contains a keyboard walking pattern (e.g. qwerty).');
    }
    if (password.length < 8) {
      warnings.push('Short length significantly reduces security.');
    }

    // Actionable suggestions
    const suggestions: string[] = [];
    if (result.feedback?.suggestions && Array.isArray(result.feedback.suggestions)) {
      for (const s of result.feedback.suggestions) {
        if (s && !suggestions.includes(s)) {
          suggestions.push(s);
        }
      }
    }

    if (password.length < 12 && !suggestions.some(s => s.toLowerCase().includes('longer'))) {
      suggestions.push('Make your password at least 12–16 characters long.');
    }
    if (hasCommonWord && !suggestions.some(s => s.toLowerCase().includes('unrelated') || s.toLowerCase().includes('words'))) {
      suggestions.push('Combine multiple unrelated words or use random characters.');
    }
    if ((hasSequencePattern || hasDatePattern) && !suggestions.some(s => s.toLowerCase().includes('names') || s.toLowerCase().includes('dates') || s.toLowerCase().includes('predictable'))) {
      suggestions.push('Avoid predictable dates, names, or ascending numbers.');
    }
    if (score < 3 && !suggestions.some(s => s.toLowerCase().includes('generator'))) {
      suggestions.push('Use Vaultify Generator to create an unpredictably strong password.');
    }

    return {
      score,
      level: config.level,
      label: config.label,
      color: config.color,
      entropyBits,
      estimatedGuesses: guesses,
      crackTimes: {
        onlineThrottled,
        onlineUnthrottled,
        offlineSlow,
        offlineFast,
      },
      headlineCrackTime,
      warnings,
      suggestions: suggestions.slice(0, 3),
      checks: {
        length: password.length >= 12,
        lengthCount: password.length,
        uppercase: hasUpper,
        lowercase: hasLower,
        numbers: hasNumber,
        symbols: hasSymbol,
        noCommonPatterns: !hasCommonWord && !hasDatePattern && !hasSpatialPattern,
        noRepeatedSequences: !hasRepeatedSeq && !hasSequencePattern,
      },
    };
  }
}

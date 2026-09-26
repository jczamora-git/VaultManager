import { ZxcvbnFactory } from '@zxcvbn-ts/core';
import * as zxcvbnCommonPackage from '@zxcvbn-ts/language-common';
import * as zxcvbnEnPackage from '@zxcvbn-ts/language-en';

const options = {
  translations: zxcvbnEnPackage.translations,
  graphs: zxcvbnCommonPackage.adjacencyGraphs,
  dictionary: {
    ...zxcvbnCommonPackage.dictionary,
    ...zxcvbnEnPackage.dictionary,
  },
};

const zxcvbn = new ZxcvbnFactory(options);

const testCases = [
  { password: '123456', maxScore: 0, description: '123456 must be Very Weak (score 0)' },
  { password: 'password', maxScore: 0, description: 'password must be Very Weak (score 0)' },
  { password: 'Password123!', maxScore: 2, description: 'Password123! should NOT be Very Strong (score <= 2)' },
  { password: 'qwerty123', maxScore: 1, description: 'qwerty123 must be weak (score <= 1)' },
  { password: 'aaaaaaaaaaaaaaaa', maxScore: 1, description: 'repeated aaaaaaaaaaaaaaaa must be weak (score <= 1)' },
  { password: 'correct-horse-delta-orbit-72', minScore: 3, description: 'long passphrase must be Strong or Very Strong (score >= 3)' },
  { password: 'k9#mP$2vL@9xQ!wZ&5tR', minScore: 4, description: '20-char random mixed password must be Very Strong (score 4)' },
];

let allPassed = true;

for (const tc of testCases) {
  const res = zxcvbn.check(tc.password);
  const score = res.score;
  let pass = true;

  if (tc.maxScore !== undefined && score > tc.maxScore) {
    pass = false;
  }
  if (tc.minScore !== undefined && score < tc.minScore) {
    pass = false;
  }

  if (pass) {
    console.log(`[PASS] ${tc.description} -> score: ${score}`);
  } else {
    console.error(`[FAIL] ${tc.description} -> score: ${score} (expected max: ${tc.maxScore}, min: ${tc.minScore})`);
    allPassed = false;
  }
}

if (!allPassed) {
  process.exit(1);
} else {
  console.log('\nAll password strength engine tests passed successfully!');
}

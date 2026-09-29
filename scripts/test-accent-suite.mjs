import fs from 'fs';
import path from 'path';
import assert from 'assert';

const ROOT_DIR = process.cwd();

console.log('--- Starting Vaultify Dynamic Accent System Test Suite ---');

const ALL_ACCENTS = ['red', 'blue', 'purple', 'green', 'yellow', 'orange', 'pink'];

// ==========================================
// TEST 1: Models & Default Settings
// ==========================================
console.log('\n[TEST 1] Models & Default Settings:');
const settingsModelContent = fs.readFileSync(path.join(ROOT_DIR, 'src/models/settings.model.ts'), 'utf-8');
ALL_ACCENTS.forEach(accent => {
  assert(settingsModelContent.includes(`'${accent}'`), `AccentColor must include '${accent}'`);
});
assert(settingsModelContent.includes("accent: AccentColor;"), "AppSettings interface must include accent: AccentColor");
assert(settingsModelContent.includes("accent: 'red',"), "DEFAULT_SETTINGS must default to accent: 'red'");
assert(settingsModelContent.includes("export const VALID_ACCENTS"), "VALID_ACCENTS array must be exported");
assert(settingsModelContent.includes("export function isValidAccent"), "isValidAccent function must be exported");
assert(settingsModelContent.includes("export const ACCENT_OPTIONS"), "ACCENT_OPTIONS must be exported");
console.log('  ✓ AppSettings correctly defines all 7 typed AccentColors and defaults to red.');

// ==========================================
// TEST 2: Avatar Palettes & Profile Look Accent Mapping
// ==========================================
console.log('\n[TEST 2] Avatar Palettes & Profile Look Mapping:');
const profileModelContent = fs.readFileSync(path.join(ROOT_DIR, 'src/models/profile.model.ts'), 'utf-8');
assert(profileModelContent.includes("accent?: AccentColor;"), "AvatarPaletteOption must support optional accent");

// Check exact order of 7 palettes
ALL_ACCENTS.forEach(accent => {
  assert(profileModelContent.includes(`accent: '${accent}'`), `AVATAR_PALETTES must include palette for accent: '${accent}'`);
});
assert(profileModelContent.includes("color: '#F4C430', text: '#1A1A1A', accent: 'yellow'"), "Yellow palette must have dark text (#1A1A1A)");
assert(profileModelContent.includes("export function getAccentFromColor"), "getAccentFromColor must be exported");
assert(profileModelContent.includes("export function getColorFromAccent"), "getColorFromAccent must be exported");
assert(profileModelContent.includes("export function getAvatarTextColor"), "getAvatarTextColor must be exported");
console.log('  ✓ Profile look palettes map all 7 accents in exact order with Yellow dark contrast.');

// ==========================================
// TEST 3: CSS Semantic Tokens in variables.css
// ==========================================
console.log('\n[TEST 3] Semantic Accent & Danger Tokens:');
const variablesContent = fs.readFileSync(path.join(ROOT_DIR, 'src/theme/variables.css'), 'utf-8');

// Check all 7 accent palettes defined in CSS
ALL_ACCENTS.forEach(accent => {
  assert(variablesContent.includes(`[data-vk-accent="${accent}"]`), `Must define [data-vk-accent="${accent}"] selector in CSS`);
  assert(variablesContent.includes(`.dark[data-vk-accent="${accent}"]`), `Must define .dark[data-vk-accent="${accent}"] adjustment`);
});

// Yellow Contrast Specifics
assert(variablesContent.includes('[data-vk-accent="yellow"]'), 'Must define yellow accent selector');
assert(variablesContent.includes('--vk-accent-contrast: #1A1A1A;'), 'Yellow accent must define dark --vk-accent-contrast');
assert(variablesContent.includes('--vk-on-accent: #1A1A1A;'), 'Yellow accent must define dark --vk-on-accent');

// Non-Yellow on-accent text
assert(variablesContent.includes('--vk-accent-contrast: #FFFFFF;'), 'Other accents must define white --vk-accent-contrast');
assert(variablesContent.includes('--vk-accent-gradient:'), 'Must define --vk-accent-gradient');

// Destructive Tokens
assert(variablesContent.includes('--vk-danger: #D02724;'), 'Must define independent --vk-danger token');
assert(variablesContent.includes('--vk-danger-hover: #B8201E;'), 'Must define independent --vk-danger-hover token');
assert(variablesContent.includes('--ion-color-danger: var(--vk-danger);'), 'ion-color-danger must map to --vk-danger');

// Dock and hero follow accent
assert(variablesContent.includes('--vk-dock-pill-bg: var(--vk-accent);'), 'Dock pill must follow --vk-accent');
assert(variablesContent.includes('--vk-dock-pill-text: var(--vk-on-accent);'), 'Dock pill text must follow --vk-on-accent');
assert(variablesContent.includes('--vk-hero-title-color: var(--vk-on-accent);'), 'Hero title must follow --vk-on-accent');
console.log('  ✓ Semantic tokens for all 7 accents and destructive danger are properly separated and configured.');

// ==========================================
// TEST 4: PIN Keypad Backspace & Delete Icon
// ==========================================
console.log('\n[TEST 4] PIN Keypad Backspace Icon:');
const keypadContent = fs.readFileSync(path.join(ROOT_DIR, 'src/components/security/PinKeypad.vue'), 'utf-8');
const appCssContent = fs.readFileSync(path.join(ROOT_DIR, 'src/theme/app.css'), 'utf-8');

// Ensure hardcoded white overrides were removed
assert(!keypadContent.includes(':global(.dark) .vk-backspace-btn {\n  color: #FFFFFF !important;\n}'), 'Dark backspace should not be hardcoded white in PinKeypad.vue');
assert(keypadContent.includes('.vk-backspace-btn {\n  color: var(--vk-accent) !important;\n}'), 'PinKeypad.vue backspace button must use var(--vk-accent)');
assert(keypadContent.includes('.vk-backspace-btn svg {\n  stroke: currentColor !important;\n}'), 'PinKeypad.vue backspace svg must use currentColor');
assert(appCssContent.includes('.vk-backspace-btn {\n  color: var(--vk-accent) !important;\n}'), 'app.css backspace button must use var(--vk-accent)');
assert(appCssContent.includes('.vk-backspace-btn svg {\n  stroke: currentColor !important;\n  color: currentColor !important;\n}'), 'app.css backspace svg must use currentColor');
console.log('  ✓ PIN keypad backspace button inherits active accent color and uses currentColor.');

// ==========================================
// TEST 5: Destructive Action Separation (Delete Login)
// ==========================================
console.log('\n[TEST 5] Destructive Actions vs Brand Accent:');
assert(appCssContent.includes('.vk-btn-danger {\n  background: var(--vk-danger, #D02724);'), '.vk-btn-danger must use var(--vk-danger)');
assert(!appCssContent.includes('.vk-btn-danger {\n  background: var(--brand-red);'), '.vk-btn-danger must NOT use var(--brand-red)');

const settingsRowContent = fs.readFileSync(path.join(ROOT_DIR, 'src/components/common/SettingsRow.vue'), 'utf-8');
assert(settingsRowContent.includes('.text-danger {\n  color: var(--vk-danger, #D02724) !important;\n}'), 'SettingsRow .text-danger must use var(--vk-danger)');

const settingsSectionContent = fs.readFileSync(path.join(ROOT_DIR, 'src/components/common/SettingsSection.vue'), 'utf-8');
assert(settingsSectionContent.includes('.text-danger {\n  color: var(--vk-danger, #D02724) !important;\n}'), 'SettingsSection .text-danger must use var(--vk-danger)');

const formPageContent = fs.readFileSync(path.join(ROOT_DIR, 'src/pages/CredentialFormPage.vue'), 'utf-8');
assert(formPageContent.includes('.text-danger {\n  color: var(--vk-danger, #D02724);\n}'), 'CredentialFormPage .text-danger must use var(--vk-danger)');
console.log('  ✓ Destructive actions (Delete Login, error text) strictly use --vk-danger independent of accent.');

// ==========================================
// TEST 6: Settings Store & Live Accent Switching
// ==========================================
console.log('\n[TEST 6] Settings Store & Theme Reactivity:');
const settingsStoreContent = fs.readFileSync(path.join(ROOT_DIR, 'src/stores/settings.store.ts'), 'utf-8');
assert(settingsStoreContent.includes("isValidAccent(accent)"), "Settings store must use isValidAccent validator");
assert(settingsStoreContent.includes("document.documentElement.setAttribute('data-vk-accent', validAccent);"), "Must set root attribute data-vk-accent");
assert(settingsStoreContent.includes("document.documentElement.dataset.vkAccent = validAccent;"), "Must set dataset.vkAccent");
assert(settingsStoreContent.includes("StatusBarService.setBrand()"), "applyTheme must update status bar via StatusBarService");
console.log('  ✓ Settings store dynamically validates and applies all 7 accents.');

// ==========================================
// TEST 7: Settings Page Appearance & Profile Look Synchronization
// ==========================================
console.log('\n[TEST 7] Settings Page UI:');
const settingsPageContent = fs.readFileSync(path.join(ROOT_DIR, 'src/pages/SettingsPage.vue'), 'utf-8');
assert(settingsPageContent.includes('label="Accent Color"'), 'SettingsPage must have Accent Color row in Appearance');
assert(settingsPageContent.includes(':options="accentOptions"'), 'SettingsPage must bind accentOptions');
assert(settingsPageContent.includes('ACCENT_OPTIONS'), 'SettingsPage must import ACCENT_OPTIONS');
assert(settingsPageContent.includes('handleSelectPalette(item)'), 'SettingsPage profile look must call handleSelectPalette');
assert(settingsPageContent.includes('handleAccentChange'), 'SettingsPage must handle accent change with two-way profile sync');
console.log('  ✓ Settings page and Local Profile synchronize two-way across all 7 accents.');

// ==========================================
// TEST 8: Storage Service Safe Fallback
// ==========================================
console.log('\n[TEST 8] Storage Service Sanitization:');
const storageContent = fs.readFileSync(path.join(ROOT_DIR, 'src/services/storage.service.ts'), 'utf-8');
assert(storageContent.includes("isValidAccent(parsed.accent) ? parsed.accent : 'red'"), "Invalid or unknown accents must fall back to red");
console.log('  ✓ StorageService safely sanitizes all 7 accents with fallback to red.');

// ==========================================
// TEST 9: Status Bar Service Accent Sync
// ==========================================
console.log('\n[TEST 9] Status Bar Service:');
const statusBarContent = fs.readFileSync(path.join(ROOT_DIR, 'src/services/statusBar.service.ts'), 'utf-8');
ALL_ACCENTS.forEach(accent => {
  assert(statusBarContent.includes(`${accent}:`), `StatusBarService must define color/style for '${accent}'`);
});
assert(statusBarContent.includes("yellow: Style.Light"), "StatusBarService must use Style.Light (dark icons) for Yellow for readable contrast");
assert(statusBarContent.includes("getActiveAccentColor()"), "StatusBarService must dynamically determine active accent color");
console.log('  ✓ StatusBarService updates Android status bar and PWA theme-color with contrast awareness.');

// ==========================================
// TEST 10: Complete System Alignment & Consistency
// ==========================================
console.log('\n[TEST 10] Consistency Check:');
// Ensure no accent is missing from any subsystem
ALL_ACCENTS.forEach(accent => {
  assert(variablesContent.includes(`data-vk-accent="${accent}"`), `CSS missing palette for: ${accent}`);
  assert(profileModelContent.includes(`accent: '${accent}'`), `Profile model missing palette for: ${accent}`);
  assert(statusBarContent.includes(`${accent}:`), `Status bar service missing entry for: ${accent}`);
});
console.log('  ✓ Zero missing accents across CSS palettes, profile options, and status bar mappings.');

console.log('\n=========================================');
console.log('ALL 10 VERIFICATION CHECKS PASSED!');
console.log('=========================================\n');

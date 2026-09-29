import fs from 'fs';
import path from 'path';
import assert from 'assert';
import { parseCredentialCategory, DEFAULT_CATEGORIES } from '../src/models/credential.model.ts';

const ROOT_DIR = process.cwd();

console.log('--- Starting Vaultify Category Picker Bottom Sheet Test Suite ---\n');

// ==========================================
// TEST 1: Category Model & Descriptions
// ==========================================
console.log('[TEST 1] Category Model & Descriptions:');
assert(Array.isArray(DEFAULT_CATEGORIES), 'DEFAULT_CATEGORIES must be an array');
assert(DEFAULT_CATEGORIES.length >= 6, 'DEFAULT_CATEGORIES must have at least 6 categories');

DEFAULT_CATEGORIES.forEach(cat => {
  assert(cat.id, 'Every category must have an id');
  assert(cat.name, 'Every category must have a name');
  assert(cat.description, `Category ${cat.id} must have a description`);
  assert(typeof cat.description === 'string' && cat.description.length > 5, `Category ${cat.id} description must be meaningful`);
});
console.log(`  ✓ All ${DEFAULT_CATEGORIES.length} categories have proper names and descriptive helper text.`);

// ==========================================
// TEST 2: Category Parsing & Validation
// ==========================================
console.log('\n[TEST 2] Category Parsing & Fallback Validation:');
assert.strictEqual(parseCredentialCategory('social'), 'Social');
assert.strictEqual(parseCredentialCategory('Social'), 'Social');
assert.strictEqual(parseCredentialCategory('EMAIL'), 'Email');
assert.strictEqual(parseCredentialCategory('work'), 'Work');
assert.strictEqual(parseCredentialCategory('school'), 'School');
assert.strictEqual(parseCredentialCategory('developer'), 'Development');
assert.strictEqual(parseCredentialCategory('development'), 'Development');
assert.strictEqual(parseCredentialCategory('other'), 'Other');
assert.strictEqual(parseCredentialCategory('unknown-invalid-category'), 'Other');
assert.strictEqual(parseCredentialCategory(''), 'Other');
assert.strictEqual(parseCredentialCategory(undefined), 'Other');
assert.strictEqual(parseCredentialCategory(null), 'Other');
console.log('  ✓ Category validator correctly parses exact IDs, lowercase, aliases (developer), and unknown fallbacks.');

// ==========================================
// TEST 3: CategoryPickerSheet.vue Component
// ==========================================
console.log('\n[TEST 3] CategoryPickerSheet.vue Architecture:');
const sheetPath = path.join(ROOT_DIR, 'src/components/vault/CategoryPickerSheet.vue');
assert(fs.existsSync(sheetPath), 'CategoryPickerSheet.vue must exist');
const sheetContent = fs.readFileSync(sheetPath, 'utf-8');

assert(sheetContent.includes('<ion-modal'), 'Must use ion-modal for mobile sheet');
assert(sheetContent.includes('class="vk-bottom-sheet'), 'Must use vk-bottom-sheet class for design consistency');
assert(sheetContent.includes('Choose a category'), 'Must include title "Choose a category"');
assert(sheetContent.includes('What kind of login are you adding?'), 'Must include subtitle "What kind of login are you adding?"');
assert(sheetContent.includes('Cancel'), 'Must have Cancel button');
assert(sheetContent.includes("emit('select'"), 'Must emit select event with category');
assert(sheetContent.includes("emit('dismiss')"), 'Must emit dismiss event');

// Ensure no hardcoded brand red is used in CategoryPickerSheet
assert(!sheetContent.includes('#D02724'), 'Must not hardcode legacy brand red #D02724');
assert(!sheetContent.includes('#B51F1F'), 'Must not hardcode legacy brand red #B51F1F');
assert(sheetContent.includes('var(--vk-accent)'), 'Must use dynamic var(--vk-accent) for selected/interactive states');
console.log('  ✓ CategoryPickerSheet implements mobile bottom sheet with semantic tokens and zero hardcoded brand reds.');

// ==========================================
// TEST 4: VaultPage.vue Entry Points & Navigation
// ==========================================
console.log('\n[TEST 4] VaultPage.vue Entry Points:');
const vaultPageContent = fs.readFileSync(path.join(ROOT_DIR, 'src/pages/VaultPage.vue'), 'utf-8');

assert(vaultPageContent.includes('CategoryPickerSheet'), 'VaultPage must import and use CategoryPickerSheet');
assert(vaultPageContent.includes('@add-login="openNewLoginCategorySheet"'), 'VaultSummaryCard must trigger openNewLoginCategorySheet');
assert(vaultPageContent.includes('@click="openNewLoginCategorySheet"'), 'FAB button must trigger openNewLoginCategorySheet');
assert(vaultPageContent.includes('showCategorySheet'), 'VaultPage must manage showCategorySheet state');
assert(vaultPageContent.includes("path: '/credential/new'"), 'Must navigate to /credential/new on selection');
assert(vaultPageContent.includes('query: { category:'), 'Must pass category query param to /credential/new');
assert(vaultPageContent.includes('showCategorySheet.value = false'), 'Must close sheet on leave / select / dismiss');
console.log('  ✓ Both entry points (card + FAB) trigger the same sheet and pass category via route query.');

// ==========================================
// TEST 5: CredentialFormPage.vue Preselection & Fallback
// ==========================================
console.log('\n[TEST 5] CredentialFormPage.vue Preselection:');
const formPageContent = fs.readFileSync(path.join(ROOT_DIR, 'src/pages/CredentialFormPage.vue'), 'utf-8');

assert(formPageContent.includes('parseCredentialCategory'), 'Must use parseCredentialCategory helper');
assert(formPageContent.includes('route.query.category'), 'Must inspect route.query.category');
assert(formPageContent.includes('<CategorySelector v-model="form.category"'), 'Must retain CategorySelector for user changes');
console.log('  ✓ CredentialFormPage preselects category from query safely and keeps selector editable.');

console.log('\n=========================================');
console.log('ALL CATEGORY FLOW CHECKS PASSED!');
console.log('=========================================\n');

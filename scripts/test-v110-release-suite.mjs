import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

console.log('🧪 Starting Vaultify v1.1.0 Release & Delete Vault Data Test Suite...\n');

const ROOT = process.cwd();

// 1. Version Consistency Tests
console.log('--- TEST 1: Version Consistency ---');
const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
assert.equal(pkg.version, '1.1.0', 'package.json version should be 1.1.0');
console.log('✔ package.json version is 1.1.0');

const pkgLock = JSON.parse(fs.readFileSync(path.join(ROOT, 'package-lock.json'), 'utf8'));
assert.equal(pkgLock.version, '1.1.0', 'package-lock.json root version should be 1.1.0');
assert.equal(pkgLock.packages[''].version, '1.1.0', 'package-lock.json packages[""] version should be 1.1.0');
console.log('✔ package-lock.json version is 1.1.0');

const appConstants = fs.readFileSync(path.join(ROOT, 'src/constants/app.ts'), 'utf8');
assert.match(appConstants, /export const APP_VERSION = '1\.1\.0';/, 'src/constants/app.ts must declare 1.1.0');
console.log('✔ src/constants/app.ts declares APP_VERSION = "1.1.0"');

const exportService = fs.readFileSync(path.join(ROOT, 'src/services/export.service.ts'), 'utf8');
assert.match(exportService, /import \{.*APP_VERSION.*\} from '@\/constants\/app';/, 'export.service.ts must import APP_VERSION');
assert.match(exportService, /appVersion:\s*APP_VERSION,/, 'export.service.ts must use APP_VERSION');
console.log('✔ src/services/export.service.ts dynamically references APP_VERSION');

const gradle = fs.readFileSync(path.join(ROOT, 'android/app/build.gradle'), 'utf8');
assert.match(gradle, /versionName\s+"1\.1\.0"/, 'android/app/build.gradle versionName must be 1.1.0');
assert.match(gradle, /versionCode\s+2/, 'android/app/build.gradle versionCode must be 2');
console.log('✔ android/app/build.gradle updated to versionCode 2, versionName "1.1.0"');

// 2. Delete Vault Data Hero-Sheet UI Tests
console.log('\n--- TEST 2: Delete Vault Data Hero-Sheet UI ---');
const settingsPage = fs.readFileSync(path.join(ROOT, 'src/pages/SettingsPage.vue'), 'utf8');

assert.match(settingsPage, /<VaultifyHeroSheetLayout[\s\S]*?title="Delete Vault Data"/, 'Must use VaultifyHeroSheetLayout with title "Delete Vault Data"');
assert.match(settingsPage, /subtitle="Permanently remove Vaultify data from this device\."/, 'Must have correct subtitle');
assert.match(settingsPage, /:show-close="true"/, 'Must support circular close button');
assert.match(settingsPage, /@close="showWipeConfirm = false"/, 'Must close modal safely on @close');

assert.match(settingsPage, /class="vk-wipe-danger-card"/, 'Must contain danger information card');
assert.match(settingsPage, /class="vk-wipe-card-icon"/, 'Must have danger icon in card header');
assert.match(settingsPage, /Permanently delete local Vaultify data/, 'Must have card title');
assert.match(settingsPage, /This will remove from this device:/, 'Must list items to be removed');
assert.match(settingsPage, /Previously exported backups stored elsewhere will not be deleted\./, 'Must preserve backup note');

// Action buttons check
assert.match(settingsPage, /class="vk-btn vk-btn-secondary vk-btn-block"[\s\S]*?>\s*Cancel\s*<\/button>/, 'Cancel button must be neutral vk-btn-secondary');
assert.match(settingsPage, /class="vk-btn vk-btn-danger vk-btn-block"[\s\S]*?>\s*Permanently Delete\s*<\/button>/, 'Delete button must use vk-btn-danger');

// Security & Wipe logic check
assert.match(settingsPage, /async function handleWipeVault\(\)\s*\{[\s\S]*?await authStore\.wipeAllData\(\);[\s\S]*?await profileStore\.resetProfile\(\);[\s\S]*?vaultStore\.clearInMemoryData\(\);/, 'handleWipeVault logic must be intact');
console.log('✔ Delete Vault Data hero-sheet modal verified with danger card and neutral cancel / red delete');

// 3. Changelog & Release Notes Verification
console.log('\n--- TEST 3: Changelog and Release Notes ---');
const changelog = fs.readFileSync(path.join(ROOT, 'CHANGELOG.md'), 'utf8');
assert.match(changelog, /## \[1\.1\.0\] - 2026-09-30/, 'CHANGELOG.md must contain 1.1.0 release entry');
assert.match(changelog, /Seven dynamic Vaultify accent colors/, 'CHANGELOG must describe dynamic accents');
assert.match(changelog, /New category picker bottom sheet/, 'CHANGELOG must describe category bottom sheet');
console.log('✔ CHANGELOG.md verified');

const releaseNotes = fs.readFileSync(path.join(ROOT, 'RELEASE_NOTES.md'), 'utf8');
assert.match(releaseNotes, /# Vaultify v1\.1\.0 — Personalization & Smarter Login Creation/, 'RELEASE_NOTES.md header verified');
console.log('✔ RELEASE_NOTES.md verified');

console.log('\n🎉 ALL VAULTIFY v1.1.0 CHECKS PASSED!\n');

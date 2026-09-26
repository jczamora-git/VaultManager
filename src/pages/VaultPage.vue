<template>
  <ion-page class="vk-vault-ion-page">
    <ion-content :fullscreen="true" :scroll-events="true" @ionScroll="closeAllSliding" class="vk-vault-ion-content">
      <div class="vk-vault-page-wrapper">
        <!-- RED HOME HEADER ONLY -->
        <header class="vk-vault-red-header">
          <div class="vk-container">
            <div class="vk-vault-header-row">
              <div class="vk-brand-pill">
                <div class="vk-header-avatar">
                  {{ profileStore.initials }}
                </div>
                <div class="vk-header-greeting-box">
                  <span class="vk-header-greeting">{{ greetingWithName }}</span>
                  <span class="vk-header-status">Your vault is secure</span>
                </div>
              </div>

              <button type="button" class="vk-hero-lock-btn" @click.stop="handleLock" title="Lock vault">
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <span>Lock</span>
              </button>
            </div>
          </div>
        </header>

        <!-- FULL-WIDTH WHITE BODY FILLING THE REST OF THE PAGE -->
        <div class="vk-vault-white-body" @click="closeAllSliding">
          <div class="vk-container">
            <!-- Distinct Vault Summary Deep Red KPI Card sitting on the white body -->
            <div class="vk-kpi-card-wrapper" @click.stop>
              <VaultSummaryCard
                :count="vaultStore.summary.totalCount"
                @add-login="goToNewCredential"
                @generate="goToGenerator"
              />
            </div>

            <!-- MAIN CONTENT: SEARCH, CATEGORIES, & ACCOUNTS -->
            <main class="vk-vault-body" @click.stop>
              <!-- 54px Soft Search Pill -->
              <div class="vk-search-pill-wrapper">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
              </svg>
              <input
                type="text"
                v-model="vaultStore.searchQuery"
                placeholder="Search accounts, websites, emails..."
                class="vk-search-pill-input"
                @focus="closeAllSliding"
              />
              <button
                v-if="vaultStore.searchQuery"
                type="button"
                class="vk-btn-icon-only"
                @click="vaultStore.searchQuery = ''"
              >
                ✕
              </button>
            </div>

            <!-- Category Pill Scroller -->
            <CategorySelector v-model="vaultStore.selectedCategory" @change="closeAllSliding" />

            <!-- FAVORITES SECTION (When not searching & favorites exist) -->
            <div
              v-if="!vaultStore.searchQuery && vaultStore.selectedCategory === 'All' && vaultStore.favoriteCredentials.length > 0"
              class="vk-vault-section"
            >
              <SectionHeader title="Favorites" :count="vaultStore.favoriteCredentials.length" />
              <div class="vk-list-wrapper">
                <CredentialRow
                  v-for="item in vaultStore.favoriteCredentials"
                  :key="`fav-${item.id}`"
                  :credential="item"
                  @select="goToCredentialDetail"
                  @toggle-favorite="handleToggleFavorite"
                />
              </div>
            </div>

            <!-- ALL ACCOUNTS SECTION -->
            <div class="vk-vault-section">
              <SectionHeader
                :title="vaultStore.searchQuery ? 'Search Results' : 'All Accounts'"
                :count="vaultStore.filteredCredentials.length"
              >
                <template #actions>
                  <!-- Custom Sort Dropdown -->
                  <VaultSelect
                    :model-value="sortSelection"
                    :options="sortOptions"
                    title="Sort Accounts"
                    @change="onSortChange"
                  />
                </template>
              </SectionHeader>

              <!-- Credential Rows List with Constrained Card-Based Swipe Actions -->
              <div v-if="vaultStore.filteredCredentials.length > 0" class="vk-list-wrapper">
                <CredentialSwipeCard
                  v-for="item in vaultStore.filteredCredentials"
                  :key="item.id"
                  :credential="item"
                  :is-open="activeSwipeId === item.id"
                  :open-side="activeSwipeId === item.id ? activeSwipeSide : null"
                  @select="goToCredentialDetail"
                  @toggle-favorite="handleToggleFavorite"
                  @edit="handleSwipeEdit"
                  @delete="handleSwipeDelete"
                  @open-change="handleOpenChange"
                />
              </div>

              <!-- Empty Search Results -->
              <EmptyState
                v-else-if="vaultStore.searchQuery || vaultStore.selectedCategory !== 'All'"
                title="No accounts found"
                description="Try another name, website domain, or email address."
                action-label="Clear Search"
                @action="clearFilters"
              />

              <!-- Empty Vault State -->
              <EmptyState
                v-else
                title="Your vault is empty"
                description="Store your first login credential locally and securely."
                action-label="+ Add First Login"
                @action="goToNewCredential"
              />
            </div>
          </main>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal (Shared Swipe-to-Delete Modal) -->
      <DeleteCredentialModal
        :is-open="showDeleteConfirm"
        :credential="credentialToDelete"
        @close="handleCancelDelete"
        @confirm="confirmDelete"
      />

      <!-- Red Floating Action Button (FAB) - Shown when items exist -->
      <ion-fab v-if="vaultStore.credentials.length > 0" vertical="bottom" horizontal="end" slot="fixed" class="vk-fab">
        <ion-fab-button @click="goToNewCredential" class="vk-fab-btn" title="Add Credential">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M5 12h14"/><path d="M12 5v14"/>
          </svg>
        </ion-fab-button>
      </ion-fab>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import {
  IonPage,
  IonContent,
  IonFab,
  IonFabButton,
  onIonViewWillLeave,
} from '@ionic/vue';
import { Credential } from '@/models/credential.model';
import { useVaultStore } from '@/stores/vault.store';
import { useAuthStore } from '@/stores/auth.store';
import { useProfileStore } from '@/stores/profile.store';
import { useGreeting } from '@/composables/useGreeting';
import { useToast } from '@/composables/useToast';
import CategorySelector from '@/components/vault/CategorySelector.vue';
import CredentialRow from '@/components/vault/CredentialRow.vue';
import CredentialSwipeCard from '@/components/vault/CredentialSwipeCard.vue';
import DeleteCredentialModal from '@/components/vault/DeleteCredentialModal.vue';
import VaultSummaryCard from '@/components/vault/VaultSummaryCard.vue';
import SectionHeader from '@/components/common/SectionHeader.vue';
import EmptyState from '@/components/common/EmptyState.vue';
import VaultSelect, { SelectOption } from '@/components/common/VaultSelect.vue';

const router = useRouter();
const vaultStore = useVaultStore();
const authStore = useAuthStore();
const profileStore = useProfileStore();
const { greetingWithName } = useGreeting();
const { showToast } = useToast();

const sortSelection = ref('title-asc');

const sortOptions: SelectOption[] = [
  { label: 'Name (A–Z)', value: 'title-asc' },
  { label: 'Name (Z–A)', value: 'title-desc' },
  { label: 'Recently Modified', value: 'updatedAt-desc' },
  { label: 'Date Created', value: 'createdAt-desc' },
];

function onSortChange(val: any) {
  sortSelection.value = String(val);
  const [field, order] = sortSelection.value.split('-');
  vaultStore.sortBy = field as 'title' | 'updatedAt' | 'createdAt';
  vaultStore.sortOrder = order as 'asc' | 'desc';
  closeAllSliding();
}

function goToNewCredential() {
  closeAllSliding();
  router.push('/credential/new');
}

function goToGenerator() {
  closeAllSliding();
  router.push('/tabs/generator');
}

function goToCredentialDetail(id: string) {
  closeAllSliding();
  router.push(`/credential/${id}`);
}

async function handleToggleFavorite(id: string) {
  const isFav = await vaultStore.toggleFavorite(id);
  showToast(isFav ? 'Added to favorites' : 'Removed from favorites', 'primary', 1200);
}

function handleLock() {
  closeAllSliding();
  authStore.lock();
  vaultStore.clearInMemoryData();
  showToast('Vault locked', 'medium', 1500);
  router.replace('/unlock');
}

function clearFilters() {
  vaultStore.searchQuery = '';
  vaultStore.selectedCategory = 'All';
  closeAllSliding();
}

/* ========================================= */
/* SWIPE ACTIONS MANAGEMENT                  */
/* ========================================= */
const activeSwipeId = ref<string | null>(null);
const activeSwipeSide = ref<'edit' | 'delete' | null>(null);

function handleOpenChange(payload: { id: string; isOpen: boolean; side: 'edit' | 'delete' | null }) {
  if (payload.isOpen) {
    activeSwipeId.value = payload.id;
    activeSwipeSide.value = payload.side;
  } else if (activeSwipeId.value === payload.id) {
    activeSwipeId.value = null;
    activeSwipeSide.value = null;
  }
}

function closeAllSliding() {
  activeSwipeId.value = null;
  activeSwipeSide.value = null;
}

function handleSwipeEdit(item: Credential) {
  closeAllSliding();
  router.push(`/credential/${item.id}/edit`);
}

const credentialToDelete = ref<Credential | null>(null);
const showDeleteConfirm = ref(false);

function handleSwipeDelete(item: Credential) {
  credentialToDelete.value = item;
  showDeleteConfirm.value = true;
}

function handleCancelDelete() {
  showDeleteConfirm.value = false;
  credentialToDelete.value = null;
  closeAllSliding();
}

async function confirmDelete() {
  if (!credentialToDelete.value) return;
  const title = credentialToDelete.value.title;
  await vaultStore.deleteCredential(credentialToDelete.value.id);
  showDeleteConfirm.value = false;
  credentialToDelete.value = null;
  closeAllSliding();
  showToast(`"${title}" deleted`, 'success');
}

watch(() => vaultStore.selectedCategory, () => closeAllSliding());
watch(() => vaultStore.searchQuery, () => closeAllSliding());
watch(sortSelection, () => closeAllSliding());
onIonViewWillLeave(() => closeAllSliding());
</script>

<style scoped>
.vk-vault-ion-page {
  --background: #FFFFFF;
  background: #FFFFFF;
}

.vk-vault-ion-content {
  --background: #FFFFFF;
  background: #FFFFFF;
}

.dark .vk-vault-ion-page,
.ion-palette-dark .vk-vault-ion-page,
body.dark-theme .vk-vault-ion-page,
[data-theme="dark"] .vk-vault-ion-page {
  --background: #0D0D0D;
  background: #0D0D0D;
}

.dark .vk-vault-ion-content,
.ion-palette-dark .vk-vault-ion-content,
body.dark-theme .vk-vault-ion-content,
[data-theme="dark"] .vk-vault-ion-content {
  --background: #0D0D0D;
  background: #0D0D0D;
}

.vk-vault-page-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100%;
  width: 100%;
  background: #FFFFFF;
}

.dark .vk-vault-page-wrapper,
.ion-palette-dark .vk-vault-page-wrapper,
body.dark-theme .vk-vault-page-wrapper,
[data-theme="dark"] .vk-vault-page-wrapper {
  background: #0D0D0D;
}

/* Red Home Header ONLY */
.vk-vault-red-header {
  background: var(--vk-brand-gradient, linear-gradient(180deg, #D02724 0%, #C12320 45%, #B8201E 100%));
  padding-top: calc(env(safe-area-inset-top, 0px) + 14px);
  padding-bottom: 22px;
  width: 100%;
  box-sizing: border-box;
  flex-shrink: 0;
  position: relative;
  z-index: 1;
}

.vk-vault-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 12px;
}

.vk-brand-pill {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  flex: 1;
}

.vk-header-avatar {
  width: 40px;
  height: 40px;
  min-width: 40px;
  min-height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.16);
  border: 1.5px solid rgba(255, 255, 255, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  font-weight: 800;
  color: #FFFFFF;
  flex-shrink: 0;
  user-select: none;
  box-sizing: border-box;
}

.vk-header-greeting-box {
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex: 1;
}

.vk-header-greeting {
  font-size: 0.95rem;
  font-weight: 700;
  color: #FFFFFF;
  letter-spacing: -0.01em;
  line-height: 1.25;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.vk-header-status {
  font-size: 0.75rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.78);
  margin-top: 2px;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.vk-hero-lock-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.28);
  color: #FFFFFF;
  padding: 7px 14px;
  border-radius: var(--radius-pill, 9999px);
  font-size: 0.775rem;
  font-weight: 700;
  cursor: pointer;
  outline: none;
  flex-shrink: 0;
  white-space: nowrap;
  transition: transform var(--vk-motion-instant, 90ms) var(--vk-ease-press, ease),
              background-color 120ms ease;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  box-sizing: border-box;
}

.vk-hero-lock-btn svg {
  color: #FFFFFF;
  flex-shrink: 0;
}

.vk-hero-lock-btn:active {
  transform: scale(0.95);
  background: rgba(255, 255, 255, 0.25);
}

/* White/Light Body Container filling the rest of the page */
.vk-vault-white-body {
  background: #FFFFFF;
  flex: 1;
  width: 100%;
  position: relative;
  z-index: 2;
  padding-top: 20px;
  padding-bottom: var(--vk-content-bottom-padding, 120px);
  box-sizing: border-box;
}

.dark .vk-vault-white-body,
.ion-palette-dark .vk-vault-white-body,
body.dark-theme .vk-vault-white-body,
[data-theme="dark"] .vk-vault-white-body {
  background: #0D0D0D;
}

.vk-kpi-card-wrapper {
  width: 100%;
  margin-top: 0;
  margin-bottom: 24px;
  position: relative;
  z-index: 3;
}

.vk-vault-body {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.vk-vault-section {
  margin-bottom: 24px;
}

.vk-list-wrapper {
  display: flex;
  flex-direction: column;
}
</style>

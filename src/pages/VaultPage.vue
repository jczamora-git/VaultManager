<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <!-- RED / DARK HERO HEADER -->
      <div class="vk-hero-backdrop vk-vault-hero">
        <div class="vk-container">
          <!-- Top Brand & Profile Greeting Row -->
          <div class="vk-hero-top-row">
            <div class="vk-brand-pill">
              <div class="vk-header-avatar" :style="{ backgroundColor: profileStore.avatarColor }">
                {{ profileStore.initials }}
              </div>
              <div class="vk-header-greeting-box">
                <span class="vk-header-greeting">{{ greetingWithName }}</span>
                <span class="vk-header-status">Your vault is secure</span>
              </div>
            </div>

            <button type="button" class="vk-hero-lock-btn" @click="handleLock" title="Lock vault">
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <span>Lock</span>
            </button>
          </div>

          <!-- Distinct Vault Summary KPI Card -->
          <div class="vk-kpi-card-wrapper">
            <VaultSummaryCard
              :count="vaultStore.summary.totalCount"
              @add-login="goToNewCredential"
              @generate="goToGenerator"
            />
          </div>
        </div>
      </div>

      <!-- MAIN WHITE / DARK CONTENT SHEET -->
      <div class="vk-sheet vk-vault-sheet">
        <div class="vk-container">
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
          <CategorySelector v-model="vaultStore.selectedCategory" />

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

            <!-- Credential Rows List -->
            <div v-if="vaultStore.filteredCredentials.length > 0" class="vk-list-wrapper">
              <CredentialRow
                v-for="item in vaultStore.filteredCredentials"
                :key="item.id"
                :credential="item"
                @select="goToCredentialDetail"
                @toggle-favorite="handleToggleFavorite"
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
        </div>
      </div>

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
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { IonPage, IonContent, IonFab, IonFabButton } from '@ionic/vue';
import { useVaultStore } from '@/stores/vault.store';
import { useAuthStore } from '@/stores/auth.store';
import { useProfileStore } from '@/stores/profile.store';
import { useGreeting } from '@/composables/useGreeting';
import { useToast } from '@/composables/useToast';
import CategorySelector from '@/components/vault/CategorySelector.vue';
import CredentialRow from '@/components/vault/CredentialRow.vue';
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
}

function goToNewCredential() {
  router.push('/credential/new');
}

function goToGenerator() {
  router.push('/tabs/generator');
}

function goToCredentialDetail(id: string) {
  router.push(`/credential/${id}`);
}

async function handleToggleFavorite(id: string) {
  const isFav = await vaultStore.toggleFavorite(id);
  showToast(isFav ? 'Added to favorites' : 'Removed from favorites', 'primary', 1200);
}

function handleLock() {
  authStore.lock();
  vaultStore.clearInMemoryData();
  showToast('Vault locked', 'medium', 1500);
  router.replace('/unlock');
}

function clearFilters() {
  vaultStore.searchQuery = '';
  vaultStore.selectedCategory = 'All';
}
</script>

<style scoped>
.vk-vault-hero {
  padding-top: calc(env(safe-area-inset-top, 0px) + 16px);
  padding-bottom: clamp(20px, 3dvh, 26px);
  background: linear-gradient(180deg, #C92A27 0%, #B82321 100%);
}

.dark .vk-vault-hero {
  background: #0D0D0D;
}

.vk-hero-top-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: clamp(16px, 2.4dvh, 20px);
}

.vk-brand-pill {
  display: inline-flex;
  align-items: center;
  gap: 12px;
}

.vk-header-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  font-weight: 800;
  color: #FFFFFF;
  border: 2px solid rgba(255, 255, 255, 0.4);
  flex-shrink: 0;
  user-select: none;
}

.vk-header-greeting-box {
  display: flex;
  flex-direction: column;
}

.vk-header-greeting {
  font-size: 0.925rem; /* ~14px */
  font-weight: 700;
  color: #FFFFFF;
  letter-spacing: -0.01em;
  line-height: 1.2;
}

.vk-header-status {
  font-size: 0.725rem; /* ~11px */
  font-weight: 500;
  color: rgba(255, 255, 255, 0.82);
  margin-top: 2px;
}

.dark .vk-header-greeting {
  color: var(--text-primary);
}

.dark .vk-header-status {
  color: var(--text-secondary);
}

.vk-hero-lock-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.25);
  color: #FFFFFF;
  padding: 6px 14px;
  border-radius: var(--radius-pill, 999px);
  font-size: 0.775rem;
  font-weight: 700;
  cursor: pointer;
  outline: none;
  transition: transform var(--vk-motion-instant, 90ms) var(--vk-ease-press, ease),
              background-color 120ms ease;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

.vk-hero-lock-btn:active {
  transform: scale(0.95);
  background: rgba(255, 255, 255, 0.25);
}

.dark .vk-hero-lock-btn {
  background: var(--vk-bg-surface-soft);
  border-color: var(--vk-border);
  color: var(--text-primary);
}

.dark .vk-hero-lock-btn:hover {
  background: var(--vk-bg-surface-elevated);
}

.vk-kpi-card-wrapper {
  width: 100%;
}

.vk-vault-sheet {
  background: var(--vk-bg-sheet);
  border-radius: 28px 28px 0 0;
  margin-top: -12px;
  position: relative;
  z-index: 2;
  padding-top: 20px;
  min-height: 50dvh;
}

.vk-vault-section {
  margin-bottom: 24px;
}

.vk-list-wrapper {
  display: flex;
  flex-direction: column;
}
</style>

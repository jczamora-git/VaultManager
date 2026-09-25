<template>
  <div class="vk-summary-banner">
    <!-- Stat pills -->
    <div class="vk-summary-stats">
      <div class="vk-stat-item">
        <div class="vk-stat-icon-wrap vk-stat-blue">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        </div>
        <div>
          <div class="vk-stat-value">{{ summary.totalCount }}</div>
          <div class="vk-stat-label">Saved Accounts</div>
        </div>
      </div>

      <div class="vk-stat-item">
        <div class="vk-stat-icon-wrap vk-stat-amber">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </div>
        <div>
          <div class="vk-stat-value">{{ summary.favoriteCount }}</div>
          <div class="vk-stat-label">Favorites</div>
        </div>
      </div>

      <div class="vk-stat-item" v-if="summary.weakPasswordCount > 0">
        <div class="vk-stat-icon-wrap vk-stat-red">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        </div>
        <div>
          <div class="vk-stat-value">{{ summary.weakPasswordCount }}</div>
          <div class="vk-stat-label">Weak / At Risk</div>
        </div>
      </div>
    </div>

    <!-- Quick Action Pills -->
    <div class="vk-quick-actions">
      <button type="button" class="vk-quick-btn vk-quick-btn-primary" @click="$emit('add-login')">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M5 12h14"/><path d="M12 5v14"/>
        </svg>
        <span>Add Login</span>
      </button>

      <button type="button" class="vk-quick-btn" @click="$emit('open-generator')">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="m13 2-2 2.5h3L11 8h3l-5 8 2-5H8l2-4.5H7Z"/>
        </svg>
        <span>Generator</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { VaultStateSummary } from '@/models/vault.model';

defineProps<{
  summary: VaultStateSummary;
}>();

defineEmits<{
  (e: 'add-login'): void;
  (e: 'open-generator'): void;
}>();
</script>

<style scoped>
.vk-summary-banner {
  background: var(--vk-bg-card);
  border: 1px solid var(--vk-border);
  border-radius: var(--vk-radius-xl);
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: var(--vk-shadow-sm);
}

.vk-summary-stats {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 14px;
}

.vk-stat-item {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  min-width: 120px;
}

.vk-stat-icon-wrap {
  width: 38px;
  height: 38px;
  border-radius: var(--vk-radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.vk-stat-blue {
  background: rgba(37, 99, 235, 0.12);
  color: #3b82f6;
}

.vk-stat-amber {
  background: rgba(245, 158, 11, 0.12);
  color: #f59e0b;
}

.vk-stat-red {
  background: rgba(239, 68, 68, 0.12);
  color: #ef4444;
}

.vk-stat-value {
  font-size: 1.25rem;
  font-weight: 800;
  line-height: 1;
  color: var(--vk-text-primary);
  margin-bottom: 2px;
}

.vk-stat-label {
  font-size: 0.75rem;
  color: var(--vk-text-secondary);
  font-weight: 500;
}

.vk-quick-actions {
  display: flex;
  gap: 10px;
  border-top: 1px solid var(--vk-border-subtle);
  padding-top: 12px;
}

.vk-quick-btn {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: var(--vk-radius-md);
  font-size: 0.825rem;
  font-weight: 600;
  cursor: pointer;
  background: var(--vk-bg-card-subtle);
  border: 1px solid var(--vk-border);
  color: var(--vk-text-primary);
  transition: all 0.15s ease;
}

.vk-quick-btn:hover {
  background: var(--vk-border);
}

.vk-quick-btn-primary {
  background: var(--vk-accent);
  border-color: var(--vk-accent);
  color: #ffffff;
}

.vk-quick-btn-primary:hover {
  background: #1d4ed8;
}
</style>

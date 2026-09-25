import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import TabsPage from '@/pages/TabsPage.vue';
import { useAuthStore } from '@/stores/auth.store';
import { useProfileStore } from '@/stores/profile.store';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/tabs/vault',
  },
  {
    path: '/onboarding',
    name: 'Onboarding',
    component: () => import('@/pages/SetupPage.vue'),
  },
  {
    path: '/setup',
    name: 'Setup',
    redirect: '/onboarding',
  },
  {
    path: '/unlock',
    name: 'Unlock',
    component: () => import('@/pages/UnlockPage.vue'),
  },
  {
    path: '/unlock/master',
    name: 'MasterUnlock',
    component: () => import('@/pages/MasterUnlockPage.vue'),
  },
  {
    path: '/tabs/',
    component: TabsPage,
    children: [
      {
        path: '',
        redirect: '/tabs/vault',
      },
      {
        path: 'vault',
        name: 'Vault',
        component: () => import('@/pages/VaultPage.vue'),
      },
      {
        path: 'generator',
        name: 'Generator',
        component: () => import('@/pages/GeneratorPage.vue'),
      },
      {
        path: 'cipher',
        name: 'Cipher',
        component: () => import('@/pages/CipherPage.vue'),
      },
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('@/pages/SettingsPage.vue'),
      },
    ],
  },
  {
    path: '/settings/about',
    name: 'About',
    component: () => import('@/pages/AboutPage.vue'),
  },
  {
    path: '/settings/privacy',
    name: 'Privacy',
    component: () => import('@/pages/PrivacyPage.vue'),
  },
  {
    path: '/settings/terms',
    name: 'Terms',
    component: () => import('@/pages/TermsPage.vue'),
  },
  {
    path: '/credential/new',
    name: 'NewCredential',
    component: () => import('@/pages/CredentialFormPage.vue'),
  },
  {
    path: '/credential/:id',
    name: 'CredentialDetail',
    component: () => import('@/pages/CredentialDetailPage.vue'),
  },
  {
    path: '/credential/:id/edit',
    name: 'EditCredential',
    component: () => import('@/pages/CredentialFormPage.vue'),
  },
  {
    path: '/:catchAll(.*)',
    redirect: '/tabs/vault',
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  const profileStore = useProfileStore();

  // If authStore or profileStore hasn't checked persistent storage yet, check it now
  if (authStore.isInitializing) {
    await authStore.checkVaultStatus();
  }
  if (!profileStore.isLoaded) {
    await profileStore.loadProfile();
  }

  const hasVault = authStore.hasVault;
  const isUnlocked = authStore.isUnlocked;
  const isOnboardingComplete = profileStore.onboardingComplete;

  const isOnboardingPath = to.path === '/onboarding' || to.path === '/setup';
  const isUnlockPath = to.path === '/unlock' || to.path === '/unlock/master';

  // 1. If no vault exists or onboarding is incomplete, route must be /onboarding
  if (!hasVault || !isOnboardingComplete) {
    if (!isOnboardingPath) {
      return next('/onboarding');
    }
    return next();
  }

  // 2. If vault exists and onboarding complete but vault is locked, route must be /unlock or /unlock/master
  if (!isUnlocked) {
    if (!isUnlockPath) {
      return next('/unlock');
    }
    return next();
  }

  // 3. If vault is unlocked and user visits /onboarding or /setup or /unlock or /unlock/master, redirect to /tabs/vault
  if (isOnboardingPath || isUnlockPath) {
    return next('/tabs/vault');
  }

  next();
});

export default router;


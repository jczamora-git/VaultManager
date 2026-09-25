import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { LocalProfile, generateInitials } from '@/models/profile.model';
import { StorageService } from '@/services/storage.service';

export const useProfileStore = defineStore('profile', () => {
  const profile = ref<LocalProfile | null>(null);
  const onboardingComplete = ref<boolean>(false);
  const isLoaded = ref<boolean>(false);

  const displayName = computed(() => {
    return profile.value?.displayName || 'User';
  });

  const initials = computed(() => {
    return generateInitials(displayName.value);
  });

  const avatarColor = computed(() => {
    return profile.value?.avatarColor || '#B82825';
  });

  const avatarType = computed(() => {
    return profile.value?.avatarType || 'initials';
  });

  const avatarValue = computed(() => {
    return profile.value?.avatarValue || '';
  });

  /**
   * Load profile & onboarding status from persistent storage
   */
  async function loadProfile(): Promise<void> {
    const [savedProfile, isCompleted] = await Promise.all([
      StorageService.getLocalProfile(),
      StorageService.getOnboardingComplete(),
    ]);

    profile.value = savedProfile;
    onboardingComplete.value = isCompleted;
    isLoaded.value = true;
  }

  /**
   * Save a newly created local profile
   */
  async function setProfile(newProfile: LocalProfile): Promise<void> {
    profile.value = newProfile;
    await StorageService.saveLocalProfile(newProfile);
  }

  /**
   * Update fields of the existing local profile
   */
  async function updateProfile(updates: Partial<LocalProfile>): Promise<void> {
    if (!profile.value) {
      const now = new Date().toISOString();
      profile.value = {
        id: crypto.randomUUID ? crypto.randomUUID() : `profile_${Date.now()}`,
        displayName: updates.displayName || 'User',
        avatarType: updates.avatarType || 'initials',
        avatarColor: updates.avatarColor || '#B82825',
        avatarValue: updates.avatarValue,
        avatarStyle: updates.avatarStyle,
        createdAt: now,
        updatedAt: now,
      };
    } else {
      profile.value = {
        ...profile.value,
        ...updates,
        updatedAt: new Date().toISOString(),
      };
    }

    await StorageService.saveLocalProfile(profile.value);
  }

  /**
   * Mark onboarding as complete and persist
   */
  async function completeOnboarding(): Promise<void> {
    onboardingComplete.value = true;
    await StorageService.saveOnboardingComplete(true);
  }

  /**
   * Reset local profile and onboarding state
   */
  async function resetProfile(): Promise<void> {
    profile.value = null;
    onboardingComplete.value = false;
  }

  return {
    profile,
    onboardingComplete,
    isLoaded,
    displayName,
    initials,
    avatarColor,
    avatarType,
    avatarValue,
    loadProfile,
    setProfile,
    updateProfile,
    completeOnboarding,
    resetProfile,
  };
});

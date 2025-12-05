/**
 * Storage Service for HealthScan
 * Handles localStorage persistence with migration support
 * 
 * @version 2.0
 */

import {
  UserProfile,
  ScanHistoryItem,
  Product,
  SkinProfile,
  demoUserProfile,
  demoScanHistory,
  emptySkinProfile,
  isSkinProfileComplete
} from './demo-data';

export type { UserProfile, SkinProfile };

// Storage version for migration
const STORAGE_VERSION = '2.0';

const KEYS = {
  USER_PROFILE: 'picko_user_profile',
  SCAN_HISTORY: 'picko_history',
  STORAGE_VERSION: 'picko_storage_version',
  SKIN_PROFILE_PROMPTED: 'picko_skin_prompted'
};

/**
 * Migrate old storage format to new format
 */
function migrateStorageIfNeeded(): void {
  try {
    const version = localStorage.getItem(KEYS.STORAGE_VERSION);

    if (!version || parseFloat(version) < 2.0) {
      console.log('🔄 Migrating storage to v2.0...');

      // Migrate scan history - add type: 'FOOD' to existing products
      const historyData = localStorage.getItem(KEYS.SCAN_HISTORY);
      if (historyData) {
        const history = JSON.parse(historyData);
        const migratedHistory = history.map((item: any) => ({
          ...item,
          product: {
            ...item.product,
            type: item.product.type || 'FOOD', // Default to FOOD
            verdict: item.product.status || item.product.verdict || 'questionable',
            score: item.product.nutritionScore || item.product.score || 50,
            // Keep legacy fields for compatibility
            status: item.product.status,
            nutritionScore: item.product.nutritionScore
          }
        }));
        localStorage.setItem(KEYS.SCAN_HISTORY, JSON.stringify(migratedHistory));
      }

      // Migrate user profile - add skin property
      const profileData = localStorage.getItem(KEYS.USER_PROFILE);
      if (profileData) {
        const profile = JSON.parse(profileData);
        if (!profile.skin) {
          profile.skin = { ...emptySkinProfile };
        }
        // Ensure language is in new format
        if (profile.language === 'English') profile.language = 'EN';
        if (profile.language === 'Español') profile.language = 'ES';

        localStorage.setItem(KEYS.USER_PROFILE, JSON.stringify(profile));
      }

      localStorage.setItem(KEYS.STORAGE_VERSION, STORAGE_VERSION);
      console.log('✅ Storage migrated to v2.0');
    }
  } catch (e) {
    console.error('Error migrating storage', e);
  }
}

// Run migration on module load
migrateStorageIfNeeded();

export const StorageService = {
  // ============================================
  // USER PROFILE
  // ============================================

  getUserProfile: (): UserProfile | null => {
    try {
      const data = localStorage.getItem(KEYS.USER_PROFILE);
      if (!data) return null;

      const profile = JSON.parse(data);
      // Ensure skin profile exists
      if (!profile.skin) {
        profile.skin = { ...emptySkinProfile };
      }
      return profile;
    } catch (e) {
      console.error('Error reading user profile', e);
      return null;
    }
  },

  saveUserProfile: (profile: UserProfile) => {
    try {
      // Ensure skin profile exists
      const profileToSave = {
        ...profile,
        skin: profile.skin || { ...emptySkinProfile }
      };
      localStorage.setItem(KEYS.USER_PROFILE, JSON.stringify(profileToSave));
    } catch (e) {
      console.error('Error saving user profile', e);
    }
  },

  clearUserProfile: () => {
    try {
      localStorage.removeItem(KEYS.USER_PROFILE);
    } catch (e) {
      console.error('Error clearing user profile', e);
    }
  },

  // ============================================
  // SKIN PROFILE (Convenience methods)
  // ============================================

  getSkinProfile: (): SkinProfile => {
    const profile = StorageService.getUserProfile();
    return profile?.skin || { ...emptySkinProfile };
  },

  saveSkinProfile: (skin: SkinProfile) => {
    const profile = StorageService.getUserProfile();
    if (profile) {
      profile.skin = skin;
      StorageService.saveUserProfile(profile);
    }
  },

  needsSkinProfilePrompt: (): boolean => {
    const profile = StorageService.getUserProfile();
    const wasPrompted = localStorage.getItem(KEYS.SKIN_PROFILE_PROMPTED);

    // Show prompt if: has profile, skin not complete, and wasn't prompted yet
    return profile !== null &&
      !isSkinProfileComplete(profile.skin) &&
      wasPrompted !== 'true';
  },

  markSkinProfilePrompted: () => {
    localStorage.setItem(KEYS.SKIN_PROFILE_PROMPTED, 'true');
  },

  // ============================================
  // SCAN HISTORY
  // ============================================

  getScanHistory: (): ScanHistoryItem[] => {
    try {
      const data = localStorage.getItem(KEYS.SCAN_HISTORY);
      if (!data) return [];

      const parsed = JSON.parse(data);
      return parsed.map((item: any) => ({
        ...item,
        scannedAt: new Date(item.scannedAt),
        // Ensure product has type
        product: {
          ...item.product,
          type: item.product.type || 'FOOD'
        }
      }));
    } catch (e) {
      console.error('Error reading scan history', e);
      return [];
    }
  },

  /**
   * Get scan history filtered by product type
   */
  getScanHistoryByType: (type: 'FOOD' | 'COSMETIC'): ScanHistoryItem[] => {
    return StorageService.getScanHistory().filter(
      item => item.product.type === type
    );
  },

  addScanHistoryItem: (product: Product, isPurchased: boolean = false) => {
    try {
      const history = StorageService.getScanHistory();

      // Ensure product has required fields
      const productToSave: Product = {
        ...product,
        type: product.type || 'FOOD' as const,
        score: product.score ?? product.nutritionScore ?? 50,
        verdict: product.verdict ?? product.status ?? 'questionable',
        // Keep legacy fields for compatibility
        nutritionScore: product.score ?? product.nutritionScore ?? 50,
        status: product.verdict ?? product.status ?? 'questionable'
      } as Product;

      const newItem: ScanHistoryItem = {
        id: crypto.randomUUID(),
        product: productToSave,
        scannedAt: new Date(),
        isFavorite: false,
        isPurchased
      };

      const updatedHistory = [newItem, ...history];
      localStorage.setItem(KEYS.SCAN_HISTORY, JSON.stringify(updatedHistory));
      return newItem;
    } catch (e) {
      console.error('Error adding scan history item', e);
      return null;
    }
  },

  toggleFavorite: (productId: string) => {
    try {
      const history = StorageService.getScanHistory();
      const isCurrentlyFavorite = history.some(item => item.product.id === productId && item.isFavorite);
      const newStatus = !isCurrentlyFavorite;

      const updatedHistory = history.map(item =>
        item.product.id === productId ? { ...item, isFavorite: newStatus } : item
      );
      localStorage.setItem(KEYS.SCAN_HISTORY, JSON.stringify(updatedHistory));
      return updatedHistory;
    } catch (e) {
      console.error('Error toggling favorite', e);
      return [];
    }
  },

  togglePurchased: (id: string) => {
    try {
      const history = StorageService.getScanHistory();
      console.log('📦 Storage: Toggling purchased for ID:', id);

      // Try to find by history ID first
      let updatedHistory = history.map(item =>
        item.id === id ? { ...item, isPurchased: !item.isPurchased } : item
      );

      // Check if anything changed
      const changed = JSON.stringify(history) !== JSON.stringify(updatedHistory);

      if (!changed) {
        console.log('📦 Storage: No change by ID, trying by Product ID...');
        updatedHistory = history.map(item =>
          item.product.id === id ? { ...item, isPurchased: !item.isPurchased } : item
        );
      }

      localStorage.setItem(KEYS.SCAN_HISTORY, JSON.stringify(updatedHistory));
      return updatedHistory;
    } catch (e) {
      console.error('❌ Storage: Error toggling purchased', e);
      return [];
    }
  },

  deleteScanHistoryItem: (historyId: string) => {
    try {
      const history = StorageService.getScanHistory();
      const updatedHistory = history.filter(item => item.id !== historyId);
      localStorage.setItem(KEYS.SCAN_HISTORY, JSON.stringify(updatedHistory));
      return updatedHistory;
    } catch (e) {
      console.error('Error deleting history item', e);
      return [];
    }
  },

  updateProductInHistory: (productId: string, updatedProduct: Product) => {
    try {
      const history = StorageService.getScanHistory();
      const updatedHistory = history.map(item =>
        item.product.id === productId ? { ...item, product: updatedProduct } : item
      );
      localStorage.setItem(KEYS.SCAN_HISTORY, JSON.stringify(updatedHistory));
      console.log(`✅ Updated product ${productId} in ${updatedHistory.filter(i => i.product.id === productId).length} history items`);
      return updatedHistory;
    } catch (e) {
      console.error('Error updating product in history', e);
      return [];
    }
  },

  clearScanHistory: () => {
    try {
      localStorage.removeItem(KEYS.SCAN_HISTORY);
    } catch (e) {
      console.error('Error clearing scan history', e);
    }
  },

  // ============================================
  // UTILITY METHODS
  // ============================================

  clearAll: () => {
    StorageService.clearUserProfile();
    StorageService.clearScanHistory();
    localStorage.removeItem(KEYS.STORAGE_VERSION);
    localStorage.removeItem(KEYS.SKIN_PROFILE_PROMPTED);

    // Clear AI analysis cache
    if (typeof window !== 'undefined') {
      try {
        const { clearAnalysisCache } = require('../services/ai-analysis.service');
        clearAnalysisCache();
      } catch (e) {
        console.log('Could not clear analysis cache');
      }
    }
  },

  initializeDemoData: () => {
    if (!StorageService.getUserProfile()) {
      StorageService.saveUserProfile(demoUserProfile);
    }
    if (StorageService.getScanHistory().length === 0) {
      localStorage.setItem(KEYS.SCAN_HISTORY, JSON.stringify(demoScanHistory));
    }
  },

  /**
   * Get storage version
   */
  getStorageVersion: (): string => {
    return localStorage.getItem(KEYS.STORAGE_VERSION) || '1.0';
  },

  /**
   * Force re-migration (for debugging)
   */
  forceRemigrate: () => {
    localStorage.removeItem(KEYS.STORAGE_VERSION);
    migrateStorageIfNeeded();
  }
};

// Expose to window for debugging
if (typeof window !== 'undefined') {
  (window as any).StorageService = StorageService;
}

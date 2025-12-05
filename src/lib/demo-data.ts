/**
 * Demo data for HealthScan Multi-Vertical App
 * Includes both FOOD and COSMETIC products
 * 
 * @version 2.0
 */

import {
  Product,
  FoodProduct,
  CosmeticProduct,
  UserProfile,
  ScanHistoryItem,
  ProductComparison,
  SuitabilityStatus,
  NutritionInfo,
  SkinProfile
} from './types';

// Re-export types for backward compatibility
export type {
  Product,
  FoodProduct,
  CosmeticProduct,
  UserProfile,
  ScanHistoryItem,
  ProductComparison,
  SuitabilityStatus,
  NutritionInfo,
  SkinProfile
};

// ============================================
// FOOD PRODUCTS
// ============================================

export const demoFoodProducts: FoodProduct[] = [
  {
    id: '1',
    name: 'Organic Almond Milk',
    brand: "Nature's Best",
    barcode: '1234567890123',
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&h=400&fit=crop',
    type: 'FOOD',
    category: 'Dairy Alternative',
    ingredients: ['Water', 'Organic Almonds', 'Sea Salt', 'Sunflower Lecithin'],
    allergens: ['tree_nuts'],
    nutrition: {
      servingSize: '240ml',
      calories: 30,
      protein: 1,
      carbs: 1,
      sugar: 0,
      fat: 2.5,
      sodium: 150,
      fiber: 1
    },
    score: 85,
    verdict: 'suitable',
    tags: ['vegan', 'organic', 'low-sugar']
  },
  {
    id: '2',
    name: 'Protein Energy Bar',
    brand: 'FitLife',
    barcode: '9876543210987',
    image: 'https://images.unsplash.com/photo-1604480133435-4b5f9804c899?w=400&h=400&fit=crop',
    type: 'FOOD',
    category: 'Snacks',
    ingredients: ['Peanuts', 'Whey Protein', 'Sugar', 'Palm Oil', 'Soy Lecithin'],
    allergens: ['peanuts', 'milk', 'soy'],
    nutrition: {
      servingSize: '45g',
      calories: 210,
      protein: 20,
      carbs: 22,
      sugar: 15,
      fat: 8,
      sodium: 180,
      fiber: 3
    },
    score: 55,
    verdict: 'questionable',
    tags: ['high-protein', 'processed']
  },
  {
    id: '3',
    name: 'Instant Noodles',
    brand: 'QuickMeal',
    barcode: '5647382910234',
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=400&fit=crop',
    type: 'FOOD',
    category: 'Instant Food',
    ingredients: ['Wheat Flour', 'Palm Oil', 'Salt', 'MSG', 'Artificial Flavors'],
    allergens: ['wheat', 'gluten'],
    nutrition: {
      servingSize: '85g',
      calories: 380,
      protein: 8,
      carbs: 52,
      sugar: 2,
      fat: 16,
      sodium: 1200,
      fiber: 2
    },
    score: 25,
    verdict: 'not-recommended',
    tags: ['processed']
  },
  {
    id: '4',
    name: 'Greek Yogurt',
    brand: 'Dairy Fresh',
    barcode: '7362819045678',
    image: 'https://images.unsplash.com/photo-1571212515674-3fdb992e2c08?w=400&h=400&fit=crop',
    type: 'FOOD',
    category: 'Dairy',
    ingredients: ['Milk', 'Live Active Cultures'],
    allergens: ['milk'],
    nutrition: {
      servingSize: '150g',
      calories: 90,
      protein: 15,
      carbs: 6,
      sugar: 4,
      fat: 0,
      sodium: 60,
      fiber: 0
    },
    score: 90,
    verdict: 'suitable',
    tags: ['high-protein', 'low-sugar']
  },
  {
    id: '5',
    name: 'Veggie Chips',
    brand: 'Healthy Snacks Co.',
    barcode: '3456789012345',
    image: 'https://images.unsplash.com/photo-1600952841320-db92ec4047ca?w=400&h=400&fit=crop',
    type: 'FOOD',
    category: 'Snacks',
    ingredients: ['Potatoes', 'Vegetable Oil', 'Salt', 'Artificial Colors'],
    allergens: [],
    nutrition: {
      servingSize: '28g',
      calories: 140,
      protein: 1,
      carbs: 18,
      sugar: 6,
      fat: 7,
      sodium: 130,
      fiber: 3
    },
    score: 50,
    verdict: 'questionable',
    tags: ['vegetarian']
  },
  {
    id: '6',
    name: 'Quinoa Bowl',
    brand: 'Organic Eats',
    barcode: '8901234567890',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=400&fit=crop',
    type: 'FOOD',
    category: 'Ready Meals',
    ingredients: ['Quinoa', 'Black Beans', 'Corn', 'Peppers', 'Olive Oil', 'Spices'],
    allergens: [],
    nutrition: {
      servingSize: '350g',
      calories: 320,
      protein: 12,
      carbs: 45,
      sugar: 3,
      fat: 10,
      sodium: 400,
      fiber: 8
    },
    score: 82,
    verdict: 'suitable',
    tags: ['vegan', 'organic', 'high-protein']
  }
];

// ============================================
// COSMETIC PRODUCTS (NEW)
// ============================================

export const demoCosmeticProducts: CosmeticProduct[] = [
  {
    id: 'c1',
    name: 'Hydrating Facial Cleanser',
    brand: 'CeraVe',
    barcode: 'C123456789012',
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop',
    type: 'COSMETIC',
    category: 'skincare',
    applicationArea: 'face',
    ingredients: [
      'Water', 'Glycerin', 'Ceramides', 'Hyaluronic Acid',
      'Niacinamide', 'Cholesterol', 'Phytosphingosine'
    ],
    attributes: {
      isCrueltyFree: true,
      isVegan: false,
      isNonComedogenic: true,
      hasFragrance: false,
      hasAlcohol: false,
      isHypoallergenic: true,
      isParabenFree: true
    },
    skinTypes: ['Dry', 'Normal', 'Sensitive'],
    concerns: ['Dryness', 'Sensitivity'],
    score: 92,
    verdict: 'suitable'
  },
  {
    id: 'c2',
    name: 'Vitamin C Serum 20%',
    brand: 'The Ordinary',
    barcode: 'C234567890123',
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&h=400&fit=crop',
    type: 'COSMETIC',
    category: 'skincare',
    applicationArea: 'face',
    ingredients: [
      'Ascorbic Acid', 'Propanediol', 'Ascorbyl Glucoside',
      'Vitamin E', 'Ferulic Acid', 'Hyaluronic Acid'
    ],
    attributes: {
      isCrueltyFree: true,
      isVegan: true,
      isNonComedogenic: true,
      hasFragrance: false,
      hasAlcohol: false,
      isParabenFree: true
    },
    skinTypes: ['Normal', 'Combination', 'Oily'],
    concerns: ['Hyperpigmentation', 'Dark Spots', 'Aging'],
    score: 88,
    verdict: 'suitable'
  },
  {
    id: 'c3',
    name: 'Retinol Night Cream',
    brand: 'La Roche-Posay',
    barcode: 'C345678901234',
    image: 'https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=400&h=400&fit=crop',
    type: 'COSMETIC',
    category: 'skincare',
    applicationArea: 'face',
    ingredients: [
      'Water', 'Retinol', 'Niacinamide', 'Glycerin',
      'Squalane', 'Ceramides', 'Adenosine', 'Fragrance'
    ],
    attributes: {
      isCrueltyFree: false,
      isVegan: false,
      isNonComedogenic: true,
      hasFragrance: true,
      hasAlcohol: false,
      isParabenFree: true
    },
    skinTypes: ['Normal', 'Combination'],
    concerns: ['Aging', 'Wrinkles', 'Large Pores'],
    score: 75,
    verdict: 'questionable' // Has fragrance
  },
  {
    id: 'c4',
    name: 'Salicylic Acid Cleanser',
    brand: 'Paula\'s Choice',
    barcode: 'C456789012345',
    image: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=400&h=400&fit=crop',
    type: 'COSMETIC',
    category: 'skincare',
    applicationArea: 'face',
    ingredients: [
      'Water', 'Salicylic Acid 2%', 'Green Tea Extract',
      'Niacinamide', 'Aloe Vera', 'Panthenol'
    ],
    attributes: {
      isCrueltyFree: true,
      isVegan: true,
      isNonComedogenic: true,
      hasFragrance: false,
      hasAlcohol: false,
      isParabenFree: true,
      isSulfateFree: true
    },
    skinTypes: ['Oily', 'Combination'],
    concerns: ['Acne', 'Blackheads', 'Large Pores', 'Oiliness'],
    score: 90,
    verdict: 'suitable'
  },
  {
    id: 'c5',
    name: 'Coconut Body Lotion',
    brand: 'Tropical Essentials',
    barcode: 'C567890123456',
    image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=400&h=400&fit=crop',
    type: 'COSMETIC',
    category: 'bodycare',
    applicationArea: 'body',
    ingredients: [
      'Water', 'Coconut Oil', 'Shea Butter', 'Fragrance',
      'Mineral Oil', 'Parabens', 'Alcohol Denat'
    ],
    attributes: {
      isCrueltyFree: false,
      isVegan: false,
      isNonComedogenic: false,
      hasFragrance: true,
      hasAlcohol: true,
      isParabenFree: false
    },
    skinTypes: ['Normal'],
    concerns: ['Dryness'],
    score: 35,
    verdict: 'not-recommended' // Many problematic ingredients
  },
  {
    id: 'c6',
    name: 'SPF 50 Sunscreen',
    brand: 'Neutrogena',
    barcode: 'C678901234567',
    image: 'https://images.unsplash.com/photo-1556227702-d1e4e7b5c232?w=400&h=400&fit=crop',
    type: 'COSMETIC',
    category: 'suncare',
    applicationArea: 'face',
    ingredients: [
      'Zinc Oxide', 'Titanium Dioxide', 'Niacinamide',
      'Vitamin E', 'Aloe Vera', 'Glycerin'
    ],
    attributes: {
      isCrueltyFree: false,
      isVegan: false,
      isNonComedogenic: true,
      hasFragrance: false,
      hasAlcohol: false,
      hasSPF: true,
      spfValue: 50,
      isParabenFree: true
    },
    skinTypes: ['Dry', 'Normal', 'Combination', 'Oily', 'Sensitive'],
    concerns: ['Aging', 'Hyperpigmentation'],
    score: 88,
    verdict: 'suitable'
  }
];

// ============================================
// COMBINED PRODUCTS (For compatibility)
// ============================================

export const demoProducts: Product[] = [
  ...demoFoodProducts,
  ...demoCosmeticProducts
];

// ============================================
// DEMO SCAN HISTORY
// ============================================

export const demoScanHistory: ScanHistoryItem[] = [
  {
    id: 'h1',
    product: demoFoodProducts[0],
    scannedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    isFavorite: true
  },
  {
    id: 'h2',
    product: demoFoodProducts[3],
    scannedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    isFavorite: true
  },
  {
    id: 'h3',
    product: demoCosmeticProducts[0], // CeraVe Cleanser
    scannedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    isFavorite: true
  },
  {
    id: 'h4',
    product: demoFoodProducts[2],
    scannedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    isFavorite: false
  },
  {
    id: 'h5',
    product: demoCosmeticProducts[3], // Paula's Choice
    scannedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    isFavorite: false
  }
];

// ============================================
// DEMO COMPARISONS
// ============================================

export const demoComparisons: ProductComparison[] = [
  {
    id: 'c1',
    products: [demoFoodProducts[0], demoFoodProducts[3]],
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    title: 'Dairy Alternatives',
    productType: 'FOOD'
  },
  {
    id: 'c2',
    products: [demoCosmeticProducts[0], demoCosmeticProducts[1]],
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    title: 'Face Serums',
    productType: 'COSMETIC'
  }
];

// ============================================
// DEFAULT USER PROFILE (With Skin Context)
// ============================================

export const demoUserProfile: UserProfile = {
  name: 'Alex Johnson',
  email: 'alex.johnson@email.com',
  country: 'Argentina',
  language: 'ES',

  // Food Context
  allergies: ['Peanuts', 'Shellfish'],
  preferences: ['Vegan-friendly', 'Organic', 'Low sugar'],
  goals: ['Lose weight', 'Build muscle', 'Eat healthier'],

  // Skin Context (NEW)
  skin: {
    type: 'Combination',
    concerns: ['Acne', 'Large Pores'],
    avoid: ['Fragrance', 'Parabens', 'Alcohol']
  }
};

// ============================================
// DEFAULT EMPTY SKIN PROFILE
// ============================================

export const emptySkinProfile: SkinProfile = {
  type: null,
  concerns: [],
  avoid: []
};

// ============================================
// STATIC DATA (Countries, Languages, Options)
// ============================================

export const countries = [
  'Argentina',
  'Bolivia',
  'Brazil',
  'Chile',
  'Colombia',
  'Costa Rica',
  'Cuba',
  'Dominican Republic',
  'Ecuador',
  'El Salvador',
  'Guatemala',
  'Honduras',
  'Mexico',
  'Nicaragua',
  'Panama',
  'Paraguay',
  'Peru',
  'Uruguay',
  'Venezuela'
];

export const languages = [
  'English',
  'Español'
];

export const commonAllergens = [
  'Gluten',
  'Milk',
  'Eggs',
  'Fish',
  'Shellfish',
  'Tree Nuts',
  'Peanuts',
  'Wheat',
  'Soy',
  'Sesame'
];

export const dietaryPreferences = [
  'Vegan',
  'Vegetarian',
  'Gluten-free',
  'Dairy-free',
  'Organic',
  'Low sugar',
  'Low sodium',
  'High protein',
  'Keto-friendly',
  'Paleo'
];

export const healthGoals = [
  'Lose weight',
  'Gain muscle',
  'Maintain weight',
  'Improve energy',
  'Better digestion',
  'Heart health',
  'Manage diabetes',
  'Reduce cholesterol'
];

// ============================================
// SKIN CARE OPTIONS (NEW)
// ============================================

export const skinTypes = [
  { value: 'Dry', label: 'Dry', emoji: '🏜️', description: 'Feels tight, may have flaky patches' },
  { value: 'Oily', label: 'Oily', emoji: '✨', description: 'Shiny, enlarged pores, prone to breakouts' },
  { value: 'Combination', label: 'Combination', emoji: '⚖️', description: 'Oily T-zone, dry cheeks' },
  { value: 'Normal', label: 'Normal', emoji: '😊', description: 'Balanced, few imperfections' },
  { value: 'Sensitive', label: 'Sensitive', emoji: '🌸', description: 'Easily irritated, redness prone' }
];

export const skinConcerns = [
  { value: 'Acne', label: 'Acne', emoji: '🔴' },
  { value: 'Rosacea', label: 'Rosacea', emoji: '🌹' },
  { value: 'Aging', label: 'Aging/Wrinkles', emoji: '⏳' },
  { value: 'Hyperpigmentation', label: 'Dark Spots', emoji: '🟤' },
  { value: 'Dryness', label: 'Dryness', emoji: '🏜️' },
  { value: 'Oiliness', label: 'Excess Oil', emoji: '💧' },
  { value: 'Large Pores', label: 'Large Pores', emoji: '⭕' },
  { value: 'Blackheads', label: 'Blackheads', emoji: '⚫' },
  { value: 'Sensitivity', label: 'Sensitivity', emoji: '⚠️' },
  { value: 'Dermatitis', label: 'Dermatitis/Eczema', emoji: '🩹' }
];

export const ingredientsToAvoid = [
  { value: 'Fragrance', label: 'Fragrance/Perfume', risk: 'Irritation, allergies' },
  { value: 'Parabens', label: 'Parabens', risk: 'Hormonal disruption concerns' },
  { value: 'Alcohol', label: 'Drying Alcohols', risk: 'Dryness, irritation' },
  { value: 'Sulfates', label: 'Sulfates (SLS/SLES)', risk: 'Stripping natural oils' },
  { value: 'Silicones', label: 'Silicones', risk: 'Pore clogging for some' },
  { value: 'Essential Oils', label: 'Essential Oils', risk: 'Sensitization' },
  { value: 'Retinoids', label: 'Retinoids (if pregnant)', risk: 'Not pregnancy-safe' },
  { value: 'Mineral Oil', label: 'Mineral Oil', risk: 'Comedogenic for some' }
];

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get a default/empty UserProfile
 */
export function getDefaultUserProfile(): UserProfile {
  return {
    name: '',
    email: '',
    country: '',
    language: 'ES',
    allergies: [],
    preferences: [],
    goals: [],
    skin: { ...emptySkinProfile }
  };
}

/**
 * Check if skin profile is complete
 */
export function isSkinProfileComplete(skin: SkinProfile | undefined): boolean {
  if (!skin) return false;
  return skin.type !== null;
}

/**
 * Get products by type
 */
export function getProductsByType(type: 'FOOD' | 'COSMETIC'): Product[] {
  return demoProducts.filter(p => p.type === type);
}

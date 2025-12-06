/**
 * HealthScan Multi-Vertical Type System
 * Supports FOOD and COSMETIC product types using Discriminated Unions
 * 
 * @version 2.0
 * @date 2024-12-04
 */

// ============================================
// ENUMS & BASE TYPES
// ============================================

export type ProductType = 'FOOD' | 'COSMETIC';
export type SuitabilityStatus = 'suitable' | 'questionable' | 'not-recommended';
export type SkinType = 'Dry' | 'Oily' | 'Combination' | 'Normal' | 'Sensitive';
export type Language = 'ES' | 'EN';

// ============================================
// INGREDIENT ANALYSIS
// ============================================

export interface IngredientAnalysis {
    name: string;
    originalName?: string; // For translation purposes
    isAllergen?: boolean;
    isIrritant?: boolean;
    isBeneficial?: boolean;
    comedogenicRating?: number; // 0-5 scale for cosmetics
    notes?: string;
}

// ============================================
// NUTRITION INFO (FOOD ONLY)
// ============================================

export interface NutritionInfo {
    servingSize: string;
    calories: number;
    protein: number;
    carbs: number;
    sugar: number;
    fat: number;
    sodium: number;
    fiber: number;
}

// ============================================
// COSMETIC ATTRIBUTES
// ============================================

export interface CosmeticAttributes {
    isCrueltyFree?: boolean;
    isVegan?: boolean;
    isNonComedogenic?: boolean;
    hasFragrance: boolean;
    hasAlcohol: boolean;
    hasSPF?: boolean;
    spfValue?: number;
    isHypoallergenic?: boolean;
    isParabenFree?: boolean;
    isSulfateFree?: boolean;
}

// ============================================
// AI ANALYSIS RESULT
// ============================================

export interface AIAnalysisResult {
    summary: string;
    benefits: string[];
    risks: string[];
    // Food-specific
    matchesDiet?: boolean;
    // Cosmetic-specific
    keyActives?: string[];
    irritantsFound?: string[];
    skinCompatibility?: SkinType[];
}

// ============================================
// BASE PRODUCT (Abstract)
// ============================================

interface BaseProduct {
    id: string;
    name: string;
    brand: string;
    barcode: string;
    image: string;
    type: ProductType; // DISCRIMINATOR
    scannedAt?: Date;
    ingredients: string[];
    ingredientsAnalysis?: IngredientAnalysis[];
    score: number; // 0-100 Global Score
    verdict: SuitabilityStatus;
    aiAnalysis?: AIAnalysisResult;

    // Legacy compatibility fields (deprecated, use score/verdict)
    status?: SuitabilityStatus;
    nutritionScore?: number;
    issues?: string[];
    benefits?: string[];
    aiDescription?: string;
}

// ============================================
// FOOD PRODUCT
// ============================================

export type FoodTag = 'vegan' | 'vegetarian' | 'gluten-free' | 'keto' | 'paleo' | 'organic' | 'processed' | 'high-protein' | 'low-sugar' | 'low-sodium';

export interface FoodProduct extends BaseProduct {
    type: 'FOOD';
    category: string;
    allergens: string[];
    nutrition: NutritionInfo;
    tags?: FoodTag[];
}

// ============================================
// COSMETIC PRODUCT
// ============================================

export type CosmeticCategory = 'skincare' | 'haircare' | 'bodycare' | 'makeup' | 'suncare' | 'fragrance';
export type ApplicationArea = 'face' | 'body' | 'hair' | 'lips' | 'eyes' | 'hands' | 'feet' | 'nails';

export interface CosmeticProduct extends BaseProduct {
    type: 'COSMETIC';
    category: CosmeticCategory;
    attributes: CosmeticAttributes;
    applicationArea: ApplicationArea;
    skinTypes?: SkinType[]; // Recommended skin types
    concerns?: string[]; // What concerns it addresses (acne, aging, etc.)
}

// ============================================
// UNION TYPE (The Main Export)
// ============================================

export type Product = FoodProduct | CosmeticProduct;

// ============================================
// TYPE GUARDS
// ============================================

/**
 * Check if a product is a Food product
 */
export function isFoodProduct(product: Product): product is FoodProduct {
    return product.type === 'FOOD';
}

/**
 * Check if a product is a Cosmetic product
 */
export function isCosmeticProduct(product: Product): product is CosmeticProduct {
    return product.type === 'COSMETIC';
}

/**
 * Safely get nutrition info (returns null for cosmetics)
 */
export function getNutritionInfo(product: Product): NutritionInfo | null {
    return isFoodProduct(product) ? product.nutrition : null;
}

/**
 * Safely get cosmetic attributes (returns null for food)
 */
export function getCosmeticAttributes(product: Product): CosmeticAttributes | null {
    return isCosmeticProduct(product) ? product.attributes : null;
}

// ============================================
// USER PROFILE (Unified)
// ============================================

export interface SkinProfile {
    type: SkinType | null;
    concerns: string[]; // ['Acne', 'Rosacea', 'Aging', 'Dermatitis', 'Hyperpigmentation', 'Dryness']
    avoid: string[]; // ['Fragrance', 'Parabens', 'Silicones', 'Alcohol', 'Sulfates', 'Essential Oils']
}

export interface UserProfile {
    // CORE INFO
    name: string;
    email: string;
    avatar?: string;
    country: string;
    language: Language;

    // FOOD CONTEXT
    allergies: string[]; // ['Gluten', 'Peanuts', 'Shellfish'...] STRICT MATCH
    preferences: string[]; // ['Vegan', 'Keto', 'Paleo'] PREFERENCE MATCH
    goals: string[]; // ['Lose Weight', 'Muscle Gain'] SCORING BIAS

    // DERMO CONTEXT (NEW)
    skin: SkinProfile;
}

// ============================================
// SCAN HISTORY
// ============================================

export interface ScanHistoryItem {
    id: string;
    product: Product;
    scannedAt: Date;
    isFavorite: boolean;
    isPurchased?: boolean;
}

// ============================================
// COMPARISONS
// ============================================

export interface ProductComparison {
    id: string;
    products: Product[];
    createdAt: Date;
    title: string;
    productType: ProductType; // Can only compare same type
}

// ============================================
// CONSTANTS FOR UI
// ============================================

export const SKIN_TYPES: SkinType[] = ['Dry', 'Oily', 'Combination', 'Normal', 'Sensitive'];

export const SKIN_CONCERNS = [
    'Acne',
    'Rosacea',
    'Aging',
    'Wrinkles',
    'Dermatitis',
    'Eczema',
    'Hyperpigmentation',
    'Dark Spots',
    'Dryness',
    'Oiliness',
    'Large Pores',
    'Blackheads',
    'Sensitivity'
];

export const INGREDIENTS_TO_AVOID = [
    'Fragrance',
    'Parabens',
    'Silicones',
    'Alcohol',
    'Sulfates',
    'Essential Oils',
    'Retinoids',
    'AHA/BHA',
    'Mineral Oil',
    'Formaldehyde',
    'Phthalates'
];

export const COSMETIC_CATEGORIES: { value: CosmeticCategory; label: string; emoji: string }[] = [
    { value: 'skincare', label: 'Skincare', emoji: '🧴' },
    { value: 'haircare', label: 'Haircare', emoji: '💇' },
    { value: 'bodycare', label: 'Body Care', emoji: '🧼' },
    { value: 'makeup', label: 'Makeup', emoji: '💄' },
    { value: 'suncare', label: 'Sun Care', emoji: '☀️' },
    { value: 'fragrance', label: 'Fragrance', emoji: '🌸' }
];

export const APPLICATION_AREAS: { value: ApplicationArea; label: string; emoji: string }[] = [
    { value: 'face', label: 'Face', emoji: '😊' },
    { value: 'body', label: 'Body', emoji: '🧍' },
    { value: 'hair', label: 'Hair', emoji: '💇' },
    { value: 'lips', label: 'Lips', emoji: '👄' },
    { value: 'eyes', label: 'Eyes', emoji: '👁️' },
    { value: 'hands', label: 'Hands', emoji: '🤲' },
    { value: 'feet', label: 'Feet', emoji: '🦶' },
    { value: 'nails', label: 'Nails', emoji: '💅' }
];

// ============================================
// INGREDIENT DETAIL SYSTEM (Static Database)
// ============================================

export type RegulatoryStatus = 'permitted' | 'restricted' | 'banned' | 'unknown';
export type RiskLevel = 'safe' | 'low' | 'moderate' | 'high' | 'unknown';
export type IngredientOrigin = 'synthetic' | 'natural' | 'animal' | 'mineral' | 'mixed' | 'unknown';
export type IngredientContext = 'FOOD' | 'COSMETIC' | 'BOTH';

export interface RegulatoryInfo {
    status: RegulatoryStatus;
    maxConcentration?: string;
    notes?: string;
}

export interface IngredientDetail {
    // === IDENTIDAD ===
    id: string;
    name: string;
    aliases: string[];

    // === CONTEXTO ===
    context: IngredientContext;

    // === DESCRIPCIÓN ===
    description: {
        es: string;
        en: string;
    };
    functionCategories: string[];
    origin: IngredientOrigin;

    // === PUNTUACIÓN ESTÁTICA ===
    safetyScore: number | null;

    // === REGULACIONES ===
    regulations: {
        region: 'EU' | 'USA' | 'LATAM';
        info: RegulatoryInfo;
    }[];

    // === CONTEXTO ESPECÍFICO (Cosmético) ===
    comedogenicRating?: number;
    irritationPotential?: 'none' | 'low' | 'moderate' | 'high';

    // === CONTEXTO ESPECÍFICO (Alimento) ===
    isCommonAllergen?: boolean;
    allergenType?: string;

    // === CREDIBILIDAD ===
    sourceReference: string;
    lastVerified: string;
}

// === HELPER: Calcular Risk Level desde Score ===
export function getRiskLevel(score: number | null): RiskLevel {
    if (score === null) return 'unknown';
    if (score >= 80) return 'safe';
    if (score >= 60) return 'low';
    if (score >= 40) return 'moderate';
    return 'high';
}

// === HELPER: Color según Risk Level ===
export function getRiskColor(riskLevel: RiskLevel): string {
    const colors: Record<RiskLevel, string> = {
        safe: 'var(--success)',
        low: 'var(--success)',
        moderate: 'var(--warning)',
        high: 'var(--destructive)',
        unknown: 'var(--muted-foreground)',
    };
    return colors[riskLevel];
}

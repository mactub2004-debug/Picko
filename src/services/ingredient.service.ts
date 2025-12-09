/**
 * INGREDIENT SERVICE - Static Lookup (No AI)
 * 
 * Búsqueda síncrona en la base de datos local.
 * Calcula compatibilidad con el perfil del usuario.
 */

import { IngredientDetail, ProductType, UserProfile, getRiskLevel } from '../lib/types';
import { findIngredient } from '../data/ingredients-db';

// ============================================
// TYPES
// ============================================

export interface IngredientCompatibility {
    isAllergen: boolean;
    isSkinCompatible: boolean | null;
    isDietCompatible: boolean | null;
    warningLevel: 'safe' | 'caution' | 'avoid' | 'unknown';
    warningMessage: string | null;
}

export interface IngredientWithCompatibility extends IngredientDetail {
    compatibility: IngredientCompatibility;
}

export interface IngredientLookupResult {
    found: boolean;
    ingredient: IngredientWithCompatibility | null;
    fallback: { name: string; message: string } | null;
}

// ============================================
// FALLBACK MESSAGES
// ============================================

const FALLBACK_MESSAGES = {
    ES: 'Ingrediente en revisión técnica.',
    EN: 'Ingredient under technical review.'
};

// ============================================
// COMPATIBILITY CALCULATOR
// ============================================

function calculateCompatibility(
    ingredient: IngredientDetail,
    userProfile: UserProfile,
    productType: ProductType
): IngredientCompatibility {

    const result: IngredientCompatibility = {
        isAllergen: false,
        isSkinCompatible: null,
        isDietCompatible: null,
        warningLevel: 'safe',
        warningMessage: null,
    };

    const allNames = [ingredient.name, ...ingredient.aliases].map(a => a.toLowerCase());

    // === ALLERGEN CHECK ===
    if (ingredient.isCommonAllergen && ingredient.allergenType) {
        const userAllergies = userProfile.allergies ?? [];
        const hasAllergy = userAllergies.some(allergy =>
            allergy.toLowerCase() === ingredient.allergenType?.toLowerCase() ||
            allNames.some(name => name.includes(allergy.toLowerCase()))
        );

        if (hasAllergy) {
            result.isAllergen = true;
            result.warningLevel = 'avoid';
            result.warningMessage = `⚠️ Alérgeno: ${ingredient.allergenType}`;
            return result;
        }
    }

    // === COSMETIC CHECKS (con optional chaining) ===
    if (productType === 'COSMETIC') {
        const skinType = userProfile.skin?.type ?? null;
        const avoidList = userProfile.skin?.avoid ?? [];
        const skinConcerns = userProfile.skin?.concerns ?? [];

        // Check avoid list
        const shouldAvoid = avoidList.some(avoid =>
            allNames.some(name => name.includes(avoid.toLowerCase())) ||
            ingredient.functionCategories.some(cat => cat.toLowerCase().includes(avoid.toLowerCase()))
        );

        if (shouldAvoid) {
            result.isSkinCompatible = false;
            result.warningLevel = 'avoid';
            result.warningMessage = `❌ En tu lista de "evitar"`;
            return result;
        }

        // Check irritación para piel sensible
        if (skinType === 'Sensitive' && ingredient.irritationPotential === 'high') {
            result.isSkinCompatible = false;
            result.warningLevel = 'caution';
            result.warningMessage = `⚠️ Puede irritar piel sensible`;
            return result;
        }

        // Check comedogenicidad
        if (skinConcerns.includes('Acne') && (ingredient.comedogenicRating ?? 0) >= 3) {
            result.isSkinCompatible = false;
            result.warningLevel = 'caution';
            result.warningMessage = `⚠️ Puede tapar los poros`;
            return result;
        }

        result.isSkinCompatible = true;
    }

    // === FOOD CHECKS ===
    if (productType === 'FOOD') {
        const preferences = userProfile.preferences ?? [];

        if (preferences.includes('Vegan') && ingredient.origin === 'animal') {
            result.isDietCompatible = false;
            result.warningLevel = 'avoid';
            result.warningMessage = `❌ Origen animal, no apto para veganos`;
            return result;
        }

        result.isDietCompatible = true;
    }

    // === SCORE CHECK ===
    if (ingredient.safetyScore !== null && ingredient.safetyScore < 40) {
        if (result.warningLevel === 'safe') {
            result.warningLevel = 'caution';
            result.warningMessage = `⚠️ Ingrediente cuestionable`;
        }
    }

    return result;
}

// ============================================
// PUBLIC API
// ============================================

export function getIngredientDetails(
    ingredientName: string,
    productType: ProductType,
    userProfile: UserProfile,
    language: 'ES' | 'EN' = 'ES'
): IngredientLookupResult {

    const ingredient = findIngredient(ingredientName);

    if (!ingredient) {
        console.log(`⚠️ Ingredient not found: "${ingredientName}"`);
        return {
            found: false,
            ingredient: null,
            fallback: {
                name: ingredientName,
                message: FALLBACK_MESSAGES[language]
            }
        };
    }

    const compatibility = calculateCompatibility(ingredient, userProfile, productType);

    return {
        found: true,
        ingredient: { ...ingredient, compatibility },
        fallback: null
    };
}

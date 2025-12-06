/**
 * Scoring Service - Strategy Pattern for Product Scoring
 * Handles different scoring logic for FOOD and COSMETIC products
 * 
 * @version 1.0
 */

import { Product, FoodProduct, CosmeticProduct, isFoodProduct, isCosmeticProduct } from '../lib/types';
import { UserProfile } from '../lib/demo-data';

// ============================================
// SCORING RESULT INTERFACE
// ============================================

export interface ScoringDeduction {
    reason: string;
    points: number;
    isCritical: boolean;
}

export interface ScoringBonus {
    reason: string;
    points: number;
}

export interface ScoringResult {
    score: number;
    verdict: 'suitable' | 'questionable' | 'not-recommended';
    deductions: ScoringDeduction[];
    bonuses: ScoringBonus[];
}

// ============================================
// STRATEGY INTERFACE
// ============================================

interface ScoringStrategy {
    calculateScore(product: Product, userProfile: UserProfile): ScoringResult;
}

// ============================================
// FOOD SCORING STRATEGY
// ============================================

class FoodScoringStrategy implements ScoringStrategy {
    // Known comedogenic ingredients for cross-reference
    private allergenNormalization: Record<string, string[]> = {
        'milk': ['milk', 'leche', 'dairy', 'lactose', 'whey', 'casein'],
        'peanuts': ['peanuts', 'maní', 'cacahuates', 'peanut'],
        'gluten': ['gluten', 'wheat', 'trigo', 'barley', 'rye'],
        'soy': ['soy', 'soja', 'soybean'],
        'tree_nuts': ['tree_nuts', 'almonds', 'walnuts', 'cashews', 'hazelnuts', 'frutos secos'],
        'eggs': ['eggs', 'huevos', 'egg'],
        'fish': ['fish', 'pescado'],
        'shellfish': ['shellfish', 'mariscos', 'shrimp', 'crab', 'lobster']
    };

    calculateScore(product: FoodProduct, userProfile: UserProfile): ScoringResult {
        const deductions: ScoringDeduction[] = [];
        const bonuses: ScoringBonus[] = [];
        let score = 100;

        const nutrition = product.nutrition;
        if (!nutrition) {
            return { score: 50, verdict: 'questionable', deductions: [], bonuses: [] };
        }

        // =====================
        // CRITICAL: Allergen Check
        // =====================
        const foundAllergen = this.checkAllergens(product, userProfile);
        if (foundAllergen) {
            deductions.push({
                reason: `Contiene alérgeno del usuario: ${foundAllergen}`,
                points: 100,
                isCritical: true
            });
            return {
                score: 0,
                verdict: 'not-recommended',
                deductions,
                bonuses
            };
        }

        // =====================
        // Nutritional Deductions
        // =====================

        // Sugar > 10g/100g
        if (nutrition.sugar > 10) {
            const isLosingWeight = userProfile.goals.some(g =>
                g.toLowerCase().includes('lose') || g.toLowerCase().includes('perder')
            );
            const points = isLosingWeight ? 25 : 15;
            score -= points;
            deductions.push({
                reason: `Alto en azúcar (${nutrition.sugar}g)${isLosingWeight ? ' - penalizado por objetivo de pérdida de peso' : ''}`,
                points,
                isCritical: false
            });
        }

        // Sodium > 400mg
        if (nutrition.sodium > 400) {
            score -= 10;
            deductions.push({
                reason: `Alto en sodio (${nutrition.sodium}mg)`,
                points: 10,
                isCritical: false
            });
        }

        // Ultra-processed (>10 ingredients)
        if (product.ingredients && product.ingredients.length > 10) {
            score -= 10;
            deductions.push({
                reason: `Producto ultra-procesado (${product.ingredients.length} ingredientes)`,
                points: 10,
                isCritical: false
            });
        }

        // High calories for weight loss goals
        const isLosingWeight = userProfile.goals.some(g =>
            g.toLowerCase().includes('lose') || g.toLowerCase().includes('perder')
        );
        if (isLosingWeight && nutrition.calories > 300) {
            score -= 10;
            deductions.push({
                reason: `Alto en calorías para objetivo de pérdida de peso (${nutrition.calories}kcal)`,
                points: 10,
                isCritical: false
            });
        }

        // =====================
        // Bonuses
        // =====================

        // Protein > 15g
        if (nutrition.protein > 15) {
            score += 10;
            bonuses.push({
                reason: `Alto en proteína (${nutrition.protein}g)`,
                points: 10
            });
        }

        // Fiber > 5g
        if (nutrition.fiber > 5) {
            score += 5;
            bonuses.push({
                reason: `Alto en fibra (${nutrition.fiber}g)`,
                points: 5
            });
        }

        // Low sugar
        if (nutrition.sugar < 3) {
            score += 5;
            bonuses.push({
                reason: 'Bajo en azúcar',
                points: 5
            });
        }

        // Clamp score
        score = Math.max(0, Math.min(100, score));

        // Determine verdict
        let verdict: 'suitable' | 'questionable' | 'not-recommended';
        if (score >= 70) {
            verdict = 'suitable';
        } else if (score >= 40) {
            verdict = 'questionable';
        } else {
            verdict = 'not-recommended';
        }

        return { score, verdict, deductions, bonuses };
    }

    private checkAllergens(product: FoodProduct, userProfile: UserProfile): string | null {
        if (!product.allergens || product.allergens.length === 0) return null;

        for (const userAllergen of userProfile.allergies) {
            const normalizedUserAllergen = userAllergen.toLowerCase();

            // Check direct match
            for (const productAllergen of product.allergens) {
                const normalizedProductAllergen = productAllergen.toLowerCase();

                // Direct match
                if (normalizedProductAllergen.includes(normalizedUserAllergen) ||
                    normalizedUserAllergen.includes(normalizedProductAllergen)) {
                    return userAllergen;
                }

                // Check via normalization map
                for (const [key, variants] of Object.entries(this.allergenNormalization)) {
                    if (variants.some(v => normalizedUserAllergen.includes(v))) {
                        if (variants.some(v => normalizedProductAllergen.includes(v))) {
                            return userAllergen;
                        }
                    }
                }
            }
        }
        return null;
    }
}

// ============================================
// COSMETIC SCORING STRATEGY
// ============================================

class CosmeticScoringStrategy implements ScoringStrategy {
    // Comedogenic ingredients (high risk for acne)
    private comedogenicIngredients = [
        'coconut oil', 'aceite de coco',
        'cocoa butter', 'manteca de cacao',
        'wheat germ oil', 'aceite de germen de trigo',
        'isopropyl myristate',
        'lanolin', 'lanolina',
        'algae extract', 'extracto de alga',
        'lauric acid', 'ácido láurico'
    ];

    // Beneficial ingredients for dry skin
    private beneficialForDry = [
        'ceramides', 'ceramidas',
        'hyaluronic acid', 'ácido hialurónico',
        'glycerin', 'glicerina',
        'squalane', 'escualano',
        'shea butter', 'manteca de karité',
        'jojoba oil', 'aceite de jojoba'
    ];

    // Beneficial ingredients for oily skin
    private beneficialForOily = [
        'niacinamide', 'niacinamida',
        'salicylic acid', 'ácido salicílico',
        'zinc', 'zinc',
        'retinol',
        'benzoyl peroxide', 'peróxido de benzoílo',
        'tea tree', 'árbol de té'
    ];

    // Common irritants
    private commonIrritants = [
        'fragrance', 'parfum', 'fragancia', 'perfume',
        'alcohol denat', 'alcohol desnaturalizado',
        'essential oils', 'aceites esenciales',
        'menthol', 'mentol',
        'eucalyptus', 'eucalipto'
    ];

    calculateScore(product: CosmeticProduct, userProfile: UserProfile): ScoringResult {
        const deductions: ScoringDeduction[] = [];
        const bonuses: ScoringBonus[] = [];
        let score = 100;

        const skinProfile = userProfile.skin;
        if (!skinProfile || !skinProfile.type) {
            // No skin profile - neutral score with basic checks
            return this.basicScore(product);
        }

        const ingredientsLower = product.ingredients.map(i => i.toLowerCase());

        // =====================
        // CRITICAL: Sensitive Skin + Fragrance/Alcohol
        // =====================
        if (skinProfile.type === 'Sensitive') {
            if (product.attributes.hasFragrance) {
                score -= 30;
                deductions.push({
                    reason: 'Contiene fragancia (piel sensible)',
                    points: 30,
                    isCritical: true
                });
            }
            if (product.attributes.hasAlcohol) {
                score -= 30;
                deductions.push({
                    reason: 'Contiene alcohol (piel sensible)',
                    points: 30,
                    isCritical: true
                });
            }
        }

        // =====================
        // Acne + Comedogenic Ingredients
        // =====================
        if (skinProfile.concerns.some(c => c.toLowerCase().includes('acne') || c.toLowerCase().includes('acné'))) {
            const foundComedogenic = ingredientsLower.some(ing =>
                this.comedogenicIngredients.some(c => ing.includes(c))
            );
            if (foundComedogenic || !product.attributes.isNonComedogenic) {
                score -= 20;
                deductions.push({
                    reason: 'Ingredientes comedogénicos (usuario con acné)',
                    points: 20,
                    isCritical: false
                });
            }
        }

        // =====================
        // User Avoids Specific Ingredients
        // =====================
        for (const avoid of skinProfile.avoid) {
            const avoidLower = avoid.toLowerCase();

            // Check fragrance
            if (avoidLower.includes('fragrance') || avoidLower.includes('fragancia')) {
                if (product.attributes.hasFragrance) {
                    score -= 20;
                    deductions.push({
                        reason: `Contiene fragancia (usuario evita)`,
                        points: 20,
                        isCritical: false
                    });
                }
            }

            // Check alcohol
            if (avoidLower.includes('alcohol')) {
                if (product.attributes.hasAlcohol) {
                    score -= 20;
                    deductions.push({
                        reason: `Contiene alcohol (usuario evita)`,
                        points: 20,
                        isCritical: false
                    });
                }
            }

            // Check parabens
            if (avoidLower.includes('paraben')) {
                if (!product.attributes.isParabenFree) {
                    score -= 20;
                    deductions.push({
                        reason: `Contiene parabenos (usuario evita)`,
                        points: 20,
                        isCritical: false
                    });
                }
            }

            // Check sulfates
            if (avoidLower.includes('sulfat')) {
                if (!product.attributes.isSulfateFree) {
                    score -= 15;
                    deductions.push({
                        reason: `Contiene sulfatos (usuario evita)`,
                        points: 15,
                        isCritical: false
                    });
                }
            }
        }

        // =====================
        // Bonuses for Matching Skin Type
        // =====================
        if (skinProfile.type === 'Dry') {
            const hasBeneficial = ingredientsLower.some(ing =>
                this.beneficialForDry.some(b => ing.includes(b))
            );
            if (hasBeneficial) {
                score += 15;
                bonuses.push({
                    reason: 'Ingredientes hidratantes (piel seca)',
                    points: 15
                });
            }
        }

        if (skinProfile.type === 'Oily') {
            const hasBeneficial = ingredientsLower.some(ing =>
                this.beneficialForOily.some(b => ing.includes(b))
            );
            if (hasBeneficial) {
                score += 15;
                bonuses.push({
                    reason: 'Ingredientes controladores de grasa (piel grasa)',
                    points: 15
                });
            }
        }

        // Bonus for cruelty-free/vegan
        if (product.attributes.isCrueltyFree) {
            score += 5;
            bonuses.push({
                reason: 'Libre de crueldad animal',
                points: 5
            });
        }

        if (product.attributes.isVegan) {
            score += 5;
            bonuses.push({
                reason: 'Producto vegano',
                points: 5
            });
        }

        // Clamp score
        score = Math.max(0, Math.min(100, score));

        // Determine verdict
        let verdict: 'suitable' | 'questionable' | 'not-recommended';
        if (score >= 70) {
            verdict = 'suitable';
        } else if (score >= 40) {
            verdict = 'questionable';
        } else {
            verdict = 'not-recommended';
        }

        return { score, verdict, deductions, bonuses };
    }

    private basicScore(product: CosmeticProduct): ScoringResult {
        const bonuses: ScoringBonus[] = [];
        const deductions: ScoringDeduction[] = [];
        let score = 75; // Neutral starting point

        if (product.attributes.isNonComedogenic) {
            score += 5;
            bonuses.push({ reason: 'No comedogénico', points: 5 });
        }
        if (!product.attributes.hasFragrance) {
            score += 5;
            bonuses.push({ reason: 'Sin fragancia', points: 5 });
        }
        if (product.attributes.isCrueltyFree) {
            score += 5;
            bonuses.push({ reason: 'Libre de crueldad', points: 5 });
        }

        if (product.attributes.hasAlcohol) {
            score -= 10;
            deductions.push({ reason: 'Contiene alcohol', points: 10, isCritical: false });
        }

        return {
            score: Math.max(0, Math.min(100, score)),
            verdict: score >= 70 ? 'suitable' : score >= 40 ? 'questionable' : 'not-recommended',
            deductions,
            bonuses
        };
    }
}

// ============================================
// FACTORY & MAIN EXPORT
// ============================================

const foodStrategy = new FoodScoringStrategy();
const cosmeticStrategy = new CosmeticScoringStrategy();

/**
 * Calculate score for any product based on its type
 */
export function calculateProductScore(product: Product, userProfile: UserProfile): ScoringResult {
    if (isFoodProduct(product)) {
        return foodStrategy.calculateScore(product, userProfile);
    } else if (isCosmeticProduct(product)) {
        return cosmeticStrategy.calculateScore(product, userProfile);
    }

    // Fallback for unknown types
    return {
        score: 50,
        verdict: 'questionable',
        deductions: [],
        bonuses: []
    };
}

/**
 * Get scoring strategy by product type
 */
export function getScoringStrategy(productType: 'FOOD' | 'COSMETIC'): ScoringStrategy {
    return productType === 'FOOD' ? foodStrategy : cosmeticStrategy;
}

/**
 * Quick score calculation (just the number)
 */
export function quickScore(product: Product, userProfile: UserProfile): number {
    return calculateProductScore(product, userProfile).score;
}

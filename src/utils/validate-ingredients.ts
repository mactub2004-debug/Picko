/**
 * VALIDACIÓN DE COBERTURA DE INGREDIENTES
 * 
 * Uso:
 * 1. Automático: Se ejecuta en DEV al cargar la app
 * 2. Manual: window.validateIngredients() en consola del browser
 */

import { demoFoodProducts, demoCosmeticProducts } from '../lib/demo-data';
import { findIngredient, TOTAL_INGREDIENTS_COUNT } from '../data/ingredients-db';

export interface CoverageResult {
    totalProducts: number;
    totalInDB: number;
    uniqueInProducts: number;
    found: number;
    missing: string[];
    coverage: string;
    isValid: boolean;
}

export function validateIngredientsCoverage(): CoverageResult {
    const allProducts = [...demoFoodProducts, ...demoCosmeticProducts];

    // Extraer ingredientes únicos
    const unique = new Set<string>();
    allProducts.forEach(p => p.ingredients?.forEach(i => unique.add(i)));

    const list = Array.from(unique);
    const found: string[] = [];
    const missing: string[] = [];

    list.forEach(i => findIngredient(i) ? found.push(i) : missing.push(i));

    const result: CoverageResult = {
        totalProducts: allProducts.length,
        totalInDB: TOTAL_INGREDIENTS_COUNT,
        uniqueInProducts: list.length,
        found: found.length,
        missing,
        coverage: ((found.length / list.length) * 100).toFixed(1) + '%',
        isValid: missing.length === 0
    };

    // Console output formateado
    console.log('\n========================================');
    console.log('🔍 INGREDIENT COVERAGE VALIDATION');
    console.log('========================================');
    console.log(`📦 Products: ${result.totalProducts}`);
    console.log(`📚 DB Size: ${result.totalInDB}`);
    console.log(`🧪 Unique: ${result.uniqueInProducts}`);
    console.log(`✅ Found: ${result.found}`);
    console.log(`❌ Missing: ${result.missing.length}`);
    console.log(`📊 Coverage: ${result.coverage}`);

    if (missing.length > 0) {
        console.log('\n❌ MISSING INGREDIENTS:');
        missing.forEach(i => console.log(`   - "${i}"`));
    } else {
        console.log('\n✅ ALL INGREDIENTS COVERED!');
    }
    console.log('========================================\n');

    return result;
}

// Exponer globalmente para debug en browser
if (typeof window !== 'undefined') {
    (window as any).validateIngredients = validateIngredientsCoverage;
}

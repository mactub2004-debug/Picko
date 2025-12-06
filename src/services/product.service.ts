import { Product, demoProducts, demoFoodProducts, UserProfile } from '../lib/demo-data';
import { isFoodProduct, FoodProduct } from '../lib/types';
import { StorageService } from '../lib/storage';

export const ProductService = {
    /**
     * Get all products for display, merging demo data with scan history.
     * If a product has been scanned, use the scanned version (with score/status)
     * instead of the static demo version.
     * ALSO includes products that were scanned but are NOT in demo data.
     */
    getAllProducts: (): Product[] => {
        const history = StorageService.getScanHistory();

        // Create a map of scanned products by ID for fast lookup
        // Use the MOST RECENT scan for each product
        const scannedProductMap = new Map<string, Product>();
        history.forEach(item => {
            if (!scannedProductMap.has(item.product.id)) {
                scannedProductMap.set(item.product.id, item.product);
            }
        });

        // Track which demo product IDs we've processed
        const demoProductIds = new Set(demoProducts.map(p => p.id));

        // Merge demo products with scanned data
        const merged = demoProducts.map(demoProduct => {
            const scannedVersion = scannedProductMap.get(demoProduct.id);
            if (scannedVersion && (scannedVersion.nutritionScore !== undefined || scannedVersion.score !== undefined)) {
                return scannedVersion;
            }
            return demoProduct;
        });

        // Add scanned products that are NOT in demo data (new products)
        const newScannedProducts: Product[] = [];
        scannedProductMap.forEach((product, id) => {
            if (!demoProductIds.has(id)) {
                newScannedProducts.push(product);
            }
        });

        // Combine: scanned products first (most relevant), then demo products
        const allProducts = [...newScannedProducts, ...merged];

        console.log('📦 ProductService: Total products:', allProducts.length, '(', newScannedProducts.length, 'new scanned)');

        return allProducts;
    },

    /**
     * Get all products filtered by type
     */
    getProductsByType: (type: 'FOOD' | 'COSMETIC'): Product[] => {
        return ProductService.getAllProducts().filter(p => p.type === type);
    },

    /**
     * Get recommended products based on user profile rules (NO AI).
     * Rules:
     * 1. EXCLUDE products containing user allergens.
     * 2. PRIORITIZE products matching goals (simple heuristics).
     * 3. For now, only recommend FOOD products (cosmetic recommendations TBD)
     */
    getRecommendedProducts: (userProfile: UserProfile): Product[] => {
        const allProducts = ProductService.getAllProducts();

        // Filter to only FOOD products for recommendations (cosmetics need different logic)
        const foodProducts = allProducts.filter(isFoodProduct);

        // Map user allergen names to technical IDs
        const allergenMap: Record<string, string> = {
            'Milk': 'milk', 'Leche': 'milk',
            'Peanuts': 'peanuts', 'Maní': 'peanuts', 'Cacahuates': 'peanuts',
            'Gluten': 'gluten',
            'Soy': 'soy', 'Soja': 'soy',
            'Tree Nuts': 'tree_nuts', 'Frutos secos': 'tree_nuts',
            'Wheat': 'wheat', 'Trigo': 'wheat',
            'Eggs': 'eggs', 'Huevos': 'eggs',
            'Fish': 'fish', 'Pescado': 'fish',
            'Shellfish': 'shellfish', 'Mariscos': 'shellfish'
        };

        // Helper to check safety (only for food products with allergens)
        const isSafe = (product: FoodProduct) => {
            if (!product.allergens || product.allergens.length === 0) return true;
            return !userProfile.allergies.some(userAllergen => {
                const normalizedUserAllergen = allergenMap[userAllergen] || userAllergen.toLowerCase();
                return product.allergens.some(productAllergen =>
                    productAllergen.toLowerCase() === normalizedUserAllergen
                );
            });
        };

        // 1. Always include SCANNED food products
        const scannedFoodProducts = foodProducts.filter(p =>
            !demoFoodProducts.find(dp => dp.id === p.id) ||
            p.nutritionScore !== undefined ||
            p.score !== undefined
        );

        // 2. Filter DEMO food products for safety
        const safeDemoProducts = demoFoodProducts.filter(p =>
            !scannedFoodProducts.find(sp => sp.id === p.id) && isSafe(p)
        );

        // Combine: Scanned first, then safe recommendations
        const combined = [...scannedFoodProducts, ...safeDemoProducts];

        // 3. Score based on goals (Simple Heuristic) - ONLY for food products
        const scoredProducts = combined.map(product => {
            let score = 0;

            // Safely access nutrition (all food products should have it)
            const nutrition = product.nutrition;
            if (!nutrition) return { product, score: 0 };

            // Goal: Muscle Gain -> High Protein
            if (userProfile.goals.includes('Gain muscle') || userProfile.goals.includes('Ganar masa muscular')) {
                if (nutrition.protein > 10) score += 2;
                if (nutrition.protein > 20) score += 3;
            }

            // Goal: Lose Weight -> Low Calories / Low Sugar
            if (userProfile.goals.includes('Lose weight') || userProfile.goals.includes('Perder peso')) {
                if (nutrition.calories < 200) score += 2;
                if (nutrition.sugar < 5) score += 2;
            }

            // Goal: Eat Healthy -> High Fiber / Low Sodium
            if (userProfile.goals.includes('Eat healthy') || userProfile.goals.includes('Comer saludable')) {
                if (nutrition.fiber > 3) score += 1;
                if (nutrition.sodium < 140) score += 1;
                if (product.ingredients.length < 5) score += 2; // Less processed
            }

            return { product, score };
        });

        // Sort by score descending and take top 5
        return scoredProducts
            .sort((a, b) => b.score - a.score)
            .map(item => item.product)
            .slice(0, 5);
    },

    /**
     * Get a specific product by ID, preferring the scanned version.
     */
    getProductById: (id: string): Product | undefined => {
        const allProducts = ProductService.getAllProducts();
        return allProducts.find(p => p.id === id);
    }
};

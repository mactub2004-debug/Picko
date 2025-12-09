import { Mistral } from '@mistralai/mistralai';
import { Product } from '../lib/demo-data';
import { UserProfile } from '../lib/storage';
import { Language } from '../lib/translations';

const apiKey = '35CzGfsu0lapN9CyB6rZ1ziTYLfVoY7e'; // HARDCODED TEST

console.log('🔑 API Key loaded:', apiKey ? `${apiKey.substring(0, 10)}...` : 'NOT FOUND');
console.log('🔍 All env vars:', import.meta.env);

if (!apiKey) {
    console.error('❌ VITE_MISTRAL_API_KEY not found in environment variables!');
}

const client = apiKey ? new Mistral({ apiKey }) : null;

export interface AIAnalysisResult {
    status: 'suitable' | 'questionable' | 'not-recommended';
    nutritionScore: number;
    benefits: string[];
    issues: string[];
    aiDescription: string;
    ingredients?: string[];
    allergens?: string[];
}

// Emergency translation dictionary for fallback mode
const INGREDIENT_TRANSLATIONS: Record<string, string> = {
    'Water': 'Agua',
    'Milk': 'Leche',
    'Sugar': 'Azúcar',
    'Salt': 'Sal',
    'Peanuts': 'Cacahuetes',
    'Wheat': 'Trigo',
    'Soy': 'Soja',
    'Eggs': 'Huevos',
    'Tree Nuts': 'Frutos de cáscara',
    'Almonds': 'Almendras',
    'Organic Almonds': 'Almendras orgánicas',
    'Sea Salt': 'Sal marina',
    'Sunflower Lecithin': 'Lecitina de girasol',
    'Whey Protein': 'Proteína de suero',
    'Palm Oil': 'Aceite de palma',
    'Soy Lecithin': 'Lecitina de soja',
    'Wheat Flour': 'Harina de trigo',
    'MSG': 'Glutamato monosódico',
    'Artificial Flavors': 'Sabores artificiales',
    'Live Active Cultures': 'Cultivos activos vivos',
    'Potatoes': 'Patatas',
    'Vegetable Oil': 'Aceite vegetal',
    'Artificial Colors': 'Colorantes artificiales',
    'Quinoa': 'Quinua',
    'Black Beans': 'Frijoles negros',
    'Corn': 'Maíz',
    'Peppers': 'Pimientos',
    'Olive Oil': 'Aceite de oliva',
    'Spices': 'Especias',
    'Gluten': 'Gluten'
};

/**
 * AI Prompts in different languages
 */
const AI_PROMPTS = {
    ES: {
        role: 'Eres un experto nutricionista estricto.',
        product: 'PRODUCTO',
        name: 'Nombre',
        brand: 'Marca',
        category: 'Categoría',
        ingredients: 'Ingredientes',
        allergens: 'Alérgenos',
        none: 'Ninguno',
        nutritionInfo: 'Información nutricional (por',
        calories: 'Calorías',
        protein: 'Proteínas',
        carbs: 'Carbohidratos',
        sugar: 'Azúcares',
        fat: 'Grasas',
        sodium: 'Sodio',
        fiber: 'Fibra',
        userProfile: 'PERFIL DEL USUARIO',
        allergies: 'Alergias',
        preferences: 'Preferencias dietéticas',
        goals: 'Objetivos de salud',
        instructions: 'INSTRUCCIONES',
        instruction1: 'Determina si el producto es "suitable" (adecuado), "questionable" (cuestionable) o "not-recommended" (no recomendado) para este usuario.',
        instruction2: 'Asigna una puntuación nutricional de 0 a 100 (donde 100 es excelente).',
        instruction3: 'Lista 2-4 beneficios específicos del producto.',
        instruction4: 'Lista 2-4 preocupaciones o problemas específicos.',
        instruction5: 'Escribe una descripción personalizada de 2-3 oraciones explicando por qué es adecuado o no para este usuario.',
        responseFormat: 'Responde ÚNICAMENTE con un objeto JSON válido en este formato exacto'
    },
    EN: {
        role: 'You are a strict expert nutritionist.',
        product: 'PRODUCT',
        name: 'Name',
        brand: 'Brand',
        category: 'Category',
        ingredients: 'Ingredients',
        allergens: 'Allergens',
        none: 'None',
        nutritionInfo: 'Nutritional information (per',
        calories: 'Calories',
        protein: 'Protein',
        carbs: 'Carbohydrates',
        sugar: 'Sugar',
        fat: 'Fat',
        sodium: 'Sodium',
        fiber: 'Fiber',
        userProfile: 'USER PROFILE',
        allergies: 'Allergies',
        preferences: 'Dietary preferences',
        goals: 'Health goals',
        instructions: 'INSTRUCTIONS',
        instruction1: 'Determine if the product is "suitable", "questionable", or "not-recommended" for this user.',
        instruction2: 'Assign a nutrition score from 0 to 100 (where 100 is excellent).',
        instruction3: 'List 2-4 specific benefits of the product.',
        instruction4: 'List 2-4 specific concerns or issues.',
        instruction5: 'Write a personalized description of 2-3 sentences explaining why it is or isn\'t suitable for this user.',
        responseFormat: 'Respond ONLY with a valid JSON object in this exact format'
    }
};

/**
 * Generate AI prompt in the specified language
 */
// Simple in-memory cache to store analysis results
const analysisCache = new Map<string, AIAnalysisResult>();

/**
 * Clear the analysis cache (call when user logs out or changes)
 */
export function clearAnalysisCache() {
    analysisCache.clear();
    console.log('🧹 Analysis cache cleared');
}

// Expose to window for debugging
if (typeof window !== 'undefined') {
    (window as any).clearAICache = clearAnalysisCache;
}

/**
 * Generate cache key based on product and complete user profile
 */
function generateCacheKey(productId: string, userProfile: UserProfile, language: Language): string {
    // Include ALL user profile data to ensure personalized analysis
    const profileHash = [
        userProfile.allergies.sort().join(','),
        userProfile.preferences.sort().join(','),
        userProfile.goals.sort().join(',')
    ].join('|');

    return `${productId}-${language}-${profileHash}`;
}

/**
 * Generate FOOD product AI prompt - HUMANIZED & OPTIMIZED
 */
function generateFoodPrompt(product: any, userProfile: UserProfile, language: Language): string {
    const nutrition = product.nutrition || { servingSize: 'N/A', calories: 0, sugar: 0, sodium: 0, protein: 0, fiber: 0, fat: 0 };
    const userName = userProfile.name?.split(' ')[0] || '';
    const mainGoal = userProfile.goals?.[0] || '';

    const prompt = language === 'ES' ?
        `Sos el asistente de compras de ${userName || 'esta persona'}. Ayudalo a decidir si este producto le conviene. Hablale como a un amigo cercano, con confianza y calidez.

SOBRE ${userName ? userName.toUpperCase() : 'EL USUARIO'}:
- Quiere: ${userProfile.goals.join(', ') || 'comer mejor'}
- Alergias: ${userProfile.allergies.join(', ') || 'ninguna'}
- Prefiere: ${userProfile.preferences.join(', ') || 'sin preferencias especiales'}

PRODUCTO: ${product.name} de ${product.brand}
Ingredientes: ${product.ingredients?.join(', ') || 'no disponibles'}
Alérgenos: ${product.allergens?.join(', ') || 'ninguno'}
Por ${nutrition.servingSize}: ${nutrition.calories}cal | Azúcar:${nutrition.sugar}g | Sal:${nutrition.sodium}mg | Proteína:${nutrition.protein}g

INSTRUCCIONES:
- Si tiene algo a lo que es alérgico o va contra su dieta → "not-recommended" y score máximo 30
- Hablá en primera persona del plural ("te recomiendo", "deberías", "podrías")
- En aiDescription: 3-4 oraciones naturales. Mencioná su objetivo ("${mainGoal || 'comer más sano'}") si aplica. Dale un consejo práctico.
- benefits/issues: frases cortas y claras ("Te da energía", "Tiene mucha azúcar")

JSON:
{"status":"suitable|questionable|not-recommended","nutritionScore":0-100,"benefits":["..."],"issues":["..."],"aiDescription":"...","ingredients":["en español"],"allergens":["en español"]}`
        :
        `You're ${userName || 'this person'}'s shopping assistant. Help them decide if this product is right for them. Talk like a close friend - warm and trustworthy.

ABOUT ${userName ? userName.toUpperCase() : 'THE USER'}:
- Wants to: ${userProfile.goals.join(', ') || 'eat healthier'}
- Allergies: ${userProfile.allergies.join(', ') || 'none'}
- Prefers: ${userProfile.preferences.join(', ') || 'no special preferences'}

PRODUCT: ${product.name} by ${product.brand}
Ingredients: ${product.ingredients?.join(', ') || 'not available'}
Allergens: ${product.allergens?.join(', ') || 'none'}
Per ${nutrition.servingSize}: ${nutrition.calories}cal | Sugar:${nutrition.sugar}g | Salt:${nutrition.sodium}mg | Protein:${nutrition.protein}g

INSTRUCTIONS:
- If contains their allergens or violates their diet → "not-recommended" and max score 30
- Talk directly to them ("I'd suggest", "you might want to", "this could help you")
- In aiDescription: 3-4 natural sentences. Reference their goal ("${mainGoal || 'eating healthier'}") if relevant. Give practical advice.
- benefits/issues: short clear phrases ("Gives you energy", "High in sugar")

JSON:
{"status":"suitable|questionable|not-recommended","nutritionScore":0-100,"benefits":["..."],"issues":["..."],"aiDescription":"...","ingredients":["translated"],"allergens":["translated"]}`;

    return prompt;
}


/**
 * Generate COSMETIC product AI prompt - HUMANIZED & OPTIMIZED
 */
function generateCosmeticPrompt(product: any, userProfile: UserProfile, language: Language): string {
    const skin = userProfile.skin || { type: 'Normal', concerns: [], avoid: [] };
    const attributes = product.attributes || {};
    const userName = userProfile.name?.split(' ')[0] || '';
    const mainConcern = skin.concerns?.[0] || '';

    const prompt = language === 'ES' ?
        `Sos el asistente de belleza de ${userName || 'esta persona'}. Ayudalo a decidir si este producto es bueno para su piel. Hablale como una amiga que sabe de skincare.

SOBRE LA PIEL DE ${userName ? userName.toUpperCase() : 'ESTA PERSONA'}:
- Tipo de piel: ${skin.type || 'no especificado'}
- Le preocupa: ${skin.concerns?.join(', ') || 'nada en particular'}
- Quiere evitar: ${skin.avoid?.join(', ') || 'nada'}

PRODUCTO: ${product.name} de ${product.brand}
Para: ${product.applicationArea || 'rostro'}
Ingredientes: ${product.ingredients?.join(', ') || 'no disponibles'}
Info: ${attributes.hasFragrance ? '⚠️ Tiene perfume' : '✓ Sin perfume'}, ${attributes.hasAlcohol ? '⚠️ Tiene alcohol' : '✓ Sin alcohol'}

INSTRUCCIONES:
- Si tiene ingredientes que debería evitar o puede empeorar su problema → "not-recommended" y score bajo
- Si tiene piel sensible y el producto tiene perfume/alcohol → cuidado
- Si le preocupa el acné y el producto puede tapar poros → cuidado
- Hablale directo ("te va a", "cuidado porque", "lo bueno es que")
- En aiDescription: 3-4 oraciones naturales. Mencioná su problema ("${mainConcern || 'tu piel'}") si aplica.

JSON:
{"status":"suitable|questionable|not-recommended","nutritionScore":0-100,"benefits":["..."],"issues":["..."],"aiDescription":"...","keyActives":["ingredientes buenos"],"irritantsFound":["ingredientes que irritan"]}`
        :
        `You're ${userName || 'this person'}'s beauty assistant. Help them decide if this product is good for their skin. Talk like a friend who knows skincare.

ABOUT ${userName ? userName.toUpperCase() + "'S" : 'THEIR'} SKIN:
- Skin type: ${skin.type || 'not specified'}
- Concerns: ${skin.concerns?.join(', ') || 'nothing specific'}
- Wants to avoid: ${skin.avoid?.join(', ') || 'nothing'}

PRODUCT: ${product.name} by ${product.brand}
For: ${product.applicationArea || 'face'}
Ingredients: ${product.ingredients?.join(', ') || 'not available'}
Info: ${attributes.hasFragrance ? '⚠️ Has fragrance' : '✓ Fragrance-free'}, ${attributes.hasAlcohol ? '⚠️ Has alcohol' : '✓ Alcohol-free'}

INSTRUCTIONS:
- If has ingredients they should avoid or could worsen their concern → "not-recommended" and low score
- If sensitive skin + fragrance/alcohol → be careful
- If acne concern + pore-clogging ingredients → be careful
- Talk directly ("this will", "watch out because", "the good news is")
- In aiDescription: 3-4 natural sentences. Reference their concern ("${mainConcern || 'your skin'}") if relevant.

JSON:
{"status":"suitable|questionable|not-recommended","nutritionScore":0-100,"benefits":["..."],"issues":["..."],"aiDescription":"...","keyActives":["good ingredients"],"irritantsFound":["irritating ingredients"]}`;

    return prompt;
}


/**
 * Generate AI prompt based on product type
 */
function generatePrompt(product: any, userProfile: UserProfile, language: Language): string {
    // Check product type and use appropriate prompt
    if (product.type === 'COSMETIC') {
        return generateCosmeticPrompt(product, userProfile, language);
    }
    // Default to food prompt (for backward compatibility)
    return generateFoodPrompt(product, userProfile, language);
}
export async function analyzeProductWithAI(
    product: any,
    userProfile: UserProfile,
    language: Language = 'ES'
): Promise<AIAnalysisResult> {
    // 1. Check Cache with complete user profile
    const cacheKey = generateCacheKey(product.id, userProfile, language);
    if (analysisCache.has(cacheKey)) {
        console.log('✅ Returning cached analysis for:', product.name);
        return analysisCache.get(cacheKey)!;
    }

    // FORCE AI MODE - No fallback allowed
    if (!client) {
        throw new Error('❌ Mistral API key not configured. AI analysis is required.');
    }

    try {
        const startTime = Date.now();
        console.log('🤖 Calling Mistral AI (mistral-small-latest) for:', product.name);
        const prompt = generatePrompt(product, userProfile, language);

        const response = await client.chat.complete({
            model: 'mistral-small-latest',
            messages: [{ role: 'user', content: prompt }],
            maxTokens: 500,
            temperature: 0.2
        });

        const endTime = Date.now();
        console.log(`⏱️ AI analysis took ${endTime - startTime} ms`);

        let content = response.choices?.[0]?.message?.content;

        if (!content || typeof content !== 'string') {
            throw new Error('Invalid response format from AI');
        }

        // Clean content
        content = content.replace(/[\u0000-\u001F\u007F-\u009F]/g, "");
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('Invalid JSON response from AI');
        }

        const result = JSON.parse(jsonMatch[0]);

        // Validate response
        if (!result.status || result.nutritionScore === undefined) {
            throw new Error('Incomplete AI response');
        }

        console.log('✅ AI analysis successful:', result.nutritionScore);

        // 2. Save to Cache
        analysisCache.set(cacheKey, result);

        return result;
    } catch (error: any) {
        console.error('❌ Error analyzing product with AI:', error);

        // Check specific error types
        if (error?.message?.includes('401') || error?.message?.includes('Unauthorized')) {
            throw new Error('❌ API Key inválida. Verifica tu VITE_MISTRAL_API_KEY en .env');
        }

        if (error?.message?.includes('429') || error?.message?.includes('rate') || error?.message?.includes('capacity exceeded')) {
            throw new Error('⚠️ Límite de API alcanzado. Espera unos minutos e intenta de nuevo.');
        }

        // Re-throw the error - NO FALLBACK
        throw error;
    }
}

/**
 * Fallback messages in different languages
 */
const FALLBACK_MESSAGES = {
    ES: {
        containsAllergens: 'Contiene alérgenos',
        notRecommendedAllergies: 'No recomendado debido a tus alergias',
        allergenWarning: (allergens: string) => `Este producto contiene ${allergens}, que está en tu lista de alergias.No es seguro para ti consumirlo.`,
        highSugar: (amount: number) => `Alto contenido de azúcar(${amount}g)`,
        lowSugar: 'Bajo en azúcar',
        highSodium: (amount: number) => `Alto contenido de sodio(${amount}mg)`,
        lowSodium: 'Bajo en sodio',
        goodProtein: (amount: number) => `Buena fuente de proteína(${amount}g)`,
        highFiber: (amount: number) => `Alto en fibra(${amount}g)`,
        standardProduct: 'Producto procesado estándar',
        moderateConsumption: 'Consumir con moderación',
        scoreDescription: (score: number, issue: string) =>
            `Este producto tiene una puntuación nutricional de ${score}/100. ${issue ? 'Considera ' + issue.toLowerCase() + '.' : 'Es una opción aceptable.'}`
    },
    EN: {
        containsAllergens: 'Contains allergens',
        notRecommendedAllergies: 'Not recommended due to your allergies',
        allergenWarning: (allergens: string) => `This product contains ${allergens}, which is on your allergy list. It is not safe for you to consume.`,
        highSugar: (amount: number) => `High sugar content (${amount}g)`,
        lowSugar: 'Low in sugar',
        highSodium: (amount: number) => `High sodium content (${amount}mg)`,
        lowSodium: 'Low in sodium',
        goodProtein: (amount: number) => `Good source of protein (${amount}g)`,
        highFiber: (amount: number) => `High in fiber (${amount}g)`,
        standardProduct: 'Standard processed product',
        moderateConsumption: 'Consume in moderation',
        scoreDescription: (score: number, issue: string) =>
            `This product has a nutrition score of ${score}/100. ${issue ? 'Consider ' + issue.toLowerCase() + '.' : 'It is an acceptable option.'}`
    }
};

/**
 * Fallback analysis when AI is not available
 */
function getFallbackAnalysis(product: any, userProfile: UserProfile, language: Language = 'ES'): AIAnalysisResult {
    const msg = FALLBACK_MESSAGES[language];

    // Safe access to nutrition
    const nutrition = product.nutrition || {
        servingSize: 'N/A',
        calories: 0,
        protein: 0,
        carbs: 0,
        sugar: 0,
        fat: 0,
        sodium: 0,
        fiber: 0
    };

    // Check for allergens
    const hasAllergens = product.allergens?.some((allergen: string) =>
        userProfile.allergies.some(userAllergen =>
            allergen.toLowerCase().includes(userAllergen.toLowerCase()) ||
            userAllergen.toLowerCase().includes(allergen.toLowerCase())
        )
    );

    // Translate ingredients and allergens if language is ES
    let translatedIngredients = product.ingredients;
    let translatedAllergens = product.allergens;

    if (language === 'ES') {
        translatedIngredients = product.ingredients?.map((ing: string) => INGREDIENT_TRANSLATIONS[ing] || ing);
        translatedAllergens = product.allergens?.map((all: string) => INGREDIENT_TRANSLATIONS[all] || all);
    }

    if (hasAllergens) {
        return {
            status: 'not-recommended',
            nutritionScore: 10, // Extremely low score for allergens
            benefits: [],
            issues: [
                `${msg.containsAllergens}: ${translatedAllergens?.join(', ')}`,
                msg.notRecommendedAllergies
            ],
            aiDescription: msg.allergenWarning(translatedAllergens?.join(', ')),
            ingredients: translatedIngredients,
            allergens: translatedAllergens
        };
    }

    // Simple scoring based on nutrition
    let score = 50;
    const issues: string[] = [];
    const benefits: string[] = [];

    // Check sugar
    if (nutrition.sugar > 15) {
        score -= 20;
        issues.push(msg.highSugar(nutrition.sugar));
    } else if (nutrition.sugar < 5) {
        score += 10;
        benefits.push(msg.lowSugar);
    }

    // Check sodium
    if (nutrition.sodium > 500) {
        score -= 15;
        issues.push(msg.highSodium(nutrition.sodium));
    } else if (nutrition.sodium < 200) {
        score += 10;
        benefits.push(msg.lowSodium);
    }

    // Check protein
    if (nutrition.protein > 10) {
        score += 15;
        benefits.push(msg.goodProtein(nutrition.protein));
    }

    // Check fiber
    if (nutrition.fiber > 5) {
        score += 10;
        benefits.push(msg.highFiber(nutrition.fiber));
    }

    // Determine status
    let status: 'suitable' | 'questionable' | 'not-recommended';
    if (score >= 70) {
        status = 'suitable';
    } else if (score >= 40) {
        status = 'questionable';
    } else {
        status = 'not-recommended';
    }

    return {
        status,
        nutritionScore: Math.max(0, Math.min(100, score)),
        benefits: benefits.length > 0 ? benefits : [msg.standardProduct],
        issues: issues.length > 0 ? issues : [msg.moderateConsumption],
        aiDescription: msg.scoreDescription(score, issues[0] || ''),
        ingredients: translatedIngredients,
        allergens: translatedAllergens
    };
}

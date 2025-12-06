/**
 * INGREDIENTS DATABASE - Static & Verified
 * 
 * ⚠️ REGLAS DE FORMATO:
 * 1. Todas las keys de búsqueda son LOWERCASE
 * 2. `id` es lowercase-kebab-case: "hyaluronic-acid"
 * 3. `name` es display: "Hyaluronic Acid"
 * 4. `aliases` pueden tener cualquier casing
 * 
 * CRITERIOS DE PUNTUACIÓN:
 * 100-90: Agua, nutrientes esenciales, muy seguros
 * 89-70:  Activos seguros, conservantes suaves
 * 69-40:  Irritantes potenciales, aditivos
 * 39-10:  Problemáticos, comedogénicos altos
 * 9-0:    Prohibidos/Restringidos
 * null:   Sin datos suficientes
 */

import { IngredientDetail } from '../lib/types';

const INGREDIENTS: IngredientDetail[] = [
    // ==========================================
    // UNIVERSALES (FOOD & COSMETIC)
    // ==========================================
    {
        id: 'water',
        name: 'Water',
        aliases: ['Aqua', 'Agua', 'Eau', 'H2O'],
        context: 'BOTH',
        description: {
            es: 'Solvente universal y base de la mayoría de formulaciones. Esencial para la vida.',
            en: 'Universal solvent and base of most formulations. Essential for life.'
        },
        functionCategories: ['Solvente', 'Base'],
        origin: 'mineral',
        safetyScore: 100,
        regulations: [
            { region: 'EU', info: { status: 'permitted' } },
            { region: 'USA', info: { status: 'permitted' } },
            { region: 'LATAM', info: { status: 'permitted' } },
        ],
        sourceReference: 'Universal - Sin restricciones',
        lastVerified: '2024-01'
    },

    // ==========================================
    // COSMÉTICOS - ACTIVOS BENEFICIOSOS
    // ==========================================
    {
        id: 'hyaluronic-acid',
        name: 'Hyaluronic Acid',
        aliases: ['Ácido Hialurónico', 'Sodium Hyaluronate', 'HA'],
        context: 'COSMETIC',
        description: {
            es: 'Molécula que retiene hasta 1000 veces su peso en agua. Hidratación profunda.',
            en: 'Molecule that holds up to 1000 times its weight in water. Deep hydration.'
        },
        functionCategories: ['Humectante', 'Antienvejecimiento'],
        origin: 'synthetic',
        safetyScore: 95,
        regulations: [
            { region: 'EU', info: { status: 'permitted' } },
            { region: 'USA', info: { status: 'permitted' } },
            { region: 'LATAM', info: { status: 'permitted' } },
        ],
        comedogenicRating: 0,
        irritationPotential: 'none',
        sourceReference: 'CosIng Database - EU',
        lastVerified: '2024-01'
    },

    {
        id: 'niacinamide',
        name: 'Niacinamide',
        aliases: ['Nicotinamide', 'Vitamin B3', 'Vitamina B3'],
        context: 'COSMETIC',
        description: {
            es: 'Vitamina B3 que regula el sebo, reduce poros y mejora la barrera cutánea.',
            en: 'Vitamin B3 that regulates sebum, reduces pores and improves skin barrier.'
        },
        functionCategories: ['Regulador de Sebo', 'Iluminador', 'Barrera Cutánea'],
        origin: 'synthetic',
        safetyScore: 92,
        regulations: [
            { region: 'EU', info: { status: 'permitted' } },
            { region: 'USA', info: { status: 'permitted' } },
            { region: 'LATAM', info: { status: 'permitted' } },
        ],
        comedogenicRating: 0,
        irritationPotential: 'none',
        sourceReference: 'CosIng Database - EU',
        lastVerified: '2024-01'
    },

    {
        id: 'glycerin',
        name: 'Glycerin',
        aliases: ['Glicerina', 'Glycerol', 'Glycerine'],
        context: 'BOTH',
        description: {
            es: 'Humectante que atrae agua a la piel. Muy seguro y ampliamente utilizado.',
            en: 'Humectant that attracts water to the skin. Very safe and widely used.'
        },
        functionCategories: ['Humectante', 'Emoliente'],
        origin: 'natural',
        safetyScore: 95,
        regulations: [
            { region: 'EU', info: { status: 'permitted' } },
            { region: 'USA', info: { status: 'permitted' } },
            { region: 'LATAM', info: { status: 'permitted' } },
        ],
        comedogenicRating: 0,
        irritationPotential: 'none',
        sourceReference: 'CosIng Database - EU, FDA GRAS',
        lastVerified: '2024-01'
    },

    {
        id: 'retinol',
        name: 'Retinol',
        aliases: ['Vitamina A', 'Vitamin A', 'Retinoid'],
        context: 'COSMETIC',
        description: {
            es: 'Derivado de vitamina A. Gold standard en antienvejecimiento. Puede irritar.',
            en: 'Vitamin A derivative. Gold standard in anti-aging. May cause irritation.'
        },
        functionCategories: ['Antienvejecimiento', 'Renovación Celular'],
        origin: 'synthetic',
        safetyScore: 75,
        regulations: [
            { region: 'EU', info: { status: 'restricted', maxConcentration: '0.3%', notes: 'Máximo 0.3% en productos faciales sin enjuague' } },
            { region: 'USA', info: { status: 'permitted' } },
            { region: 'LATAM', info: { status: 'permitted' } },
        ],
        comedogenicRating: 0,
        irritationPotential: 'moderate',
        sourceReference: 'SCCS Opinion 2016, CosIng',
        lastVerified: '2024-01'
    },

    // ==========================================
    // COSMÉTICOS - POTENCIALMENTE PROBLEMÁTICOS
    // ==========================================
    {
        id: 'fragrance',
        name: 'Fragrance',
        aliases: ['Parfum', 'Perfume', 'Aroma', 'Fragancia'],
        context: 'COSMETIC',
        description: {
            es: 'Mezcla de compuestos aromáticos. Principal causa de dermatitis de contacto.',
            en: 'Mix of aromatic compounds. Leading cause of contact dermatitis.'
        },
        functionCategories: ['Fragancia'],
        origin: 'mixed',
        safetyScore: 35,
        regulations: [
            { region: 'EU', info: { status: 'restricted', notes: '26 alérgenos deben declararse' } },
            { region: 'USA', info: { status: 'permitted' } },
            { region: 'LATAM', info: { status: 'permitted' } },
        ],
        comedogenicRating: 0,
        irritationPotential: 'high',
        sourceReference: 'SCCS Opinion on Fragrance Allergens',
        lastVerified: '2024-01'
    },

    {
        id: 'parabens',
        name: 'Parabens',
        aliases: ['Methylparaben', 'Propylparaben', 'Butylparaben', 'Parabenos'],
        context: 'COSMETIC',
        description: {
            es: 'Conservantes antimicrobianos. Controversia por posible actividad estrogénica débil.',
            en: 'Antimicrobial preservatives. Controversy over possible weak estrogenic activity.'
        },
        functionCategories: ['Conservante'],
        origin: 'synthetic',
        safetyScore: 45,
        regulations: [
            { region: 'EU', info: { status: 'restricted', maxConcentration: '0.4%', notes: 'Prohibido en productos para zona del pañal <3 años' } },
            { region: 'USA', info: { status: 'permitted' } },
            { region: 'LATAM', info: { status: 'permitted' } },
        ],
        comedogenicRating: 0,
        irritationPotential: 'low',
        sourceReference: 'SCCS Opinion on Parabens 2013',
        lastVerified: '2024-01'
    },

    {
        id: 'alcohol-denat',
        name: 'Alcohol Denat',
        aliases: ['Denatured Alcohol', 'Alcohol Desnaturalizado', 'SD Alcohol'],
        context: 'COSMETIC',
        description: {
            es: 'Alcohol etílico desnaturalizado. Seca la piel y puede dañar la barrera cutánea.',
            en: 'Denatured ethyl alcohol. Dries skin and may damage skin barrier.'
        },
        functionCategories: ['Solvente', 'Antimicrobiano'],
        origin: 'natural',
        safetyScore: 30,
        regulations: [
            { region: 'EU', info: { status: 'permitted' } },
            { region: 'USA', info: { status: 'permitted' } },
            { region: 'LATAM', info: { status: 'permitted' } },
        ],
        comedogenicRating: 0,
        irritationPotential: 'high',
        sourceReference: 'CosIng Database - EU',
        lastVerified: '2024-01'
    },

    // ==========================================
    // ALIMENTOS - INGREDIENTES COMUNES
    // ==========================================
    {
        id: 'sugar',
        name: 'Sugar',
        aliases: ['Azúcar', 'Sucrose', 'Sacarosa', 'Azúcar de caña'],
        context: 'FOOD',
        description: {
            es: 'Carbohidrato simple de alta energía. Consumo excesivo asociado a obesidad y diabetes.',
            en: 'Simple high-energy carbohydrate. Excess linked to obesity and diabetes.'
        },
        functionCategories: ['Edulcorante', 'Conservante'],
        origin: 'natural',
        safetyScore: 40,
        regulations: [
            { region: 'EU', info: { status: 'permitted' } },
            { region: 'USA', info: { status: 'permitted' } },
            { region: 'LATAM', info: { status: 'permitted' } },
        ],
        isCommonAllergen: false,
        sourceReference: 'FDA GRAS',
        lastVerified: '2024-01'
    },

    {
        id: 'salt',
        name: 'Salt',
        aliases: ['Sal', 'Sodium Chloride', 'Cloruro de Sodio', 'Sea Salt', 'Sal Marina'],
        context: 'FOOD',
        description: {
            es: 'Mineral esencial en pequeñas cantidades. Exceso asociado a hipertensión.',
            en: 'Essential mineral in small amounts. Excess linked to hypertension.'
        },
        functionCategories: ['Saborizante', 'Conservante'],
        origin: 'mineral',
        safetyScore: 60,
        regulations: [
            { region: 'EU', info: { status: 'permitted' } },
            { region: 'USA', info: { status: 'permitted' } },
            { region: 'LATAM', info: { status: 'permitted' } },
        ],
        isCommonAllergen: false,
        sourceReference: 'FDA GRAS',
        lastVerified: '2024-01'
    },

    {
        id: 'peanuts',
        name: 'Peanuts',
        aliases: ['Maní', 'Cacahuetes', 'Cacahuate'],
        context: 'FOOD',
        description: {
            es: 'Legumbre rica en proteínas. ALÉRGENO MAYOR: puede causar anafilaxia severa.',
            en: 'Protein-rich legume. MAJOR ALLERGEN: can cause severe anaphylaxis.'
        },
        functionCategories: ['Proteína', 'Grasa Saludable'],
        origin: 'natural',
        safetyScore: 80,
        regulations: [
            { region: 'EU', info: { status: 'permitted', notes: 'ALÉRGENO - Declaración obligatoria' } },
            { region: 'USA', info: { status: 'permitted', notes: 'Top 8 Allergen' } },
            { region: 'LATAM', info: { status: 'permitted' } },
        ],
        isCommonAllergen: true,
        allergenType: 'Peanuts',
        sourceReference: 'FDA Allergen List, EU Reg 1169/2011',
        lastVerified: '2024-01'
    },

    {
        id: 'milk',
        name: 'Milk',
        aliases: ['Leche', 'Dairy', 'Lactose', 'Lactosa'],
        context: 'FOOD',
        description: {
            es: 'Fuente de calcio y proteínas. ALÉRGENO: contiene lactosa y caseína.',
            en: 'Source of calcium and protein. ALLERGEN: contains lactose and casein.'
        },
        functionCategories: ['Proteína', 'Calcio'],
        origin: 'animal',
        safetyScore: 75,
        regulations: [
            { region: 'EU', info: { status: 'permitted', notes: 'ALÉRGENO - Declaración obligatoria' } },
            { region: 'USA', info: { status: 'permitted', notes: 'Top 8 Allergen' } },
            { region: 'LATAM', info: { status: 'permitted' } },
        ],
        isCommonAllergen: true,
        allergenType: 'Milk',
        sourceReference: 'FDA Allergen List, EU Reg 1169/2011',
        lastVerified: '2024-01'
    },

    {
        id: 'msg',
        name: 'MSG',
        aliases: ['Monosodium Glutamate', 'Glutamato Monosódico', 'E621'],
        context: 'FOOD',
        description: {
            es: 'Potenciador de sabor umami. Seguro según estudios, pero puede causar sensibilidad.',
            en: 'Umami flavor enhancer. Safe per studies, but may cause sensitivity.'
        },
        functionCategories: ['Potenciador de Sabor'],
        origin: 'synthetic',
        safetyScore: 55,
        regulations: [
            { region: 'EU', info: { status: 'permitted', notes: 'Debe declararse' } },
            { region: 'USA', info: { status: 'permitted', notes: 'GRAS' } },
            { region: 'LATAM', info: { status: 'permitted' } },
        ],
        isCommonAllergen: false,
        sourceReference: 'FDA GRAS, EFSA Opinion',
        lastVerified: '2024-01'
    },

    {
        id: 'palm-oil',
        name: 'Palm Oil',
        aliases: ['Aceite de Palma', 'Palmitate', 'Sodium Palmitate'],
        context: 'FOOD',
        description: {
            es: 'Aceite vegetal saturado. Controversia ambiental por deforestación.',
            en: 'Saturated vegetable oil. Environmental controversy due to deforestation.'
        },
        functionCategories: ['Grasa', 'Texturizante'],
        origin: 'natural',
        safetyScore: 35,
        regulations: [
            { region: 'EU', info: { status: 'permitted', notes: 'Debe declararse específicamente' } },
            { region: 'USA', info: { status: 'permitted' } },
            { region: 'LATAM', info: { status: 'permitted' } },
        ],
        isCommonAllergen: false,
        sourceReference: 'FDA, EFSA',
        lastVerified: '2024-01'
    },

    // ==========================================
    // ALIMENTOS - INGREDIENTES ADICIONALES
    // ==========================================
    {
        id: 'organic-almonds',
        name: 'Organic Almonds',
        aliases: ['Almendras Orgánicas', 'Almonds', 'Almendras'],
        context: 'FOOD',
        description: {
            es: 'Fruto seco rico en vitamina E y grasas saludables. ALÉRGENO: frutos secos.',
            en: 'Nut rich in vitamin E and healthy fats. ALLERGEN: tree nuts.'
        },
        functionCategories: ['Proteína', 'Grasa Saludable', 'Fibra'],
        origin: 'natural',
        safetyScore: 85,
        regulations: [
            { region: 'EU', info: { status: 'permitted', notes: 'ALÉRGENO - Declaración obligatoria' } },
            { region: 'USA', info: { status: 'permitted', notes: 'Top 8 Allergen' } },
            { region: 'LATAM', info: { status: 'permitted' } },
        ],
        isCommonAllergen: true,
        allergenType: 'Tree Nuts',
        sourceReference: 'FDA Allergen List, EU Reg 1169/2011',
        lastVerified: '2024-01'
    },

    {
        id: 'sunflower-lecithin',
        name: 'Sunflower Lecithin',
        aliases: ['Lecitina de Girasol', 'Lecithin'],
        context: 'FOOD',
        description: {
            es: 'Emulsionante natural derivado de girasol. Alternativa libre de soja.',
            en: 'Natural emulsifier derived from sunflower. Soy-free alternative.'
        },
        functionCategories: ['Emulsionante', 'Estabilizante'],
        origin: 'natural',
        safetyScore: 90,
        regulations: [
            { region: 'EU', info: { status: 'permitted' } },
            { region: 'USA', info: { status: 'permitted', notes: 'GRAS' } },
            { region: 'LATAM', info: { status: 'permitted' } },
        ],
        isCommonAllergen: false,
        sourceReference: 'FDA GRAS',
        lastVerified: '2024-01'
    },

    {
        id: 'whey-protein',
        name: 'Whey Protein',
        aliases: ['Proteína de Suero', 'Whey', 'Suero de Leche'],
        context: 'FOOD',
        description: {
            es: 'Proteína derivada de la leche. Alta calidad biológica. ALÉRGENO: lácteos.',
            en: 'Protein derived from milk. High biological value. ALLERGEN: dairy.'
        },
        functionCategories: ['Proteína', 'Suplemento'],
        origin: 'animal',
        safetyScore: 80,
        regulations: [
            { region: 'EU', info: { status: 'permitted', notes: 'ALÉRGENO - Declaración obligatoria' } },
            { region: 'USA', info: { status: 'permitted', notes: 'Top 8 Allergen' } },
            { region: 'LATAM', info: { status: 'permitted' } },
        ],
        isCommonAllergen: true,
        allergenType: 'Milk',
        sourceReference: 'FDA Allergen List',
        lastVerified: '2024-01'
    },

    {
        id: 'soy-lecithin',
        name: 'Soy Lecithin',
        aliases: ['Lecitina de Soja', 'Lecitina de Soya'],
        context: 'FOOD',
        description: {
            es: 'Emulsionante derivado de soja. ALÉRGENO: soja.',
            en: 'Emulsifier derived from soy. ALLERGEN: soy.'
        },
        functionCategories: ['Emulsionante', 'Estabilizante'],
        origin: 'natural',
        safetyScore: 75,
        regulations: [
            { region: 'EU', info: { status: 'permitted', notes: 'ALÉRGENO - Declaración obligatoria' } },
            { region: 'USA', info: { status: 'permitted', notes: 'Top 8 Allergen' } },
            { region: 'LATAM', info: { status: 'permitted' } },
        ],
        isCommonAllergen: true,
        allergenType: 'Soy',
        sourceReference: 'FDA Allergen List',
        lastVerified: '2024-01'
    },

    {
        id: 'wheat-flour',
        name: 'Wheat Flour',
        aliases: ['Harina de Trigo', 'Flour', 'Harina'],
        context: 'FOOD',
        description: {
            es: 'Base de panadería y pastas. ALÉRGENO: contiene gluten.',
            en: 'Base for baking and pasta. ALLERGEN: contains gluten.'
        },
        functionCategories: ['Carbohidrato', 'Texturizante'],
        origin: 'natural',
        safetyScore: 70,
        regulations: [
            { region: 'EU', info: { status: 'permitted', notes: 'ALÉRGENO - Declaración obligatoria (Gluten)' } },
            { region: 'USA', info: { status: 'permitted', notes: 'Top 8 Allergen' } },
            { region: 'LATAM', info: { status: 'permitted' } },
        ],
        isCommonAllergen: true,
        allergenType: 'Gluten',
        sourceReference: 'FDA Allergen List',
        lastVerified: '2024-01'
    },

    {
        id: 'artificial-flavors',
        name: 'Artificial Flavors',
        aliases: ['Sabores Artificiales', 'Artificial Flavoring', 'Saborizantes Artificiales'],
        context: 'FOOD',
        description: {
            es: 'Compuestos sintéticos que imitan sabores naturales. Sin valor nutricional.',
            en: 'Synthetic compounds that mimic natural flavors. No nutritional value.'
        },
        functionCategories: ['Saborizante'],
        origin: 'synthetic',
        safetyScore: 45,
        regulations: [
            { region: 'EU', info: { status: 'permitted', notes: 'Debe declararse' } },
            { region: 'USA', info: { status: 'permitted', notes: 'GRAS' } },
            { region: 'LATAM', info: { status: 'permitted' } },
        ],
        isCommonAllergen: false,
        sourceReference: 'FDA GRAS',
        lastVerified: '2024-01'
    },

    {
        id: 'live-active-cultures',
        name: 'Live Active Cultures',
        aliases: ['Cultivos Activos Vivos', 'Probiotics', 'Probióticos'],
        context: 'FOOD',
        description: {
            es: 'Bacterias beneficiosas para la salud digestiva. Presentes en yogur y fermentados.',
            en: 'Beneficial bacteria for digestive health. Found in yogurt and fermented foods.'
        },
        functionCategories: ['Probiótico', 'Fermentación'],
        origin: 'natural',
        safetyScore: 95,
        regulations: [
            { region: 'EU', info: { status: 'permitted' } },
            { region: 'USA', info: { status: 'permitted' } },
            { region: 'LATAM', info: { status: 'permitted' } },
        ],
        isCommonAllergen: false,
        sourceReference: 'FDA, EFSA',
        lastVerified: '2024-01'
    },

    {
        id: 'potatoes',
        name: 'Potatoes',
        aliases: ['Papas', 'Patatas', 'Potato'],
        context: 'FOOD',
        description: {
            es: 'Tubérculo rico en almidón. Fuente de carbohidratos y potasio.',
            en: 'Starchy tuber. Source of carbohydrates and potassium.'
        },
        functionCategories: ['Carbohidrato', 'Almidón'],
        origin: 'natural',
        safetyScore: 85,
        regulations: [
            { region: 'EU', info: { status: 'permitted' } },
            { region: 'USA', info: { status: 'permitted' } },
            { region: 'LATAM', info: { status: 'permitted' } },
        ],
        isCommonAllergen: false,
        sourceReference: 'FDA',
        lastVerified: '2024-01'
    },

    {
        id: 'vegetable-oil',
        name: 'Vegetable Oil',
        aliases: ['Aceite Vegetal', 'Aceites Vegetales'],
        context: 'FOOD',
        description: {
            es: 'Mezcla de aceites vegetales. Composición varía según fabricante.',
            en: 'Blend of vegetable oils. Composition varies by manufacturer.'
        },
        functionCategories: ['Grasa', 'Fritura'],
        origin: 'natural',
        safetyScore: 55,
        regulations: [
            { region: 'EU', info: { status: 'permitted' } },
            { region: 'USA', info: { status: 'permitted' } },
            { region: 'LATAM', info: { status: 'permitted' } },
        ],
        isCommonAllergen: false,
        sourceReference: 'FDA',
        lastVerified: '2024-01'
    },

    {
        id: 'artificial-colors',
        name: 'Artificial Colors',
        aliases: ['Colorantes Artificiales', 'Food Dyes', 'Colorantes'],
        context: 'FOOD',
        description: {
            es: 'Colorantes sintéticos. Algunos estudios sugieren efectos en comportamiento infantil.',
            en: 'Synthetic colorants. Some studies suggest effects on child behavior.'
        },
        functionCategories: ['Colorante'],
        origin: 'synthetic',
        safetyScore: 35,
        regulations: [
            { region: 'EU', info: { status: 'restricted', notes: 'Requiere advertencia en etiqueta' } },
            { region: 'USA', info: { status: 'permitted' } },
            { region: 'LATAM', info: { status: 'permitted' } },
        ],
        isCommonAllergen: false,
        sourceReference: 'FDA, EFSA',
        lastVerified: '2024-01'
    },

    {
        id: 'quinoa',
        name: 'Quinoa',
        aliases: ['Quinua', 'Quínoa'],
        context: 'FOOD',
        description: {
            es: 'Pseudocereal andino. Proteína completa con todos los aminoácidos esenciales.',
            en: 'Andean pseudocereal. Complete protein with all essential amino acids.'
        },
        functionCategories: ['Proteína', 'Carbohidrato', 'Fibra'],
        origin: 'natural',
        safetyScore: 95,
        regulations: [
            { region: 'EU', info: { status: 'permitted' } },
            { region: 'USA', info: { status: 'permitted' } },
            { region: 'LATAM', info: { status: 'permitted' } },
        ],
        isCommonAllergen: false,
        sourceReference: 'FDA, FAO',
        lastVerified: '2024-01'
    },

    {
        id: 'black-beans',
        name: 'Black Beans',
        aliases: ['Frijoles Negros', 'Porotos Negros', 'Caraotas'],
        context: 'FOOD',
        description: {
            es: 'Legumbre rica en proteína vegetal, fibra y antioxidantes.',
            en: 'Legume rich in plant protein, fiber and antioxidants.'
        },
        functionCategories: ['Proteína', 'Fibra'],
        origin: 'natural',
        safetyScore: 92,
        regulations: [
            { region: 'EU', info: { status: 'permitted' } },
            { region: 'USA', info: { status: 'permitted' } },
            { region: 'LATAM', info: { status: 'permitted' } },
        ],
        isCommonAllergen: false,
        sourceReference: 'FDA',
        lastVerified: '2024-01'
    },

    {
        id: 'corn',
        name: 'Corn',
        aliases: ['Maíz', 'Maize', 'Elote', 'Choclo'],
        context: 'FOOD',
        description: {
            es: 'Cereal versátil. Alto en carbohidratos. Puede ser transgénico.',
            en: 'Versatile cereal. High in carbohydrates. May be GMO.'
        },
        functionCategories: ['Carbohidrato', 'Almidón'],
        origin: 'natural',
        safetyScore: 75,
        regulations: [
            { region: 'EU', info: { status: 'permitted', notes: 'GMO requiere etiquetado' } },
            { region: 'USA', info: { status: 'permitted' } },
            { region: 'LATAM', info: { status: 'permitted' } },
        ],
        isCommonAllergen: false,
        sourceReference: 'FDA',
        lastVerified: '2024-01'
    },

    {
        id: 'peppers',
        name: 'Peppers',
        aliases: ['Pimientos', 'Bell Peppers', 'Ajíes', 'Morrones'],
        context: 'FOOD',
        description: {
            es: 'Vegetales ricos en vitamina C y antioxidantes. Bajo en calorías.',
            en: 'Vegetables rich in vitamin C and antioxidants. Low calorie.'
        },
        functionCategories: ['Vitaminas', 'Antioxidante'],
        origin: 'natural',
        safetyScore: 95,
        regulations: [
            { region: 'EU', info: { status: 'permitted' } },
            { region: 'USA', info: { status: 'permitted' } },
            { region: 'LATAM', info: { status: 'permitted' } },
        ],
        isCommonAllergen: false,
        sourceReference: 'FDA',
        lastVerified: '2024-01'
    },

    {
        id: 'olive-oil',
        name: 'Olive Oil',
        aliases: ['Aceite de Oliva', 'EVOO', 'Extra Virgin Olive Oil'],
        context: 'FOOD',
        description: {
            es: 'Grasa monoinsaturada saludable. Base de la dieta mediterránea.',
            en: 'Healthy monounsaturated fat. Base of Mediterranean diet.'
        },
        functionCategories: ['Grasa Saludable', 'Antioxidante'],
        origin: 'natural',
        safetyScore: 95,
        regulations: [
            { region: 'EU', info: { status: 'permitted' } },
            { region: 'USA', info: { status: 'permitted' } },
            { region: 'LATAM', info: { status: 'permitted' } },
        ],
        isCommonAllergen: false,
        sourceReference: 'FDA, EFSA',
        lastVerified: '2024-01'
    },

    {
        id: 'spices',
        name: 'Spices',
        aliases: ['Especias', 'Condimentos', 'Seasonings'],
        context: 'FOOD',
        description: {
            es: 'Mezcla de especias para sazonar. Composición varía según producto.',
            en: 'Spice blend for seasoning. Composition varies by product.'
        },
        functionCategories: ['Saborizante', 'Aromático'],
        origin: 'natural',
        safetyScore: 85,
        regulations: [
            { region: 'EU', info: { status: 'permitted' } },
            { region: 'USA', info: { status: 'permitted' } },
            { region: 'LATAM', info: { status: 'permitted' } },
        ],
        isCommonAllergen: false,
        sourceReference: 'FDA',
        lastVerified: '2024-01'
    },

    // ==========================================
    // COSMÉTICOS - INGREDIENTES ADICIONALES
    // ==========================================
    {
        id: 'ceramides',
        name: 'Ceramides',
        aliases: ['Ceramidas', 'Ceramide NP', 'Ceramide AP', 'Ceramide EOP'],
        context: 'COSMETIC',
        description: {
            es: 'Lípidos esenciales de la barrera cutánea. Restauran y protegen la piel.',
            en: 'Essential lipids of skin barrier. Restore and protect skin.'
        },
        functionCategories: ['Barrera Cutánea', 'Hidratante'],
        origin: 'synthetic',
        safetyScore: 95,
        regulations: [
            { region: 'EU', info: { status: 'permitted' } },
            { region: 'USA', info: { status: 'permitted' } },
            { region: 'LATAM', info: { status: 'permitted' } },
        ],
        comedogenicRating: 0,
        irritationPotential: 'none',
        sourceReference: 'CosIng Database - EU',
        lastVerified: '2024-01'
    },

    {
        id: 'cholesterol',
        name: 'Cholesterol',
        aliases: ['Colesterol'],
        context: 'COSMETIC',
        description: {
            es: 'Lípido que fortalece la barrera cutánea. Componente natural de la piel.',
            en: 'Lipid that strengthens skin barrier. Natural skin component.'
        },
        functionCategories: ['Emoliente', 'Barrera Cutánea'],
        origin: 'animal',
        safetyScore: 90,
        regulations: [
            { region: 'EU', info: { status: 'permitted' } },
            { region: 'USA', info: { status: 'permitted' } },
            { region: 'LATAM', info: { status: 'permitted' } },
        ],
        comedogenicRating: 0,
        irritationPotential: 'none',
        sourceReference: 'CosIng Database - EU',
        lastVerified: '2024-01'
    },

    {
        id: 'phytosphingosine',
        name: 'Phytosphingosine',
        aliases: ['Fitoesfingosina'],
        context: 'COSMETIC',
        description: {
            es: 'Lípido con propiedades antimicrobianas. Calma irritaciones.',
            en: 'Lipid with antimicrobial properties. Soothes irritation.'
        },
        functionCategories: ['Antimicrobiano', 'Calmante'],
        origin: 'synthetic',
        safetyScore: 90,
        regulations: [
            { region: 'EU', info: { status: 'permitted' } },
            { region: 'USA', info: { status: 'permitted' } },
            { region: 'LATAM', info: { status: 'permitted' } },
        ],
        comedogenicRating: 0,
        irritationPotential: 'none',
        sourceReference: 'CosIng Database - EU',
        lastVerified: '2024-01'
    },

    {
        id: 'ascorbic-acid',
        name: 'Ascorbic Acid',
        aliases: ['Ácido Ascórbico', 'Vitamin C', 'Vitamina C', 'L-Ascorbic Acid'],
        context: 'COSMETIC',
        description: {
            es: 'Vitamina C pura. Potente antioxidante e iluminador. Inestable.',
            en: 'Pure Vitamin C. Potent antioxidant and brightener. Unstable.'
        },
        functionCategories: ['Antioxidante', 'Iluminador', 'Antienvejecimiento'],
        origin: 'synthetic',
        safetyScore: 88,
        regulations: [
            { region: 'EU', info: { status: 'permitted' } },
            { region: 'USA', info: { status: 'permitted' } },
            { region: 'LATAM', info: { status: 'permitted' } },
        ],
        comedogenicRating: 0,
        irritationPotential: 'low',
        sourceReference: 'CosIng Database - EU',
        lastVerified: '2024-01'
    },

    {
        id: 'propanediol',
        name: 'Propanediol',
        aliases: ['1,3-Propanediol', 'Propylene Glycol Alternative'],
        context: 'COSMETIC',
        description: {
            es: 'Humectante y solvente suave. Alternativa natural al propilenglicol.',
            en: 'Mild humectant and solvent. Natural alternative to propylene glycol.'
        },
        functionCategories: ['Humectante', 'Solvente'],
        origin: 'natural',
        safetyScore: 90,
        regulations: [
            { region: 'EU', info: { status: 'permitted' } },
            { region: 'USA', info: { status: 'permitted' } },
            { region: 'LATAM', info: { status: 'permitted' } },
        ],
        comedogenicRating: 0,
        irritationPotential: 'none',
        sourceReference: 'CosIng Database - EU',
        lastVerified: '2024-01'
    },

    {
        id: 'ascorbyl-glucoside',
        name: 'Ascorbyl Glucoside',
        aliases: ['AA2G', 'Glucósido de Ascorbilo'],
        context: 'COSMETIC',
        description: {
            es: 'Derivado estable de vitamina C. Más suave que el ácido ascórbico.',
            en: 'Stable vitamin C derivative. Gentler than ascorbic acid.'
        },
        functionCategories: ['Antioxidante', 'Iluminador'],
        origin: 'synthetic',
        safetyScore: 90,
        regulations: [
            { region: 'EU', info: { status: 'permitted' } },
            { region: 'USA', info: { status: 'permitted' } },
            { region: 'LATAM', info: { status: 'permitted' } },
        ],
        comedogenicRating: 0,
        irritationPotential: 'none',
        sourceReference: 'CosIng Database - EU',
        lastVerified: '2024-01'
    },

    {
        id: 'vitamin-e',
        name: 'Vitamin E',
        aliases: ['Vitamina E', 'Tocopherol', 'Tocoferol', 'Alpha-Tocopherol'],
        context: 'COSMETIC',
        description: {
            es: 'Antioxidante liposoluble. Protege la piel del daño oxidativo.',
            en: 'Fat-soluble antioxidant. Protects skin from oxidative damage.'
        },
        functionCategories: ['Antioxidante', 'Emoliente'],
        origin: 'natural',
        safetyScore: 92,
        regulations: [
            { region: 'EU', info: { status: 'permitted' } },
            { region: 'USA', info: { status: 'permitted' } },
            { region: 'LATAM', info: { status: 'permitted' } },
        ],
        comedogenicRating: 2,
        irritationPotential: 'none',
        sourceReference: 'CosIng Database - EU',
        lastVerified: '2024-01'
    },

    {
        id: 'ferulic-acid',
        name: 'Ferulic Acid',
        aliases: ['Ácido Ferúlico'],
        context: 'COSMETIC',
        description: {
            es: 'Antioxidante que potencia vitaminas C y E. Protege del fotoenvejecimiento.',
            en: 'Antioxidant that enhances vitamins C and E. Protects from photoaging.'
        },
        functionCategories: ['Antioxidante', 'Estabilizador'],
        origin: 'natural',
        safetyScore: 90,
        regulations: [
            { region: 'EU', info: { status: 'permitted' } },
            { region: 'USA', info: { status: 'permitted' } },
            { region: 'LATAM', info: { status: 'permitted' } },
        ],
        comedogenicRating: 0,
        irritationPotential: 'none',
        sourceReference: 'CosIng Database - EU',
        lastVerified: '2024-01'
    },

    {
        id: 'squalane',
        name: 'Squalane',
        aliases: ['Escualano'],
        context: 'COSMETIC',
        description: {
            es: 'Emoliente ligero que imita el sebo natural. No comedogénico.',
            en: 'Lightweight emollient that mimics natural sebum. Non-comedogenic.'
        },
        functionCategories: ['Emoliente', 'Hidratante'],
        origin: 'natural',
        safetyScore: 95,
        regulations: [
            { region: 'EU', info: { status: 'permitted' } },
            { region: 'USA', info: { status: 'permitted' } },
            { region: 'LATAM', info: { status: 'permitted' } },
        ],
        comedogenicRating: 0,
        irritationPotential: 'none',
        sourceReference: 'CosIng Database - EU',
        lastVerified: '2024-01'
    },

    {
        id: 'adenosine',
        name: 'Adenosine',
        aliases: ['Adenosina'],
        context: 'COSMETIC',
        description: {
            es: 'Ingrediente antiarrugas que relaja los músculos faciales suavemente.',
            en: 'Anti-wrinkle ingredient that gently relaxes facial muscles.'
        },
        functionCategories: ['Antienvejecimiento', 'Reparador'],
        origin: 'synthetic',
        safetyScore: 90,
        regulations: [
            { region: 'EU', info: { status: 'permitted' } },
            { region: 'USA', info: { status: 'permitted' } },
            { region: 'LATAM', info: { status: 'permitted' } },
        ],
        comedogenicRating: 0,
        irritationPotential: 'none',
        sourceReference: 'CosIng Database - EU',
        lastVerified: '2024-01'
    },

    {
        id: 'green-tea-extract',
        name: 'Green Tea Extract',
        aliases: ['Extracto de Té Verde', 'Camellia Sinensis', 'EGCG'],
        context: 'COSMETIC',
        description: {
            es: 'Potente antioxidante con propiedades antiinflamatorias y calmantes.',
            en: 'Potent antioxidant with anti-inflammatory and soothing properties.'
        },
        functionCategories: ['Antioxidante', 'Calmante', 'Antiinflamatorio'],
        origin: 'natural',
        safetyScore: 92,
        regulations: [
            { region: 'EU', info: { status: 'permitted' } },
            { region: 'USA', info: { status: 'permitted' } },
            { region: 'LATAM', info: { status: 'permitted' } },
        ],
        comedogenicRating: 0,
        irritationPotential: 'none',
        sourceReference: 'CosIng Database - EU',
        lastVerified: '2024-01'
    },

    {
        id: 'aloe-vera',
        name: 'Aloe Vera',
        aliases: ['Aloe Barbadensis', 'Sábila', 'Aloe'],
        context: 'BOTH',
        description: {
            es: 'Planta con propiedades hidratantes, calmantes y cicatrizantes.',
            en: 'Plant with moisturizing, soothing and healing properties.'
        },
        functionCategories: ['Calmante', 'Hidratante', 'Cicatrizante'],
        origin: 'natural',
        safetyScore: 95,
        regulations: [
            { region: 'EU', info: { status: 'permitted' } },
            { region: 'USA', info: { status: 'permitted' } },
            { region: 'LATAM', info: { status: 'permitted' } },
        ],
        comedogenicRating: 0,
        irritationPotential: 'none',
        sourceReference: 'CosIng Database - EU, FDA',
        lastVerified: '2024-01'
    },

    {
        id: 'panthenol',
        name: 'Panthenol',
        aliases: ['Pantenol', 'Pro-Vitamin B5', 'Provitamina B5', 'D-Panthenol'],
        context: 'COSMETIC',
        description: {
            es: 'Provitamina B5 que hidrata, calma y ayuda a la regeneración de la piel.',
            en: 'Pro-Vitamin B5 that hydrates, soothes and aids skin regeneration.'
        },
        functionCategories: ['Hidratante', 'Calmante', 'Reparador'],
        origin: 'synthetic',
        safetyScore: 95,
        regulations: [
            { region: 'EU', info: { status: 'permitted' } },
            { region: 'USA', info: { status: 'permitted' } },
            { region: 'LATAM', info: { status: 'permitted' } },
        ],
        comedogenicRating: 0,
        irritationPotential: 'none',
        sourceReference: 'CosIng Database - EU',
        lastVerified: '2024-01'
    },

    {
        id: 'coconut-oil',
        name: 'Coconut Oil',
        aliases: ['Aceite de Coco', 'Cocos Nucifera Oil'],
        context: 'BOTH',
        description: {
            es: 'Aceite nutritivo pero altamente comedogénico. Evitar en piel con acné.',
            en: 'Nourishing oil but highly comedogenic. Avoid on acne-prone skin.'
        },
        functionCategories: ['Emoliente', 'Hidratante'],
        origin: 'natural',
        safetyScore: 70,
        regulations: [
            { region: 'EU', info: { status: 'permitted' } },
            { region: 'USA', info: { status: 'permitted' } },
            { region: 'LATAM', info: { status: 'permitted' } },
        ],
        comedogenicRating: 4,
        irritationPotential: 'none',
        sourceReference: 'CosIng Database - EU',
        lastVerified: '2024-01'
    },

    {
        id: 'shea-butter',
        name: 'Shea Butter',
        aliases: ['Manteca de Karité', 'Butyrospermum Parkii'],
        context: 'COSMETIC',
        description: {
            es: 'Manteca vegetal rica en ácidos grasos. Muy emoliente y nutritiva.',
            en: 'Plant butter rich in fatty acids. Very emollient and nourishing.'
        },
        functionCategories: ['Emoliente', 'Hidratante', 'Nutritivo'],
        origin: 'natural',
        safetyScore: 85,
        regulations: [
            { region: 'EU', info: { status: 'permitted' } },
            { region: 'USA', info: { status: 'permitted' } },
            { region: 'LATAM', info: { status: 'permitted' } },
        ],
        comedogenicRating: 0,
        irritationPotential: 'none',
        sourceReference: 'CosIng Database - EU',
        lastVerified: '2024-01'
    },

    {
        id: 'mineral-oil',
        name: 'Mineral Oil',
        aliases: ['Aceite Mineral', 'Paraffinum Liquidum', 'Petrolatum'],
        context: 'COSMETIC',
        description: {
            es: 'Derivado del petróleo. Oclusivo que puede obstruir poros.',
            en: 'Petroleum derivative. Occlusive that may clog pores.'
        },
        functionCategories: ['Oclusivo', 'Emoliente'],
        origin: 'mineral',
        safetyScore: 40,
        regulations: [
            { region: 'EU', info: { status: 'permitted', notes: 'Solo si cumple pureza' } },
            { region: 'USA', info: { status: 'permitted' } },
            { region: 'LATAM', info: { status: 'permitted' } },
        ],
        comedogenicRating: 2,
        irritationPotential: 'low',
        sourceReference: 'CosIng Database - EU',
        lastVerified: '2024-01'
    },

    {
        id: 'zinc-oxide',
        name: 'Zinc Oxide',
        aliases: ['Óxido de Zinc', 'ZnO'],
        context: 'COSMETIC',
        description: {
            es: 'Filtro solar mineral. Protección UVA/UVB. Seguro y no irritante.',
            en: 'Mineral sunscreen filter. UVA/UVB protection. Safe and non-irritating.'
        },
        functionCategories: ['Filtro Solar', 'Calmante'],
        origin: 'mineral',
        safetyScore: 95,
        regulations: [
            { region: 'EU', info: { status: 'permitted', maxConcentration: '25%' } },
            { region: 'USA', info: { status: 'permitted', notes: 'Category I Sunscreen' } },
            { region: 'LATAM', info: { status: 'permitted' } },
        ],
        comedogenicRating: 0,
        irritationPotential: 'none',
        sourceReference: 'FDA Sunscreen Monograph, CosIng',
        lastVerified: '2024-01'
    },

    {
        id: 'titanium-dioxide',
        name: 'Titanium Dioxide',
        aliases: ['Dióxido de Titanio', 'TiO2', 'CI 77891'],
        context: 'COSMETIC',
        description: {
            es: 'Filtro solar mineral. Refleja rayos UV. Puede dejar cast blanco.',
            en: 'Mineral sunscreen filter. Reflects UV rays. May leave white cast.'
        },
        functionCategories: ['Filtro Solar', 'Colorante'],
        origin: 'mineral',
        safetyScore: 90,
        regulations: [
            { region: 'EU', info: { status: 'permitted', maxConcentration: '25%' } },
            { region: 'USA', info: { status: 'permitted', notes: 'Category I Sunscreen' } },
            { region: 'LATAM', info: { status: 'permitted' } },
        ],
        comedogenicRating: 0,
        irritationPotential: 'none',
        sourceReference: 'FDA Sunscreen Monograph, CosIng',
        lastVerified: '2024-01'
    },

    {
        id: 'salicylic-acid',
        name: 'Salicylic Acid',
        aliases: ['Ácido Salicílico', 'BHA', 'Salicylic Acid 2%'],
        context: 'COSMETIC',
        description: {
            es: 'BHA liposoluble. Exfolia dentro de los poros. Ideal para acné.',
            en: 'Oil-soluble BHA. Exfoliates inside pores. Ideal for acne.'
        },
        functionCategories: ['Exfoliante', 'Antiacné', 'Queratolítico'],
        origin: 'synthetic',
        safetyScore: 80,
        regulations: [
            { region: 'EU', info: { status: 'restricted', maxConcentration: '2%', notes: 'Advertencia obligatoria' } },
            { region: 'USA', info: { status: 'permitted', maxConcentration: '2%' } },
            { region: 'LATAM', info: { status: 'permitted' } },
        ],
        comedogenicRating: 0,
        irritationPotential: 'moderate',
        sourceReference: 'FDA OTC Monograph, CosIng',
        lastVerified: '2024-01'
    },
];

// ============================================
// ÍNDICES DE BÚSQUEDA
// ============================================

export const INGREDIENTS_BY_ID: Record<string, IngredientDetail> = {};
export const INGREDIENTS_BY_ALIAS: Record<string, IngredientDetail> = {};

INGREDIENTS.forEach(ingredient => {
    INGREDIENTS_BY_ID[ingredient.id] = ingredient;
    INGREDIENTS_BY_ALIAS[ingredient.name.toLowerCase()] = ingredient;
    ingredient.aliases.forEach(alias => {
        INGREDIENTS_BY_ALIAS[alias.toLowerCase()] = ingredient;
    });
});

// ============================================
// FUNCIÓN DE BÚSQUEDA PRINCIPAL
// ============================================

export function findIngredient(name: string): IngredientDetail | null {
    const normalized = name.toLowerCase().trim();

    // 1. Match exacto por alias
    if (INGREDIENTS_BY_ALIAS[normalized]) {
        return INGREDIENTS_BY_ALIAS[normalized];
    }

    // 2. Match parcial (para "Salicylic Acid 2%" → "Salicylic Acid")
    for (const [key, value] of Object.entries(INGREDIENTS_BY_ALIAS)) {
        if (normalized.includes(key) || key.includes(normalized)) {
            return value;
        }
    }

    return null;
}

// ============================================
// EXPORTS PARA VALIDACIÓN
// ============================================

export const ALL_INGREDIENTS = INGREDIENTS;
export const TOTAL_INGREDIENTS_COUNT = INGREDIENTS.length;

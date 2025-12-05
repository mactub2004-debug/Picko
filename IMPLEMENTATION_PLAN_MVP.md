# 📋 PLAN DE IMPLEMENTACIÓN: MULTI-VERTICAL MVP (FOOD + DERMO)

**Fecha:** 2024-12-04  
**Status:** 🟡 EN PROGRESO  
**Target:** Demo para Inversores (Sin Backend)

---

## ✅ FASE 1 COMPLETADA (2024-12-04)

### Archivos creados/modificados:
- ✅ `src/lib/types.ts` - Sistema de tipos con Discriminated Unions
- ✅ `src/lib/demo-data.ts` - Productos FOOD + COSMETIC, UserProfile con skinProfile
- ✅ `src/lib/storage.ts` - Migración automática v1→v2, métodos para skinProfile
- ✅ `src/lib/translations.ts` - Traducciones ES/EN para cosmética y perfil de piel

---

Este plan detalla la transformación de **HealthScan** de una app de nutrición a un **Universal Shopping Copilot** que soporta productos alimenticios y cosméticos mediante polimorfismo de tipos.

### 🎯 Objetivos Clave
1. Implementar **Discriminated Unions** para manejo de tipo de producto
2. Expandir perfil de usuario con contexto dermatológico
3. Crear sistema de scoring inteligente por Strategy Pattern
4. Adaptar UI para renderizado polimórfico
5. Actualizar prompts de IA específicos por vertical

---

## 🏗️ FASES DE IMPLEMENTACIÓN

### FASE 1: DATA MODEL REFACTORING (Prioridad: 🔴 CRÍTICA)
**Estimación:** 2-3 horas  
**Riesgo:** Alto (breaking changes en toda la app)

#### 1.1 Crear nuevo sistema de tipos (`src/lib/types.ts`) - NUEVO ARCHIVO

```typescript
// Archivo: src/lib/types.ts

// TIPOS BASE
export type ProductType = 'FOOD' | 'COSMETIC';
export type SuitabilityStatus = 'suitable' | 'questionable' | 'not-recommended';

// ANÁLISIS DE INGREDIENTES
export interface IngredientAnalysis {
  name: string;
  originalName?: string; // Para traducción
  isAllergen?: boolean;
  isIrritant?: boolean;
  isBeneficial?: boolean;
  comedogenicRating?: number; // 0-5 para cosméticos
}

// PRODUCTO BASE (Discriminated Union)
interface BaseProduct {
  id: string;
  name: string;
  brand: string;
  barcode: string;
  image: string;
  type: ProductType; // DISCRIMINADOR
  scannedAt: Date;
  ingredients: string[];
  ingredientsAnalysis?: IngredientAnalysis[];
  score: number; // 0-100 Global
  verdict: SuitabilityStatus;
  aiAnalysis?: {
    summary: string;
    benefits: string[];
    risks: string[];
  };
}

// PRODUCTO ALIMENTICIO
export interface FoodProduct extends BaseProduct {
  type: 'FOOD';
  category: string;
  allergens: string[];
  nutrition: {
    calories: number;
    sugar: number;
    sodium: number;
    protein: number;
    fiber: number;
    fat: number;
    carbs: number;
    servingSize: string;
  };
  tags?: ('vegan' | 'gluten-free' | 'keto' | 'processed' | 'organic')[];
}

// PRODUCTO COSMÉTICO
export interface CosmeticProduct extends BaseProduct {
  type: 'COSMETIC';
  category: 'skincare' | 'haircare' | 'bodycare' | 'makeup';
  attributes: {
    isCrueltyFree?: boolean;
    isVegan?: boolean;
    isNonComedogenic?: boolean;
    hasFragrance: boolean;
    hasAlcohol: boolean;
    hasSPF?: boolean;
  };
  applicationArea: 'face' | 'body' | 'hair' | 'lips' | 'eyes';
  skinTypes?: ('dry' | 'oily' | 'combination' | 'normal' | 'sensitive')[];
}

// UNION TYPE
export type Product = FoodProduct | CosmeticProduct;

// TYPE GUARDS
export function isFoodProduct(product: Product): product is FoodProduct {
  return product.type === 'FOOD';
}

export function isCosmeticProduct(product: Product): product is CosmeticProduct {
  return product.type === 'COSMETIC';
}
```

#### 1.2 Actualizar `demo-data.ts`

**Archivos a modificar:** `src/lib/demo-data.ts`

```
TAREAS:
[ ] Importar nuevos tipos desde types.ts
[ ] Mantener compatibilidad con productos existentes (asignar type: 'FOOD')
[ ] Agregar 3-4 productos demo COSMETIC
[ ] Actualizar UserProfile con contexto skin
[ ] Agregar arrays para preferencias dermatológicas
```

**Productos Demo Cosméticos a agregar:**
```typescript
// Ejemplos de productos cosméticos
{
  id: 'c1',
  name: 'Hydrating Face Serum',
  brand: 'CeraVe',
  type: 'COSMETIC',
  category: 'skincare',
  applicationArea: 'face',
  // ...
}
```

#### 1.3 Actualizar `UserProfile` en `demo-data.ts`

```typescript
export interface UserProfile {
  // CORE INFO (Existente)
  name: string;
  email: string;
  avatar?: string;
  country: string;
  language: 'ES' | 'EN';
  
  // FOOD CONTEXT (Renombrar de existente)
  allergies: string[];
  preferences: string[]; // dietas
  goals: string[];

  // DERMO CONTEXT (NUEVO)
  skin: {
    type: 'Dry' | 'Oily' | 'Combination' | 'Normal' | 'Sensitive' | null;
    concerns: string[]; // ['Acne', 'Rosacea', 'Aging', 'Dermatitis']
    avoid: string[]; // ['Fragrance', 'Parabens', 'Silicones', 'Alcohol']
  };
}
```

---

### FASE 2: STORAGE SERVICE MIGRATION (Prioridad: 🟠 ALTA)
**Estimación:** 1-2 horas

#### 2.1 Modificar `storage.ts`

**Archivo:** `src/lib/storage.ts`

```
TAREAS:
[ ] Agregar versión de schema: STORAGE_VERSION = '2.0'
[ ] Crear función de migración lazy para productos existentes
[ ] Agregar métodos para skinProfile:
    - getSkinProfile()
    - saveSkinProfile(skin)
[ ] Modificar addScanHistoryItem para aceptar Product genérico
[ ] Agregar validación de tipo de producto
```

**Migración Lazy:**
```typescript
const STORAGE_VERSION = '2.0';

function migrateStorageIfNeeded() {
  const version = localStorage.getItem('picko_storage_version');
  
  if (!version || version < '2.0') {
    const history = getScanHistory();
    const migratedHistory = history.map(item => ({
      ...item,
      product: {
        ...item.product,
        type: 'FOOD' as const, // Asignar tipo a productos existentes
        verdict: item.product.status || 'questionable',
        score: item.product.nutritionScore || 50
      }
    }));
    
    localStorage.setItem(KEYS.SCAN_HISTORY, JSON.stringify(migratedHistory));
    localStorage.setItem('picko_storage_version', STORAGE_VERSION);
  }
}
```

---

### FASE 3: SCORING ENGINE (Prioridad: 🔴 CRÍTICA)
**Estimación:** 3-4 horas

#### 3.1 Crear `src/services/scoring.service.ts` - NUEVO ARCHIVO

```typescript
// Archivo: src/services/scoring.service.ts

import { Product, FoodProduct, CosmeticProduct, isFoodProduct } from '../lib/types';
import { UserProfile } from '../lib/demo-data';

// STRATEGY INTERFACE
interface ScoringStrategy {
  calculateScore(product: Product, userProfile: UserProfile): number;
  getDeductions(): ScoringDeduction[];
  getBonuses(): ScoringBonus[];
}

interface ScoringDeduction {
  reason: string;
  points: number;
  isCritical: boolean;
}

interface ScoringBonus {
  reason: string;
  points: number;
}

// FOOD SCORING STRATEGY
class FoodScoringStrategy implements ScoringStrategy {
  private deductions: ScoringDeduction[] = [];
  private bonuses: ScoringBonus[] = [];

  calculateScore(product: FoodProduct, userProfile: UserProfile): number {
    this.deductions = [];
    this.bonuses = [];
    
    let score = 100;
    
    // CRITICAL: Alérgenos del usuario -> 0
    const hasUserAllergen = product.allergens?.some(allergen =>
      userProfile.allergies.some(a => 
        a.toLowerCase().includes(allergen.toLowerCase())
      )
    );
    
    if (hasUserAllergen) {
      this.deductions.push({
        reason: 'Contiene alérgenos del usuario',
        points: 100,
        isCritical: true
      });
      return 0;
    }
    
    // Azúcar > 10g/100g
    if (product.nutrition.sugar > 10) {
      const deduction = userProfile.goals.includes('Lose Weight') ? 25 : 15;
      score -= deduction;
      this.deductions.push({
        reason: `Alto en azúcar (${product.nutrition.sugar}g)`,
        points: deduction,
        isCritical: false
      });
    }
    
    // Sodio > 400mg
    if (product.nutrition.sodium > 400) {
      score -= 10;
      this.deductions.push({
        reason: `Alto en sodio (${product.nutrition.sodium}mg)`,
        points: 10,
        isCritical: false
      });
    }
    
    // Ultra-procesado
    if (product.ingredients.length > 10) {
      score -= 10;
      this.deductions.push({
        reason: 'Producto ultra-procesado',
        points: 10,
        isCritical: false
      });
    }
    
    // BONUSES
    if (product.nutrition.protein > 15) {
      score += 10;
      this.bonuses.push({
        reason: `Alto en proteína (${product.nutrition.protein}g)`,
        points: 10
      });
    }
    
    if (product.nutrition.fiber > 5) {
      score += 5;
      this.bonuses.push({
        reason: `Alto en fibra (${product.nutrition.fiber}g)`,
        points: 5
      });
    }
    
    return Math.max(0, Math.min(100, score));
  }
  
  getDeductions() { return this.deductions; }
  getBonuses() { return this.bonuses; }
}

// COSMETIC SCORING STRATEGY
class CosmeticScoringStrategy implements ScoringStrategy {
  private deductions: ScoringDeduction[] = [];
  private bonuses: ScoringBonus[] = [];
  
  // Lista de ingredientes comedogénicos
  private comedogenicIngredients = [
    'coconut oil', 'cocoa butter', 'wheat germ oil',
    'isopropyl myristate', 'lanolin'
  ];
  
  // Ingredientes beneficiosos por tipo de piel
  private beneficialForDry = ['ceramides', 'hyaluronic acid', 'glycerin', 'squalane'];
  private beneficialForOily = ['niacinamide', 'salicylic acid', 'zinc', 'retinol'];
  
  calculateScore(product: CosmeticProduct, userProfile: UserProfile): number {
    this.deductions = [];
    this.bonuses = [];
    
    let score = 100;
    const skinProfile = userProfile.skin;
    
    if (!skinProfile) return 80; // Sin perfil, score neutral
    
    // CRITICAL: Piel sensible + Fragancia/Alcohol
    if (skinProfile.type === 'Sensitive') {
      if (product.attributes.hasFragrance) {
        score -= 30;
        this.deductions.push({
          reason: 'Contiene fragancia (piel sensible)',
          points: 30,
          isCritical: true
        });
      }
      if (product.attributes.hasAlcohol) {
        score -= 30;
        this.deductions.push({
          reason: 'Contiene alcohol (piel sensible)',
          points: 30,
          isCritical: true
        });
      }
    }
    
    // Acné + Ingrediente comedogénico
    if (skinProfile.concerns.includes('Acne')) {
      const hasComedogenic = product.ingredients.some(ing =>
        this.comedogenicIngredients.some(c => 
          ing.toLowerCase().includes(c)
        )
      );
      if (hasComedogenic) {
        score -= 20;
        this.deductions.push({
          reason: 'Ingredientes comedogénicos (usuario con acné)',
          points: 20,
          isCritical: false
        });
      }
    }
    
    // Usuario evita ingredientes específicos
    skinProfile.avoid.forEach(ingredient => {
      const hasIngredient = product.ingredients.some(ing =>
        ing.toLowerCase().includes(ingredient.toLowerCase())
      );
      if (hasIngredient) {
        score -= 20;
        this.deductions.push({
          reason: `Contiene ${ingredient} (usuario evita)`,
          points: 20,
          isCritical: false
        });
      }
    });
    
    // BONUSES por coincidencia de tipo de piel
    if (skinProfile.type === 'Dry') {
      const hasBeneficial = product.ingredients.some(ing =>
        this.beneficialForDry.some(b => ing.toLowerCase().includes(b))
      );
      if (hasBeneficial) {
        score += 15;
        this.bonuses.push({
          reason: 'Ingredientes hidratantes (piel seca)',
          points: 15
        });
      }
    }
    
    if (skinProfile.type === 'Oily') {
      const hasBeneficial = product.ingredients.some(ing =>
        this.beneficialForOily.some(b => ing.toLowerCase().includes(b))
      );
      if (hasBeneficial) {
        score += 15;
        this.bonuses.push({
          reason: 'Ingredientes controladores (piel grasa)',
          points: 15
        });
      }
    }
    
    return Math.max(0, Math.min(100, score));
  }
  
  getDeductions() { return this.deductions; }
  getBonuses() { return this.bonuses; }
}

// FACTORY
export function getScoringStrategy(productType: 'FOOD' | 'COSMETIC'): ScoringStrategy {
  return productType === 'FOOD' 
    ? new FoodScoringStrategy() 
    : new CosmeticScoringStrategy();
}
```

---

### FASE 4: AI SERVICE REFACTORING (Prioridad: 🔴 CRÍTICA)
**Estimación:** 2-3 horas

#### 4.1 Modificar `ai-analysis.service.ts`

**Archivo:** `src/services/ai-analysis.service.ts`

```
TAREAS:
[ ] Agregar parámetro obligatorio 'productType' a analyzeProductWithAI
[ ] Crear función generateFoodPrompt()
[ ] Crear función generateCosmeticPrompt()
[ ] Modificar generatePrompt para seleccionar entre ambos
[ ] Actualizar AIAnalysisResult para soportar campos de cosmética
[ ] Agregar validación de JSON con schema esperado
```

**Nuevos Prompts:**

```typescript
// PROMPT TEMPLATE: FOOD
function generateFoodPrompt(product: FoodProduct, userProfile: UserProfile, lang: Language): string {
  return `ROLE: Expert Clinical Nutritionist.
TASK: Analyze this food product based on user profile.
USER: Goals: ${userProfile.goals.join(', ')}, Allergies: ${userProfile.allergies.join(', ')}, Diet: ${userProfile.preferences.join(', ')}
PRODUCT: ${product.name} (${product.brand})
INGREDIENTS: ${product.ingredients.join(', ')}
ALLERGENS: ${product.allergens?.join(', ') || 'none'}
NUTRITION/${product.nutrition.servingSize}: Cal:${product.nutrition.calories}, Prot:${product.nutrition.protein}g, Sugar:${product.nutrition.sugar}g, Fat:${product.nutrition.fat}g, Sodium:${product.nutrition.sodium}mg

CRITICAL RULES:
1. If contains user ALLERGIES → verdict: "not-recommended", score: max 30
2. Analyze macros vs User Goals

JSON OUTPUT:
{
  "score": number (0-100),
  "verdict": "suitable" | "questionable" | "not-recommended",
  "summary": "2 sentences personalized, ${lang === 'ES' ? 'in Spanish' : 'in English'}",
  "benefits": ["string"],
  "risks": ["string"],
  "matchesDiet": boolean
}`;
}

// PROMPT TEMPLATE: COSMETIC
function generateCosmeticPrompt(product: CosmeticProduct, userProfile: UserProfile, lang: Language): string {
  const skin = userProfile.skin || { type: 'Normal', concerns: [], avoid: [] };
  
  return `ROLE: Expert Dermatologist & Cosmetic Chemist.
TASK: Analyze cosmetic product for user's skin profile.
USER SKIN: Type: ${skin.type}, Concerns: ${skin.concerns.join(', ')}, Avoid: ${skin.avoid.join(', ')}
PRODUCT: ${product.name} (${product.brand})
INGREDIENTS: ${product.ingredients.join(', ')}
APPLICATION: ${product.applicationArea}

CRITICAL RULES:
1. IGNORE calories/nutrition completely
2. Focus on Comedogenicity, Irritation, Active Ingredients
3. If Acne concerns + comedogenic ingredients → penalize heavily
4. If Sensitive skin + Alcohol/Fragrance → penalize heavily

JSON OUTPUT:
{
  "score": number (0-100),
  "verdict": "suitable" | "questionable" | "not-recommended",
  "summary": "2 sentences about skin reaction & benefits, ${lang === 'ES' ? 'in Spanish' : 'in English'}",
  "keyActives": ["Retinol", "Niacinamide"...],
  "irritantsFound": ["Fragrance"...],
  "benefits": ["string"],
  "risks": ["string"]
}`;
}
```

---

### FASE 5: UI/UX IMPLEMENTATION (Prioridad: 🟠 ALTA)
**Estimación:** 4-6 horas

#### 5.1 Scanner/Camera Screen

**Archivo:** `src/components/screens/CameraScreen.tsx`

```
TAREAS:
[ ] Agregar toggle/selector de tipo de producto
    [🍎 Alimentos] ←→ [🧴 Cosmética]
[ ] Almacenar selección en state antes de escaneo
[ ] Pasar productType a la llamada de AI
[ ] Modificar navegación a ScanResultScreen con tipo
```

**Componente Toggle:**
```tsx
<div className="product-type-selector">
  <button 
    className={`type-btn ${productType === 'FOOD' ? 'active' : ''}`}
    onClick={() => setProductType('FOOD')}
  >
    🍎 Alimentos
  </button>
  <button 
    className={`type-btn ${productType === 'COSMETIC' ? 'active' : ''}`}
    onClick={() => setProductType('COSMETIC')}
  >
    🧴 Cosmética
  </button>
</div>
```

#### 5.2 ProductCard Polimórfico

**Archivo:** `src/components/ProductCard.tsx`

```
TAREAS:
[ ] Importar isFoodProduct, isCosmeticProduct type guards
[ ] Bifurcar renderizado según tipo:
    - FOOD: Mostrar calorías, semáforo nutricional, tags
    - COSMETIC: Mostrar badges (Non-Comedogenic, Fragrance Free, iconos piel)
[ ] Crear componentes internos:
    - FoodBadges
    - CosmeticBadges
[ ] Adaptar getStatusConfig para ambos tipos
```

**Renderizado Condicional:**
```tsx
{isFoodProduct(product) && (
  <div className="food-info">
    <span className="calories">{product.nutrition.calories} kcal</span>
    {product.tags?.map(tag => <Badge key={tag}>{tag}</Badge>)}
  </div>
)}

{isCosmeticProduct(product) && (
  <div className="cosmetic-info">
    {product.attributes.isNonComedogenic && <Badge>Non-Comedogenic</Badge>}
    {!product.attributes.hasFragrance && <Badge>Fragrance Free</Badge>}
    <SkinTypeIcon type={product.skinTypes?.[0]} />
  </div>
)}
```

#### 5.3 ScanResultScreen

**Archivo:** `src/components/screens/ScanResultScreen.tsx`

```
TAREAS:
[ ] Adaptar header según tipo de producto
[ ] FOOD: Mantener sección nutricional actual
[ ] COSMETIC: Reemplazar sección nutricional con:
    - Tipo de aplicación
    - Ingredientes activos clave
    - Alertas de irritantes
    - Compatibilidad con tipo de piel
[ ] Usar isFoodProduct/isCosmeticProduct para bifurcar
```

#### 5.4 ShoppingListScreen

**Archivo:** `src/components/screens/ShoppingListScreen.tsx`

```
TAREAS:
[ ] Agrupar productos por tipo (FOOD vs COSMETIC)
[ ] Crear secciones visuales:
    - 🛒 "Despensa" (FOOD)
    - 🛁 "Tocador/Baño" (COSMETIC)
[ ] Separar estadísticas por vertical
[ ] Actualizar filtros para incluir tipo
```

#### 5.5 Registration Flow Update

**Archivo:** `src/components/screens/RegistrationScreen.tsx`

```
TAREAS:
[ ] Agregar paso adicional: "Perfil de Piel"
[ ] Selector de tipo de piel (Seca, Grasa, Mixta, Normal, Sensible)
[ ] Checkboxes para preocupaciones (Acné, Rosácea, Envejecimiento)
[ ] Checkboxes para ingredientes a evitar
[ ] Paso opcional pero recomendado
```

---

### FASE 6: TRANSLATIONS UPDATE
**Estimación:** 1-2 horas

**Archivo:** `src/lib/translations.ts`

```
TAREAS:
[ ] Agregar traducciones para:
    - Tipos de piel
    - Preocupaciones dermatológicas
    - Ingredientes a evitar
    - Labels de productos cosméticos
    - Mensajes de UI nuevos
    - Badges y tags
```

---

## 📁 ESTRUCTURA DE ARCHIVOS FINAL

```
src/
├── lib/
│   ├── types.ts          # NUEVO: Sistema de tipos polimórfico
│   ├── demo-data.ts      # MODIFICADO: Productos + UserProfile expandido
│   ├── storage.ts        # MODIFICADO: Migración + skin profile
│   └── translations.ts   # MODIFICADO: Nuevas traducciones
├── services/
│   ├── scoring.service.ts      # NUEVO: Strategy pattern scoring
│   ├── ai-analysis.service.ts  # MODIFICADO: Prompts por vertical
│   └── ...
├── components/
│   ├── ProductCard.tsx              # MODIFICADO: Renderizado polimórfico
│   ├── screens/
│   │   ├── CameraScreen.tsx         # MODIFICADO: Selector de tipo
│   │   ├── ScanResultScreen.tsx     # MODIFICADO: UI polimórfica
│   │   ├── ShoppingListScreen.tsx   # MODIFICADO: Secciones
│   │   ├── RegistrationScreen.tsx   # MODIFICADO: Paso skin
│   │   └── ProfileScreen.tsx        # MODIFICADO: Edición skin
```

---

## 🔄 ORDEN DE IMPLEMENTACIÓN RECOMENDADO

```
Semana 1: Cimientos
├── Día 1-2: FASE 1 (Data Model)
│   └── types.ts, demo-data.ts
└── Día 3: FASE 2 (Storage Migration)
    └── storage.ts

Semana 1-2: Lógica
├── Día 4-5: FASE 3 (Scoring Engine)
│   └── scoring.service.ts
└── Día 6-7: FASE 4 (AI Service)
    └── ai-analysis.service.ts

Semana 2: UI/UX
├── Día 8-9: FASE 5.1-5.2 (Scanner + ProductCard)
├── Día 10-11: FASE 5.3-5.4 (Results + Shopping)
└── Día 12: FASE 5.5 + FASE 6 (Registration + Translations)

Día 13-14: Testing & Polish
└── QA, edge cases, demo prep
```

---

## ⚠️ RIESGOS Y MITIGACIONES

| Riesgo | Impacto | Mitigación |
|--------|---------|------------|
| Breaking changes en tipos | Alto | Migración lazy + type guards |
| AI prompts inconsistentes | Medio | Validación estricta de JSON |
| UI/UX confusa | Medio | Selector de tipo obligatorio y visible |
| Performance (scoring) | Bajo | Caching de resultados |
| localStorage lleno | Bajo | Limpieza periódica de historial |

---

## ✅ CRITERIOS DE ACEPTACIÓN PARA DEMO

1. [ ] Usuario puede seleccionar tipo de producto ANTES de escanear
2. [ ] Productos FOOD muestran nutrición, productos COSMETIC muestran atributos de piel
3. [ ] AI genera análisis contextualizado según vertical
4. [ ] Perfil de usuario incluye sección de piel
5. [ ] Shopping list agrupa por categoría
6. [ ] Score refleja lógica específica por tipo
7. [ ] UI es 100% coherente (no muestra "calorías" en cremas)

---

## 🚀 PRÓXIMOS PASOS INMEDIATOS

1. **Crear rama:** `feature/multi-vertical-mvp`
2. **Comenzar con FASE 1:** `types.ts` es la base de todo
3. **Escribir tests unitarios** para type guards y scoring
4. **Crear productos demo** cosméticos realistas
5. **Validar con stakeholders** el flujo de UX propuesto

---

*Documento generado automáticamente. Última actualización: 2024-12-04*

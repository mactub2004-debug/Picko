/**
 * Hook para manejar el estado del IngredientSheet
 */

import { useState, useCallback } from 'react';
import { ProductType, UserProfile } from '../lib/types';
import { getIngredientDetails, IngredientLookupResult } from '../services/ingredient.service';
import { useLanguage } from '../contexts/LanguageContext';

export function useIngredientSheet(productType: ProductType, userProfile: UserProfile) {
    const { language } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const [result, setResult] = useState<IngredientLookupResult | null>(null);

    const openIngredient = useCallback((name: string) => {
        // Lookup es SÍNCRONO - no hay loading state
        const lookup = getIngredientDetails(name, productType, userProfile, language);
        setResult(lookup);
        setIsOpen(true);
    }, [productType, userProfile, language]);

    const close = useCallback(() => {
        setIsOpen(false);
        setResult(null);
    }, []);

    return { isOpen, result, openIngredient, close };
}

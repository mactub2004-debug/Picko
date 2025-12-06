import { useState, useEffect } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { ProductCard } from '../ProductCard';
import { demoProducts } from '../../lib/demo-data';
import { ProductService } from '../../services/product.service';
import { Button } from '../ui/button';
import { useLanguage } from '../../contexts/LanguageContext';
import { analyzeProductWithAI } from '../../services/ai-analysis.service';
import { StorageService } from '../../lib/storage';

interface SearchScreenProps {
  onNavigate: (screen: string, data?: any) => void;
}

export function SearchScreen({ onNavigate }: SearchScreenProps) {
  const { t, language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<string | null>(null);

  const [scanHistory, setScanHistory] = useState<any[]>([]);

  useEffect(() => {
    const history = StorageService.getScanHistory();
    setScanHistory(history);
  }, []);

  // Map English categories to translated ones
  const categoryMap: Record<string, string> = {
    'Snacks': t.home.categories.snacks,
    'Beverages': t.home.categories.beverages,
    'Dairy': t.home.categories.dairy,
    'Breakfast': t.home.categories.breakfast,
    'Frozen': t.home.categories.frozen
  };

  const uniqueCategories = Array.from(new Set(demoProducts.map(p => p.category)));
  const translatedCategories = uniqueCategories.map(cat => categoryMap[cat] || cat);
  const categories = [t.home.viewAll, ...translatedCategories];

  const allProducts = ProductService.getAllProducts();

  const filteredProducts = allProducts.filter(product => {
    const matchesSearch = searchQuery === '' ||
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase());

    // Reverse map: translate selected category back to English for filtering
    const reverseCategoryMap: Record<string, string> = {
      [t.home.categories.snacks]: 'Snacks',
      [t.home.categories.beverages]: 'Beverages',
      [t.home.categories.dairy]: 'Dairy',
      [t.home.categories.breakfast]: 'Breakfast',
      [t.home.categories.frozen]: 'Frozen'
    };

    const englishCategory = selectedCategory ? (reverseCategoryMap[selectedCategory] || selectedCategory) : null;
    const matchesCategory = !englishCategory ||
      selectedCategory === t.home.viewAll ||
      product.category === englishCategory;

    return matchesSearch && matchesCategory;
  });

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory(null);
  };

  const handleProductClick = async (product: any) => {
    setIsAnalyzing(product.id);

    try {
      // Get user profile
      const userProfile = StorageService.getUserProfile();

      if (userProfile) {
        // Always analyze with AI to ensure personalized results for current user
        const aiResult = await analyzeProductWithAI(product, userProfile, language);

        // Merge AI results
        const enrichedProduct = {
          ...product,
          status: aiResult.status,
          nutritionScore: aiResult.nutritionScore,
          benefits: aiResult.benefits,
          issues: aiResult.issues,
          aiDescription: aiResult.aiDescription,
          ingredients: aiResult.ingredients || product.ingredients,
          allergens: aiResult.allergens || product.allergens
        };

        // ✅ SOLUCIÓN: Guardar en historial AQUÍ para que cuente como escaneo real
        StorageService.addScanHistoryItem(enrichedProduct, false);

        // Navigate with fresh analysis
        onNavigate('scan-result', { product: enrichedProduct });
      } else {
        // Fallback if no profile - también guardar
        StorageService.addScanHistoryItem(product, false);
        onNavigate('scan-result', { product });
      }
    } catch (error) {
      console.error('Error analyzing product:', error);
      // Guardar aunque falle el análisis
      StorageService.addScanHistoryItem(product, false);
      onNavigate('scan-result', { product });
    } finally {
      setIsAnalyzing(null);
    }
  };

  const hasActiveFilters = searchQuery || selectedCategory;

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 pt-10 pb-6 sticky top-0 z-10">
        <div className="max-w-md mx-auto">
          <h1>{t.search.title}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t.search.subtitle}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="max-w-md mx-auto px-6 py-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder={t.search.placeholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 pr-12 h-12 bg-white rounded-2xl border-gray-200"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-gray-900"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mt-4">
          {/* Category Filter */}
          <div className="w-full overflow-x-auto pb-2 -mx-6 px-6 scrollbar-hide">
            <div className="flex gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category === selectedCategory ? null : category)}
                  className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedCategory === category
                    ? 'bg-[#28C567] text-white'
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>

        {hasActiveFilters && (
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {selectedCategory && (
                <span>{selectedCategory} • </span>
              )}
            </p>
            <button
              onClick={clearFilters}
              className="text-sm text-[#28C567] font-medium hover:underline"
            >
              {t.search.clearFilters}
            </button>
          </div>
        )}
      </div>

      {/* Results */}
      <div className="max-w-md mx-auto px-6 pb-6">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <Search className="w-10 h-10 text-muted-foreground/50" />
            </div>
            <p className="text-muted-foreground">{t.search.noResults}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {t.search.tryAdjusting}
            </p>
          </div>
        ) : (
          <div>
            <p className="text-sm text-muted-foreground mb-4">
              {filteredProducts.length} {t.search.found}
            </p>
            <div className="space-y-3">
              {filteredProducts.map((product, index) => (
                <div
                  key={product.id}
                  className="animate-in fade-in slide-in-from-bottom-4 relative"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <ProductCard
                    product={product}
                    onClick={() => handleProductClick(product)}
                  />
                  {isAnalyzing === product.id && (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center rounded-2xl z-10">
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="w-8 h-8 text-[#28C567] animate-spin" />
                        <span className="text-sm font-medium text-[#28C567]">{t.common.loading}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

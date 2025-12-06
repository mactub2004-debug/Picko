import { ChevronLeft, CheckCircle2, AlertTriangle, XCircle, Share2, Camera, GitCompare, Sparkles } from 'lucide-react';
import { Product, demoProducts, demoScanHistory } from '../../lib/demo-data';
import { StorageService } from '../../lib/storage';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { ProductCard } from '../ProductCard';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { useState, useEffect } from 'react';
import { ComparisonDialog } from '../ComparisonDialog';
import { useLanguage } from '../../contexts/LanguageContext';
import { analyzeProductWithAI } from '../../services/ai-analysis.service';
import { useIngredientSheet } from '../../hooks/useIngredientSheet';
import { IngredientSheet } from '../IngredientSheet';

interface ScanResultScreenProps {
  product: Product;
  onNavigate: (screen: string, data?: any) => void;
  onBack: () => void;
}

export function ScanResultScreen({ product: initialProduct, onNavigate, onBack }: ScanResultScreenProps) {
  const { t, language } = useLanguage();
  const [product, setProduct] = useState(initialProduct);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isPurchased, setIsPurchased] = useState(false);
  const [currentHistoryId, setCurrentHistoryId] = useState<string | null>(null);
  const [showComparisonDialog, setShowComparisonDialog] = useState(false);

  // Ingredient Sheet
  const userProfile = StorageService.getUserProfile();
  const ingredientSheet = useIngredientSheet(product.type, userProfile || { allergies: [], preferences: [], goals: [], name: '', email: '', country: '', language: 'ES', skin: { type: null, concerns: [], avoid: [] } });



  useEffect(() => {
    // Scroll to top when screen loads
    window.scrollTo(0, 0);

    // Update product state when initial product changes
    setProduct(initialProduct);

    // Check if product is in favorites or purchased
    const history = StorageService.getScanHistory();
    const historyItem = history.find(item => item.product.id === initialProduct.id);

    if (historyItem) {
      setCurrentHistoryId(historyItem.id);
      setIsFavorite(historyItem.isFavorite || false);
      setIsPurchased(historyItem.isPurchased || false);
      // Update product with latest data from history (including AI results)
      if (historyItem.product.nutritionScore !== undefined) {
        setProduct(historyItem.product);
      }
    } else {
      // Product NOT in history (e.g. clicked from Home/Search demo items)
      // We must add it to history and analyze it if it doesn't have a score
      if (initialProduct.nutritionScore === undefined) {
        console.log('🚀 New product detected, adding to history and analyzing...');

        // 1. Add to history immediately
        StorageService.addScanHistoryItem(initialProduct, false);

        // 2. Start AI Analysis
        const userProfile = StorageService.getUserProfile();
        if (userProfile) {
          analyzeProductWithAI(initialProduct, userProfile, language)
            .then(aiResult => {
              console.log('✅ Analysis complete, updating history:', aiResult.nutritionScore);

              const enrichedProduct = {
                ...initialProduct,
                status: aiResult.status,
                nutritionScore: aiResult.nutritionScore,
                benefits: aiResult.benefits,
                issues: aiResult.issues,
                aiDescription: aiResult.aiDescription,
                ingredients: aiResult.ingredients || initialProduct.ingredients,
                allergens: aiResult.allergens || initialProduct.allergens
              };

              // Update in history
              StorageService.updateProductInHistory(initialProduct.id, enrichedProduct);

              // Update local state
              setProduct(enrichedProduct);
            })
            .catch(err => console.error('❌ Analysis failed:', err));
        }
      }
    }

    // Poll for updates from background AI analysis (in case it was started by CameraScreen)
    const pollInterval = setInterval(() => {
      const updatedHistory = StorageService.getScanHistory();
      const updatedItem = updatedHistory.find(item => item.product.id === initialProduct.id);

      // Only update if we found a better version (with score) and our current one doesn't have it
      if (updatedItem && updatedItem.product.nutritionScore !== undefined && product.nutritionScore === undefined) {
        console.log('📊 Polling found updated product:', updatedItem.product.nutritionScore);
        setProduct(updatedItem.product);
      }
    }, 1000); // Slower polling is fine now that we handle direct analysis

    return () => clearInterval(pollInterval);
  }, [initialProduct]);

  const handleTogglePurchased = () => {
    console.log('🛒 Toggling purchased for product:', product.id);

    // First, ensure product is in history
    let history = StorageService.getScanHistory();
    let historyItem = history.find(item => item.product.id === product.id);

    if (!historyItem) {
      console.log('🛒 Product not in history, adding it first...');
      // Add to history if not exists
      const newItem = StorageService.addScanHistoryItem(product, false);
      if (!newItem) {
        console.error('🛒 Failed to add product to history');
        return;
      }
      historyItem = newItem;
      setCurrentHistoryId(newItem.id);
    }

    // Now toggle purchased using the history ID
    const updatedHistory = StorageService.togglePurchased(historyItem.id);
    console.log('🛒 Updated history length:', updatedHistory.length);

    // Update local state
    const isNowPurchased = updatedHistory.some(item => item.product.id === product.id && item.isPurchased);
    console.log('🛒 New purchased state:', isNowPurchased);
    setIsPurchased(isNowPurchased);
  };

  const getStatusConfig = (status?: Product['status']) => {
    switch (status) {
      case 'suitable':
        return {
          icon: CheckCircle2,
          color: 'text-[#22C55E]',
          bg: 'bg-[#22C55E]',
          label: t.scanResult.status.suitable.label,
          description: t.scanResult.status.suitable.description
        };
      case 'questionable':
        return {
          icon: AlertTriangle,
          color: 'text-[#F97316]',
          bg: 'bg-[#F97316]',
          label: t.scanResult.status.questionable.label,
          description: t.scanResult.status.questionable.description
        };
      case 'not-recommended':
        return {
          icon: XCircle,
          color: 'text-[#EF4444]',
          bg: 'bg-[#EF4444]',
          label: t.scanResult.status.notRecommended.label,
          description: t.scanResult.status.notRecommended.description
        };
      default:
        return {
          icon: AlertTriangle,
          color: 'text-gray-500',
          bg: 'bg-gray-500',
          label: t.home.status.unknown,
          description: ''
        };
    }
  };

  const renderMarkdown = (text: string) => {
    if (!text) return null;
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="font-bold text-gray-900">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  if (!product) return null;

  const statusConfig = getStatusConfig(product.status);
  const StatusIcon = statusConfig.icon;

  const alternativeProducts = demoProducts
    .filter(p => p && p.id && p.id !== product.id && p.status === 'suitable' && p.category === product.category)
    .slice(0, 2);

  const historyProducts = demoScanHistory
    .filter(item => item && item.product && item.product.id && item.product.id !== product.id)
    .map(item => item.product)
    .slice(0, 5);

  return (
    <>
      <div className="min-h-screen bg-[#F8F9FA] pb-20 animate-in fade-in duration-300">
        {/* Header with back button - always visible */}
        <div className={`${statusConfig.bg} text-white p-4 pb-6 sticky top-0 z-20`}>
          <div className="max-w-md mx-auto">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={onBack}
                className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <div className="flex gap-2">
                <button className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3 mb-2">
              <StatusIcon className="w-8 h-8" />
              <div>
                <h2 className="text-white">{statusConfig.label}</h2>
                <p className="text-sm text-white/80">{statusConfig.description}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Product Info - Added margin top for spacing */}
        <div className="max-w-md mx-auto px-6 mt-4">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 animate-in slide-in-from-bottom-8 duration-500">
            <ImageWithFallback
              src={product.image}
              alt={product.name}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <p className="text-sm text-muted-foreground">{product.brand}</p>
              <h2 className="mt-1">{product.name}</h2>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="secondary">{product.category}</Badge>
                <div className="flex items-center gap-1 ml-auto">
                  <span className="text-sm text-muted-foreground">{t.scanResult.nutritionScore}</span>
                  <span className={statusConfig.color}>{product.nutritionScore || '?'}/100</span>
                </div>
              </div>
            </div>
          </div>

          {/* AI-Generated Description or Loading Skeleton */}
          {product.aiDescription ? (
            <div className="mt-4 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-full ${statusConfig.bg} flex items-center justify-center`}>
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">{t.scanResult.analysis.title}</h2>
                </div>
              </div>

              <div className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-2xl border border-gray-100">
                {renderMarkdown(product.aiDescription)}
              </div>
            </div>
          ) : (
            <div className="mt-4 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center animate-pulse">
                  <Sparkles className="w-5 h-5 text-gray-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-400">Analizando con IA...</h2>
                  <p className="text-xs text-gray-400">Evaluando el producto para ti</p>
                </div>
              </div>
              <div className="space-y-2 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>
          )}

          {/* Issues/Benefits */}
          {(product.issues || product.benefits) && (
            <div className="mt-4 space-y-3">
              {product.benefits && product.benefits.length > 0 && (
                <div className="bg-[#22C55E]/10 rounded-2xl p-4 border border-[#22C55E]/20">
                  <h3 className="text-[#22C55E]">{t.scanResult.analysis.benefits}</h3>
                  <ul className="mt-2 space-y-1">
                    {product.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-[#22C55E] mt-0.5 flex-shrink-0" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {product.issues && product.issues.length > 0 && (
                <div className="bg-[#EF4444]/10 rounded-2xl p-4 border border-[#EF4444]/20">
                  <h3 className="text-[#EF4444]">{t.scanResult.analysis.concerns}</h3>
                  <ul className="mt-2 space-y-1">
                    {product.issues.map((issue, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <XCircle className="w-4 h-4 text-[#EF4444] mt-0.5 flex-shrink-0" />
                        <span>{issue}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Ingredients - Clickable */}
          <div className="mt-4 bg-card rounded-2xl p-4 border border-border">
            <h3>{t.scanResult.ingredients}</h3>
            <div className="flex flex-wrap gap-2 mt-3">
              {product.ingredients.map((ingredient, index) => (
                <button
                  key={index}
                  className="ingredient-chip ingredient-chip--clickable"
                  onClick={() => ingredientSheet.openIngredient(ingredient)}
                >
                  {ingredient}
                </button>
              ))}
            </div>
          </div>

          {/* Allergens */}
          {product.allergens && product.allergens.length > 0 && (
            <div className="mt-4 bg-card rounded-2xl p-4 border border-border">
              <h3>{t.scanResult.allergens}</h3>
              <div className="flex flex-wrap gap-2 mt-3">
                {product.allergens.map((allergen, index) => (
                  <Badge key={index} variant="destructive" className="bg-[#EF4444]">
                    {allergen}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Better Alternatives */}
          {alternativeProducts.length > 0 && (
            <div className="mt-6 mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3>{t.scanResult.alternatives.title}</h3>
                <button
                  onClick={() => onNavigate('recommendations')}
                  className="text-sm text-[#22C55E] hover:text-[#22C55E]/80 transition-colors"
                >
                  {t.scanResult.alternatives.seeAll}
                </button>
              </div>
              <div className="space-y-3">
                {alternativeProducts.map((altProduct, index) => (
                  <div
                    key={altProduct.id}
                    className="animate-in fade-in slide-in-from-bottom-4"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <ProductCard
                      product={altProduct}
                      onClick={() => onNavigate('scan-result', { product: altProduct })}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="mt-6 mb-6 space-y-3">
            <Button
              className="w-full h-14 bg-[#22C55E] text-white hover:bg-[#22C55E]/90 rounded-2xl shadow-md"
              onClick={() => onNavigate('camera')}
            >
              <Camera className="w-5 h-5 mr-2" />
              {t.scanResult.actions.scanAnother}
            </Button>

            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="h-14 rounded-2xl"
                onClick={() => setShowComparisonDialog(true)}
              >
                <GitCompare className="w-5 h-5 mr-2" />
                {t.scanResult.actions.compare}
              </Button>
              <Button
                variant={isPurchased ? "default" : "outline"}
                className={`h-14 rounded-2xl ${isPurchased ? 'bg-[#22C55E] hover:bg-[#22C55E]/90 text-white' : ''}`}
                onClick={handleTogglePurchased}
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill={isPurchased ? "currentColor" : "none"}
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {isPurchased ? t.scanResult.actions.purchased : t.scanResult.actions.markAsPurchased}
              </Button>
            </div>

            {alternativeProducts.length > 0 && (
              <Button
                variant="outline"
                className="w-full h-14 rounded-2xl"
                onClick={() => onNavigate('recommendations')}
              >
                {t.scanResult.actions.viewSimilar}
              </Button>
            )}
          </div>
        </div>
      </div>

      <ComparisonDialog
        open={showComparisonDialog}
        onOpenChange={setShowComparisonDialog}
        productName={product.name}
        historyProducts={historyProducts}
        onScanNew={() => {
          setShowComparisonDialog(false);
          onNavigate('camera');
        }}
        onSelectProduct={(historyProduct) => {
          setShowComparisonDialog(false);
          onNavigate('comparison', { products: [product, historyProduct] });
        }}
      />

      {/* Ingredient Detail Sheet */}
      <IngredientSheet
        isOpen={ingredientSheet.isOpen}
        onClose={ingredientSheet.close}
        result={ingredientSheet.result}
      />
    </>
  );
}

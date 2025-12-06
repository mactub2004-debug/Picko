import { useState, useEffect } from 'react';
import { Scan, Sparkles, Users, Lightbulb, TrendingUp, Loader2 } from 'lucide-react';
import { demoProducts } from '../../lib/demo-data';
import { ProductService } from '../../services/product.service';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { StorageService, UserProfile } from '../../lib/storage';
import { useLanguage } from '../../contexts/LanguageContext';
import { analyzeProductWithAI } from '../../services/ai-analysis.service';

interface HomeScreenProps {
  onNavigate: (screen: string, data?: any) => void;
}

export function HomeScreen({ onNavigate }: HomeScreenProps) {
  const { t, language } = useLanguage();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [scanHistory, setScanHistory] = useState<any[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState<string | null>(null);
  const [recommendedProducts, setRecommendedProducts] = useState<any[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  // Reload data when component mounts or refreshKey changes
  useEffect(() => {
    const profile = StorageService.getUserProfile();
    setUserProfile(profile);
    const history = StorageService.getScanHistory();
    setScanHistory(history);

    // Load fresh products from ProductService (includes scanned versions with scores)
    const freshRecommended = profile
      ? ProductService.getRecommendedProducts(profile)
      : ProductService.getAllProducts().slice(0, 3);
    setRecommendedProducts(freshRecommended);

    console.log('🏠 HomeScreen: Loaded', freshRecommended.length, 'recommended products');
  }, [refreshKey]);

  // Force refresh when screen becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        setRefreshKey(prev => prev + 1);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Calculate real stats from ALL items
  const scanCount = scanHistory.length;
  const averageScore = scanCount > 0
    ? Math.round(scanHistory.reduce((acc, item) => acc + (item.product.nutritionScore || 0), 0) / scanCount)
    : 0;

  const getStatusConfig = (status?: string) => {
    switch (status) {
      case 'suitable':
        return {
          label: t.home.status.suitable,
          color: 'text-[#22C55E]',
          bg: 'bg-[#22C55E]',
          lightBg: 'bg-[#22C55E]/10'
        };
      case 'questionable':
        return {
          label: t.home.status.questionable,
          color: 'text-[#F97316]',
          bg: 'bg-[#F97316]',
          lightBg: 'bg-[#F97316]/10'
        };
      case 'not-recommended':
        return {
          label: t.home.status.notRecommended,
          color: 'text-[#EF4444]',
          bg: 'bg-[#EF4444]',
          lightBg: 'bg-[#EF4444]/10'
        };
      default:
        return {
          label: t.home.status.unknown,
          color: 'text-gray-500',
          bg: 'bg-gray-500',
          lightBg: 'bg-gray-500/10'
        };
    }
  };

  const handleProductClick = async (product: any) => {
    setIsAnalyzing(product.id);

    try {
      if (userProfile) {
        // Analyze with AI
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
        // Esto evita que se cree un registro duplicado al marcar como "comprado"
        StorageService.addScanHistoryItem(enrichedProduct, false);

        // Navigate with fresh analysis
        onNavigate('scan-result', { product: enrichedProduct });
      } else {
        // Fallback sin perfil - también guardar
        StorageService.addScanHistoryItem(product, false);
        onNavigate('scan-result', { product });
      }
    } catch (error) {
      console.error('Error analyzing product:', error);
      // Incluso si falla la IA, guardar para que el usuario pueda verlo en historial
      StorageService.addScanHistoryItem(product, false);
      onNavigate('scan-result', { product });
    } finally {
      setIsAnalyzing(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-24">
      <div className="max-w-md mx-auto">
        {/* Header - Greeting */}
        <div className="px-6 pt-10 pb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="mb-2">{t.home.greeting}, {userProfile?.name.split(' ')[0] || 'Guest'}! 👋</h1>
              <p className="text-sm text-muted-foreground">{t.home.readyMessage}</p>
            </div>
            <button
              onClick={() => onNavigate('profile')}
              className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center hover:shadow-md transition-all active:scale-95 border border-gray-100"
            >
              <div className="w-10 h-10 rounded-full bg-[#22C55E]/10 flex items-center justify-center">
                <span className="text-lg">👤</span>
              </div>
            </button>
          </div>
        </div>

        {/* Stats Cards or Empty State */}
        <div className="px-6 pb-7">
          {scanCount === 0 ? (
            // Empty State
            <div className="bg-gradient-to-br from-[#22C55E]/10 to-[#22C55E]/5 rounded-2xl p-8 border-2 border-dashed border-[#22C55E]/30 text-center">
              <div className="w-20 h-20 bg-[#22C55E] rounded-full flex items-center justify-center mb-4 mx-auto shadow-lg">
                <Scan className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{t.home.emptyState.title}</h3>
              <p className="text-sm text-muted-foreground mb-6">
                {t.home.emptyState.description}
              </p>
              <button
                onClick={() => onNavigate('camera')}
                className="w-full bg-[#22C55E] hover:bg-[#16A34A] text-white font-bold py-3.5 rounded-xl shadow-lg shadow-green-200 transition-all active:scale-95"
              >
                {t.home.scanProduct}
              </button>
            </div>
          ) : (
            // Stats Cards
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-2 text-muted-foreground">
                  <Scan className="w-4 h-4" />
                  <span className="text-xs font-medium">{t.stats.totalScans}</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{scanCount}</p>
              </div>
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-2 text-muted-foreground">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-xs font-medium">{t.stats.nutritionScore}</span>
                </div>
                <p className="text-2xl font-bold text-[#22C55E]">{averageScore}</p>
              </div>
            </div>
          )}
        </div>

        {/* Recommended Section */}
        <div className="mb-8">
          <div className="px-6 flex items-center justify-between mb-4">
            <h3>{t.home.recommended}</h3>
            <button
              onClick={() => onNavigate('search')}
              className="text-sm text-[#22C55E] font-medium hover:underline"
            >
              {t.home.viewAll}
            </button>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2 px-6 scrollbar-hide">
            {recommendedProducts.map((product) => {
              const statusConfig = getStatusConfig(product.status);
              return (
                <div
                  key={product.id}
                  onClick={() => handleProductClick(product)}
                  className="relative flex-shrink-0 w-[220px] bg-white rounded-2xl overflow-hidden shadow-sm cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105 active:scale-95 border border-gray-100"
                >
                  {/* Product Image */}
                  <div className="relative w-full h-40">
                    <ImageWithFallback
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                    <div className={`absolute top-3 right-3 px-3 py-1.5 rounded-full ${statusConfig.lightBg} backdrop-blur-sm`}>
                      <span className={`text-xs ${statusConfig.color}`}>
                        {statusConfig.label}
                      </span>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <p className="text-xs text-muted-foreground mb-1">{product.brand}</p>
                    <h4 className="line-clamp-2 mb-1">{product.name}</h4>
                    <p className="text-xs text-muted-foreground mb-3">{product.category}</p>

                    {/* Score Bar */}
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#22C55E] rounded-full transition-all"
                          style={{ width: `${product.nutritionScore || 0}%` }}
                        />
                      </div>
                      <span className="text-xs min-w-[2rem] text-right">{product.nutritionScore || '?'}</span>
                    </div>
                  </div>

                  {/* Loading Overlay */}
                  {isAnalyzing === product.id && (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10">
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="w-8 h-8 text-[#28C567] animate-spin" />
                        <span className="text-sm font-medium text-[#28C567]">{t.common.loading}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Daily Tip */}
        <div className="px-6 pb-8">
          <div className="bg-[#FEF3E2] rounded-2xl p-5 border border-[#F97316]/20 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-full bg-[#F97316]/20 flex items-center justify-center flex-shrink-0 shadow-sm">
                <Lightbulb className="w-7 h-7 text-[#F97316]" />
              </div>
              <div className="flex-1">
                <p className="mb-2">{t.home.dailyTip}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t.home.tipContent}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

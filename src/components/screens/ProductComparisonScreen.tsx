import { ChevronLeft, CheckCircle2, AlertTriangle, XCircle, ArrowRight, Plus, Scan } from 'lucide-react';
import { Product } from '../../lib/demo-data';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { useLanguage } from '../../contexts/LanguageContext';

interface ProductComparisonScreenProps {
  products: Product[];
  onNavigate: (screen: string, data?: any) => void;
  onBack: () => void;
  onAddProduct?: () => void;
}

export function ProductComparisonScreen({ products, onNavigate, onBack, onAddProduct }: ProductComparisonScreenProps) {
  const { t } = useLanguage();

  const getStatusConfig = (status: Product['status']) => {
    switch (status) {
      case 'suitable':
        return {
          icon: CheckCircle2,
          color: 'text-[#22C55E]',
          bg: 'bg-[#22C55E]',
          label: t.comparison.status.suitable
        };
      case 'questionable':
        return {
          icon: AlertTriangle,
          color: 'text-[#F97316]',
          bg: 'bg-[#F97316]',
          label: t.comparison.status.questionable
        };
      case 'not-recommended':
        return {
          icon: XCircle,
          color: 'text-[#EF4444]',
          bg: 'bg-[#EF4444]',
          label: t.comparison.status.notRecommended
        };
      default:
        return {
          icon: AlertTriangle,
          color: 'text-gray-500',
          bg: 'bg-gray-500',
          label: t.comparison.status.unknown
        };
    }
  };

  // Get best product name for the recommendation text
  const bestProduct = [...products].sort((a, b) => (b.nutritionScore || 0) - (a.nutritionScore || 0))[0];
  const bestChoiceText = t.comparison.bestChoiceText.replace('{product}', bestProduct?.name || '');

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-6">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 pt-10 pb-6 sticky top-0 z-10">
        <div className="max-w-md mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <button
              onClick={onBack}
              className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors -ml-2"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h1>{t.comparison.title}</h1>
          </div>
          <p className="text-sm text-muted-foreground pl-12">
            {t.comparison.subtitle.replace('{count}', String(products.length))}
          </p>
        </div>
      </div>

      {/* Products Header Cards */}
      <div className="max-w-md mx-auto px-6 py-6">
        <div className="flex gap-3 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
          {products.map((product) => {
            const statusConfig = getStatusConfig(product.status);
            const StatusIcon = statusConfig.icon;

            return (
              <div
                key={product.id}
                className="flex-shrink-0 w-40 bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 snap-center"
              >
                <div className="relative">
                  <ImageWithFallback
                    src={product.image}
                    alt={product.name}
                    className="w-full h-32 object-cover"
                  />
                  <div className={`absolute top-2 right-2 p-1.5 rounded-full ${statusConfig.bg}`}>
                    <StatusIcon className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div className="p-3">
                  <p className="text-xs text-muted-foreground truncate">{product.brand}</p>
                  <h3 className="text-sm mt-1 line-clamp-2">{product.name}</h3>
                </div>
              </div>
            );
          })}

          {/* Add product button */}
          {products.length < 3 && (
            <div className="flex flex-col gap-2">
              {onAddProduct && (
                <button
                  onClick={onAddProduct}
                  className="flex-shrink-0 w-40 bg-white rounded-2xl overflow-hidden shadow-sm border-2 border-dashed border-gray-300 hover:border-[#22C55E] transition-colors flex flex-col items-center justify-center gap-2 h-[110px] snap-center"
                >
                  <div className="w-8 h-8 rounded-full bg-[#22C55E]/10 flex items-center justify-center">
                    <Plus className="w-4 h-4 text-[#22C55E]" />
                  </div>
                  <p className="text-xs text-muted-foreground">{t.comparison.selectFromHistory}</p>
                </button>
              )}

              <button
                onClick={() => onNavigate('camera', { returnTo: 'comparison', currentProducts: products })}
                className="flex-shrink-0 w-40 bg-white rounded-2xl overflow-hidden shadow-sm border-2 border-dashed border-gray-300 hover:border-[#22C55E] transition-colors flex flex-col items-center justify-center gap-2 h-[110px] snap-center"
              >
                <div className="w-8 h-8 rounded-full bg-[#22C55E]/10 flex items-center justify-center">
                  <Scan className="w-4 h-4 text-[#22C55E]" />
                </div>
                <p className="text-xs text-muted-foreground">{t.comparison.scanNew}</p>
              </button>
            </div>
          )}
        </div>

        {/* Comparison Table */}
        <div className="mt-6 space-y-4">
          {/* Nutrition Score Comparison */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <h3 className="mb-4">{t.comparison.nutritionScore}</h3>
            <div className="space-y-3">
              {products.map((product) => (
                <div key={product.id} className="flex items-center gap-3">
                  <div className="w-20 text-sm text-muted-foreground truncate">{product.brand}</div>
                  <div className="flex-1 flex items-center gap-2">
                    <div className="flex-1 h-3 bg-secondary rounded-full overflow-hidden">
                      <div
                        className={`h-full ${(product.nutritionScore || 0) >= 80 ? 'bg-[#22C55E]' :
                          (product.nutritionScore || 0) >= 60 ? 'bg-[#F97316]' :
                            'bg-[#EF4444]'
                          }`}
                        style={{ width: `${product.nutritionScore || 0}%` }}
                      />
                    </div>
                    <span className="text-sm w-10 text-right">{product.nutritionScore ?? '?'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Status Comparison */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <h3 className="mb-4">{t.comparison.suitabilityStatus}</h3>
            <div className="space-y-3">
              {products.map((product) => {
                const statusConfig = getStatusConfig(product.status);
                const StatusIcon = statusConfig.icon;

                return (
                  <div key={product.id} className="flex items-center justify-between">
                    <div className="w-20 text-sm text-muted-foreground truncate">{product.brand}</div>
                    <div className="flex items-center gap-2">
                      <StatusIcon className={`w-4 h-4 ${statusConfig.color}`} />
                      <span className={`text-sm ${statusConfig.color}`}>{statusConfig.label}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Allergens Comparison */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <h3 className="mb-4">{t.comparison.allergens}</h3>
            <div className="space-y-4">
              {products.map((product) => (
                <div key={product.id}>
                  <p className="text-sm text-muted-foreground mb-2">{product.brand}</p>
                  <div className="flex flex-wrap gap-2">
                    {product.allergens && product.allergens.length > 0 ? (
                      product.allergens.map((allergen, idx) => (
                        <Badge key={idx} variant="destructive" className="bg-[#EF4444]">
                          {allergen}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">{t.comparison.none}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Benefits/Issues Comparison */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <h3 className="mb-4">{t.comparison.benefitsConcerns}</h3>
            <div className="space-y-4">
              {products.map((product) => (
                <div key={product.id} className="space-y-2">
                  <p className="text-sm text-muted-foreground">{product.brand}</p>

                  {product.benefits && product.benefits.length > 0 && (
                    <div className="space-y-1">
                      {product.benefits.slice(0, 2).map((benefit, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-[#22C55E] mt-0.5 flex-shrink-0" />
                          <span className="text-xs text-muted-foreground">{benefit}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {product.issues && product.issues.length > 0 && (
                    <div className="space-y-1">
                      {product.issues.slice(0, 2).map((issue, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <XCircle className="w-4 h-4 text-[#EF4444] mt-0.5 flex-shrink-0" />
                          <span className="text-xs text-muted-foreground">{issue}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Winner Recommendation */}
          {products.length > 1 && (
            <div className="bg-gradient-to-br from-[#22C55E]/10 to-[#22C55E]/5 rounded-2xl p-4 border border-[#22C55E]/20">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-[#22C55E] flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-[#22C55E] mb-1">{t.comparison.bestChoice}</h3>
                  <p className="text-sm text-muted-foreground">
                    {bestChoiceText}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-6 space-y-3">
          <Button
            className="w-full h-14 bg-[#22C55E] text-white hover:bg-[#22C55E]/90 rounded-2xl shadow-md"
            onClick={() => onNavigate('scan-result', {
              product: bestProduct
            })}
          >
            {t.comparison.viewBest}
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          <Button
            variant="outline"
            className="w-full h-14 rounded-2xl"
            onClick={onBack}
          >
            {t.comparison.backToResults}
          </Button>
        </div>
      </div>
    </div>
  );
}

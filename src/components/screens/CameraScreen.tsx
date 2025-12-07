import { useState, useEffect, useRef } from 'react';
import { X, Camera, Flashlight, ScanBarcode, AlertCircle, Apple, Sparkles } from 'lucide-react';
import { barcodeScannerService } from '../../services/barcode-scanner.service';
import { findProductByBarcode } from '../../services/product-database.service';
import { analyzeProductWithAI } from '../../services/ai-analysis.service';
import { StorageService } from '../../lib/storage';
import { useLanguage } from '../../contexts/LanguageContext';
import { ProductType } from '../../lib/types';

interface CameraScreenProps {
  onNavigate: (screen: string, data?: any) => void;
  onClose: () => void;
  context?: any;
}

export function CameraScreen({ onNavigate, onClose, context }: CameraScreenProps) {
  const { t, language } = useLanguage();
  const [isFlashOn, setIsFlashOn] = useState(false);
  const [scanMode, setScanMode] = useState<'camera' | 'barcode'>('barcode');
  const [productType, setProductType] = useState<ProductType>('FOOD');
  const [isScanning, setIsScanning] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastScannedBarcode, setLastScannedBarcode] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const scanTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (scanMode === 'barcode' && videoRef.current) {
      startBarcodeScanning();
    }

    return () => {
      stopScanning();
    };
  }, [scanMode]);

  const startBarcodeScanning = async () => {
    if (!videoRef.current) return;

    setIsScanning(true);
    setError(null);

    try {
      await barcodeScannerService.startScanning(
        videoRef.current,
        handleBarcodeDetected,
        handleScanError
      );
    } catch (err) {
      handleScanError(err as Error);
    }
  };

  const stopScanning = () => {
    barcodeScannerService.stopScanning();
    setIsScanning(false);
    if (scanTimeoutRef.current) {
      clearTimeout(scanTimeoutRef.current);
    }
  };

  const handleBarcodeDetected = async (barcode: string) => {
    // Prevent duplicate scans with debounce
    if (lastScannedBarcode === barcode || isAnalyzing) {
      console.log('⏭️ Skipping duplicate scan:', barcode);
      return;
    }

    setLastScannedBarcode(barcode);
    setIsAnalyzing(true);
    stopScanning();

    console.log('🔍 Searching for barcode:', barcode, 'Type:', productType);

    const product = findProductByBarcode(barcode);

    if (!product) {
      setError(`${t.camera.productNotFound} (${barcode})`);
      setIsAnalyzing(false);

      scanTimeoutRef.current = setTimeout(() => {
        setError(null);
        setLastScannedBarcode(null);
        if (scanMode === 'barcode') {
          startBarcodeScanning();
        }
      }, 3000);
      return;
    }

    console.log('✅ Product found:', product.name);

    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(200);
    }

    // IMPORTANT: Set the product type based on user selection
    const typedProduct = {
      ...product,
      type: productType
    };

    // Add basic product to history immediately
    StorageService.addScanHistoryItem(typedProduct, false);

    // Navigate IMMEDIATELY with basic product (no AI yet)
    if (context?.returnTo === 'comparison' && context.currentProducts) {
      const updatedProducts = [...context.currentProducts, typedProduct];
      onNavigate('comparison', { products: updatedProducts });
    } else {
      onNavigate('scan-result', { product: typedProduct });
    }

    setIsAnalyzing(false);

    // Analyze with AI in BACKGROUND (non-blocking)
    const userProfile = StorageService.getUserProfile();
    if (userProfile) {
      console.log(`🤖 Analyzing ${productType} product in background...`);
      analyzeProductWithAI(typedProduct, userProfile, language)
        .then(aiResult => {
          // Merge AI results with product
          const enrichedProduct = {
            ...typedProduct,
            status: aiResult.status,
            nutritionScore: aiResult.nutritionScore,
            benefits: aiResult.benefits,
            issues: aiResult.issues,
            aiDescription: aiResult.aiDescription,
            ingredients: aiResult.ingredients || typedProduct.ingredients,
            allergens: aiResult.allergens || typedProduct.allergens
          };

          // Update in history
          StorageService.updateProductInHistory(typedProduct.id, enrichedProduct);
          console.log('✅ AI analysis completed in background');
        })
        .catch(error => {
          console.error('Background AI analysis failed:', error);
        });
    }
  };

  const handleScanError = (err: Error) => {
    console.error('Scan error:', err);
    setError(err.message);
    setIsScanning(false);
  };

  // Helper function to get scan instruction text
  const getScanInstructionText = () => {
    if (isAnalyzing) {
      return t.camera.analyzingProduct;
    }
    if (error) {
      return t.camera.tryAgain;
    }
    if (scanMode === 'barcode') {
      return language === 'ES'
        ? 'Posiciona el código de barras dentro del marco'
        : 'Position the barcode inside the frame';
    }
    return language === 'ES'
      ? 'Centra la etiqueta del producto'
      : 'Center the product label';
  };

  // Helper for status text at bottom
  const getStatusText = () => {
    if (isAnalyzing) {
      return language === 'ES' ? 'Procesando...' : 'Processing...';
    }
    if (isScanning) {
      const typeLabel = productType === 'FOOD'
        ? (t.productType?.selector?.food || 'food')
        : (t.productType?.selector?.cosmetic || 'cosmetic');
      return language === 'ES'
        ? `Escaneando ${typeLabel.toLowerCase()}...`
        : `Scanning ${typeLabel.toLowerCase()}...`;
    }
    return language === 'ES' ? 'Listo para escanear' : 'Ready to scan';
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      <div className="flex-1 relative">
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          playsInline
          muted
        />

        {scanMode !== 'barcode' && (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-800/50 to-gray-900/50 flex items-center justify-center">
            <div className="text-white/30 text-center">
              <Camera className="w-20 h-20 mx-auto mb-4" />
              <p>{language === 'ES' ? 'Modo foto - Próximamente' : 'Photo mode - Coming soon'}</p>
            </div>
          </div>
        )}

        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="relative w-full max-w-sm aspect-[4/3]">
            <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-[#22C55E] rounded-tl-2xl" />
            <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-[#22C55E] rounded-tr-2xl" />
            <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-[#22C55E] rounded-bl-2xl" />
            <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-[#22C55E] rounded-br-2xl" />

            {isAnalyzing && (
              <div className="absolute inset-0 bg-[#22C55E]/20 animate-pulse flex items-center justify-center">
                <div className="bg-black/70 backdrop-blur-md rounded-2xl px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <p className="text-white font-semibold">{t.camera.analyzing}</p>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="absolute inset-0 bg-[#EF4444]/20 flex items-center justify-center">
                <div className="bg-black/70 backdrop-blur-md rounded-2xl px-6 py-4 max-w-xs">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-[#EF4444] flex-shrink-0 mt-0.5" />
                    <p className="text-white text-sm">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {isScanning && !isAnalyzing && !error && (
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute inset-x-0 h-1 bg-[#22C55E] animate-pulse shadow-lg shadow-[#22C55E]/50"
                  style={{
                    top: '50%',
                    animation: 'scan 2s ease-in-out infinite'
                  }}
                />
              </div>
            )}

            <div className="absolute -bottom-16 left-0 right-0 text-center px-4">
              <p className="text-white text-sm drop-shadow-lg">
                {getScanInstructionText()}
              </p>
            </div>
          </div>
        </div>

        <div className="absolute top-0 left-0 right-0 p-6 flex items-center justify-between z-10">
          <button
            onClick={onClose}
            className="w-12 h-12 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center hover:bg-black/70 transition-all active:scale-95 border border-white/10"
          >
            <X className="w-6 h-6 text-white" />
          </button>

          {/* Product Type Selector - TOP CENTER */}
          <div className="flex gap-2 bg-black/50 backdrop-blur-md rounded-full p-1 border border-white/10">
            <button
              onClick={() => setProductType('FOOD')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${productType === 'FOOD'
                ? 'bg-[#22C55E] text-white'
                : 'text-white/60 hover:text-white'
                }`}
            >
              <Apple className="w-4 h-4" />
              <span className="text-sm font-medium">
                {t.productType?.selector?.food || (language === 'ES' ? 'Alimento' : 'Food')}
              </span>
            </button>
            <button
              onClick={() => setProductType('COSMETIC')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${productType === 'COSMETIC'
                ? 'bg-[#A855F7] text-white'
                : 'text-white/60 hover:text-white'
                }`}
            >
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">
                {t.productType?.selector?.cosmetic || (language === 'ES' ? 'Cosmético' : 'Cosmetic')}
              </span>
            </button>
          </div>

          <button
            onClick={() => setIsFlashOn(!isFlashOn)}
            className={`w-12 h-12 rounded-full backdrop-blur-md flex items-center justify-center transition-all active:scale-95 ${isFlashOn
              ? 'bg-[#F97316] shadow-lg shadow-[#F97316]/30 border border-[#F97316]'
              : 'bg-black/50 hover:bg-black/70 border border-white/10'
              }`}
          >
            <Flashlight className="w-6 h-6 text-white" />
          </button>
        </div>
      </div>

      <div className="bg-gradient-to-t from-black via-black/95 to-black/80 p-6 pb-8 backdrop-blur-sm">
        <div className="max-w-md mx-auto">
          <div className="flex gap-3 bg-white/10 rounded-2xl p-1.5 backdrop-blur-md">
            <button
              onClick={() => setScanMode('barcode')}
              className={`flex-1 py-3.5 rounded-xl transition-all flex flex-col items-center gap-1 ${scanMode === 'barcode'
                ? 'bg-[#22C55E] text-white shadow-lg shadow-[#22C55E]/30'
                : 'text-white/60 hover:text-white/80'
                }`}
            >
              <ScanBarcode className={`w-6 h-6 ${scanMode === 'barcode' ? 'stroke-[2.5]' : ''}`} />
              <span className="text-xs">{t.camera.barcode}</span>
            </button>
            <button
              onClick={() => setScanMode('camera')}
              className={`flex-1 py-3.5 rounded-xl transition-all flex flex-col items-center gap-1 ${scanMode === 'camera'
                ? 'bg-[#22C55E] text-white shadow-lg shadow-[#22C55E]/30'
                : 'text-white/60 hover:text-white/80'
                }`}
            >
              <Camera className={`w-6 h-6 ${scanMode === 'camera' ? 'stroke-[2.5]' : ''}`} />
              <span className="text-xs">{t.camera.photo}</span>
            </button>
          </div>

          <p className="text-white/70 text-center text-sm mt-4">
            {getStatusText()}
          </p>
        </div>

        <style>{`
        @keyframes scan {
          0%, 100% { top: 10%; }
          50% { top: 90%; }
        }
      `}</style>
      </div>
    </div>
  );
}

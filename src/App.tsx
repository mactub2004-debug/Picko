import { useState, useEffect } from 'react';
import { OnboardingScreen } from './components/screens/OnboardingScreen';
import { RegistrationScreen } from './components/screens/RegistrationScreen';
import { HomeScreen } from './components/screens/HomeScreen';
import { CameraScreen } from './components/screens/CameraScreen';
import { ScanResultScreen } from './components/screens/ScanResultScreen';
import { HistoryScreen } from './components/screens/HistoryScreen';
import { SearchScreen } from './components/screens/SearchScreen';
import { RecommendationsScreen } from './components/screens/RecommendationsScreen';
import { SettingsScreen } from './components/screens/SettingsScreen';
import { ProfileScreen } from './components/screens/ProfileScreen';
import { FavoritesScreen } from './components/screens/FavoritesScreen';
import { ProductComparisonScreen } from './components/screens/ProductComparisonScreen';
import { ShoppingListScreen } from './components/screens/ShoppingListScreen';
// StatsScreen removed - statistics now only shown in ProfileScreen
import { WelcomeScreen } from './components/screens/WelcomeScreen';
import { BottomNav } from './components/BottomNav';
import { Product } from './lib/demo-data';
import { StorageService } from './lib/storage';
import { LanguageProvider } from './contexts/LanguageContext';
import { validateIngredientsCoverage } from './utils/validate-ingredients';

type AppFlow = 'language' | 'onboarding' | 'registration' | 'main';
type MainScreen = 'home' | 'search' | 'history' | 'profile' | 'settings' | 'camera' | 'scan-result' | 'recommendations' | 'favorites' | 'comparison' | 'shopping-list' | 'stats';

interface NavigationState {
  screen: MainScreen;
  data?: {
    product?: Product;
    products?: Product[];
  };
}

function AppContent() {
  const [appFlow, setAppFlow] = useState<AppFlow>('language');
  const [navigation, setNavigation] = useState<NavigationState>({ screen: 'home' });
  const [navigationHistory, setNavigationHistory] = useState<NavigationState[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Validate ingredient coverage in development
    // @ts-ignore - import.meta.env is defined by Vite
    if (import.meta.env?.DEV) {
      const result = validateIngredientsCoverage();
      if (!result.isValid) {
        console.error('\u26a0\ufe0f DEMO AT RISK! Missing ingredients. Run window.validateIngredients() for details.');
      }
    }

    // Check for existing user profile on mount
    const profile = StorageService.getUserProfile();
    if (profile) {
      setAppFlow('main');
    } else {
      // Check if language is already selected (you might want to store this separately if needed, 
      // but for now we'll assume if no profile, we start at language selection)
      // Or we could add a specific check for "hasSeenOnboarding" or "languagePreference"
      setAppFlow('language');
    }
    setIsLoading(false);
  }, []);

  const handleNavigate = (screen: string, data?: any) => {
    // Save current state to history if navigating to detail screens
    if (screen === 'scan-result' || screen === 'camera' || screen === 'comparison') {
      setNavigationHistory([...navigationHistory, navigation]);
    }

    setNavigation({ screen: screen as MainScreen, data });
  };

  const handleBack = () => {
    if (navigationHistory.length > 0) {
      const previousState = navigationHistory[navigationHistory.length - 1];
      setNavigationHistory(navigationHistory.slice(0, -1));
      setNavigation(previousState);
    } else {
      setNavigation({ screen: 'home' });
    }
  };

  const handleLogout = () => {
    StorageService.clearAll();
    setAppFlow('language');
    setNavigation({ screen: 'home' });
    setNavigationHistory([]);
  };

  if (isLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>;
  }

  // Welcome Screen flow
  if (appFlow === 'language') {
    return (
      <WelcomeScreen
        onGetStarted={() => setAppFlow('onboarding')}
        onSignIn={() => setAppFlow('main')}
      />
    );
  }

  // Onboarding flow
  if (appFlow === 'onboarding') {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-md mx-auto">
          <OnboardingScreen onComplete={() => setAppFlow('registration')} />
        </div>
      </div>
    );
  }

  // Registration flow
  if (appFlow === 'registration') {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-md mx-auto">
          <RegistrationScreen onComplete={() => setAppFlow('main')} />
        </div>
      </div>
    );
  }

  // Main app screens
  const showBottomNav = !['camera', 'scan-result', 'settings', 'comparison'].includes(navigation.screen);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-md mx-auto relative">
        {/* Camera Screen (fullscreen overlay) */}
        {navigation.screen === 'camera' && (
          <div className="fixed inset-0 z-50 animate-in fade-in slide-in-from-bottom duration-500">
            <CameraScreen
              onNavigate={handleNavigate}
              onClose={handleBack}
              context={navigation.data}
            />
          </div>
        )}

        {/* Scan Result Screen */}
        {navigation.screen === 'scan-result' && navigation.data?.product && (
          <ScanResultScreen
            product={navigation.data.product}
            onNavigate={handleNavigate}
            onBack={handleBack}
          />
        )}

        {/* Product Comparison Screen */}
        {navigation.screen === 'comparison' && navigation.data?.products && (
          <div className="fixed inset-0 z-50 bg-background animate-in fade-in slide-in-from-bottom duration-300 overflow-y-auto">
            <ProductComparisonScreen
              products={navigation.data.products}
              onNavigate={handleNavigate}
              onBack={handleBack}
              onAddProduct={() => handleNavigate('camera', { returnTo: 'comparison', currentProducts: navigation.data?.products })}
            />
          </div>
        )}

        {/* Main screens with bottom navigation */}
        {navigation.screen !== 'camera' && navigation.screen !== 'scan-result' && (
          <>
            {navigation.screen === 'home' && (
              <div key="home-main" className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                <HomeScreen onNavigate={handleNavigate} />
              </div>
            )}

            {navigation.screen === 'search' && (
              <div key="search-main" className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                <SearchScreen onNavigate={handleNavigate} />
              </div>
            )}

            {navigation.screen === 'history' && (
              <div key="history-main" className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                <HistoryScreen onNavigate={handleNavigate} />
              </div>
            )}

            {navigation.screen === 'recommendations' && (
              <div key="recommendations-main" className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                <RecommendationsScreen onNavigate={handleNavigate} />
              </div>
            )}

            {navigation.screen === 'profile' && (
              <div key="profile-main" className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                <ProfileScreen
                  onNavigate={handleNavigate}
                  onLogout={handleLogout}
                />
              </div>
            )}

            {navigation.screen === 'favorites' && (
              <div key="favorites-main">
                <FavoritesScreen
                  onNavigate={handleNavigate}
                  onBack={() => handleNavigate('profile')}
                />
              </div>
            )}

            {navigation.screen === 'shopping-list' && (
              <div key="shopping-list-main" className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                <ShoppingListScreen
                  onNavigate={handleNavigate}
                />
              </div>
            )}

            {/* StatsScreen removed - statistics now only shown in ProfileScreen */}

            {navigation.screen === 'settings' && (
              <div key="settings-main">
                <SettingsScreen
                  onNavigate={handleNavigate}
                  onActivateDemoMode={() => { }} // Demo mode removed/hidden
                />
              </div>
            )}

            {showBottomNav && (
              <BottomNav
                activeScreen={navigation.screen}
                onNavigate={(screen) => handleNavigate(screen as MainScreen)}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}

import { ChevronRight, User, Globe, Languages, Shield, Bell, Heart, LogOut, History } from 'lucide-react';
import { useEffect, useState } from 'react';
import { demoUserProfile } from '../../lib/demo-data';
import { StorageService } from '../../lib/storage';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useLanguage } from '../../contexts/LanguageContext';
import { Badge } from '../ui/badge';

interface ProfileScreenProps {
  onNavigate: (screen: string, data?: any) => void;
  onLogout: () => void;
}

export function ProfileScreen({ onNavigate, onLogout }: ProfileScreenProps) {
  const { t, language } = useLanguage();
  const userProfile = StorageService.getUserProfile() || demoUserProfile;
  const [timeRange, setTimeRange] = useState<'week' | 'month'>('week');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const history = StorageService.getScanHistory();
  // Use all history for stats
  const scanCount = history.length;
  // Count PURCHASED products with high score (>= 70) as healthy choices
  const healthyChoicesCount = history.filter(item =>
    item.isPurchased && item.product.nutritionScore && item.product.nutritionScore >= 70
  ).length;
  const averageScore = scanCount > 0
    ? Math.round(history.reduce((acc, item) => acc + (item.product.nutritionScore || 0), 0) / scanCount)
    : 0;

  // Generate real score evolution data based on timeRange
  const generateScoreData = () => {
    const today = new Date();
    const data: { day: string; score: number | null }[] = [];

    if (timeRange === 'week') {
      // Last 7 days
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dayName = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][date.getDay()] as keyof typeof t.common.days;

        // Get PURCHASED scans from this day only
        const dayScans = history.filter(item => {
          const scanDate = new Date(item.scannedAt);
          return scanDate.toDateString() === date.toDateString() && item.isPurchased === true;
        });

        // Calculate average score for this day (only purchased products)
        let score = null;
        if (dayScans.length > 0) {
          score = Math.round(dayScans.reduce((acc, item) => acc + (item.product.nutritionScore || 0), 0) / dayScans.length);
        }

        data.push({
          day: t.common.days[dayName],
          score: score
        });
      }
    } else {
      // Last 30 days - Daily view
      for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        // Show day number and month for context
        const dayLabel = date.toLocaleDateString(language === 'ES' ? 'es-ES' : 'en-US', { day: 'numeric', month: 'short' });

        const dayScans = history.filter(item => {
          const scanDate = new Date(item.scannedAt);
          return scanDate.toDateString() === date.toDateString() && item.isPurchased === true;
        });

        let score = null;
        if (dayScans.length > 0) {
          score = Math.round(dayScans.reduce((acc, item) => acc + (item.product.nutritionScore || 0), 0) / dayScans.length);
        }

        data.push({
          day: dayLabel,
          score: score
        });
      }
    }

    return data;
  };

  const scoreData = generateScoreData();

  const menuItems = [
    {
      id: 'history',
      label: t.history.title,
      description: t.stats.scannedProducts,
      icon: History,
      color: 'text-[#3B82F6]',
      bg: 'bg-[#3B82F6]/10'
    },
    {
      id: 'favorites',
      label: t.favorites.title,
      description: t.home.viewAll,
      icon: Heart,
      color: 'text-[#EF4444]',
      bg: 'bg-[#EF4444]/10'
    },
    {
      id: 'settings',
      label: t.settings.app.title,
      description: t.profile.dietaryNeeds,
      icon: Shield,
      color: 'text-[#22C55E]',
      bg: 'bg-[#22C55E]/10'
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-24">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="bg-white px-6 pt-10 pb-8">
          <h1 className="mb-6">{t.profile.title}</h1>

          {/* User Info Card */}
          <div className="bg-gradient-to-br from-[#22C55E]/10 to-[#22C55E]/5 rounded-2xl p-5 border border-[#22C55E]/20">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-20 h-20 rounded-full bg-[#22C55E]/20 flex items-center justify-center border-2 border-[#22C55E]/30">
                <User className="w-10 h-10 text-[#22C55E]" />
              </div>
              <div className="flex-1">
                <h2>{userProfile.name}</h2>
                <p className="text-sm text-muted-foreground mt-1">{userProfile.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-[#22C55E]/20">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#22C55E]" />
                <div>
                  <p className="text-xs text-muted-foreground">{t.settings.profile.country}</p>
                  <p className="text-sm">{userProfile.country}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Languages className="w-4 h-4 text-[#22C55E]" />
                <div>
                  <p className="text-xs text-muted-foreground">{t.settings.profile.language}</p>
                  <p className="text-sm">{userProfile.language}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="px-6 py-6 space-y-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className="w-full bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow border border-gray-100 text-left"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 ${item.bg} rounded-2xl flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-6 h-6 ${item.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p>{item.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                </div>
              </button>
            );
          })}
        </div>

        {/* Stats Section */}
        <div className="px-6 pb-6">
          <h3 className="mb-4">{t.stats.title}</h3>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl mb-1">{scanCount}</p>
                <p className="text-xs text-muted-foreground">{t.stats.scannedProducts}</p>
              </div>
              <div>
                <p className="text-2xl mb-1">{averageScore}</p>
                <p className="text-xs text-muted-foreground">{t.stats.nutritionScore}</p>
              </div>
              <div>
                <p className="text-2xl mb-1">{healthyChoicesCount}</p>
                <p className="text-xs text-muted-foreground">{t.stats.healthyChoices}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Score Evolution Chart - Clickable */}
        <div className="px-6 pb-6">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h3 className="mb-4">{t.stats.nutritionScore}</h3>

            {/* Time Range Selector */}
            <div className="flex gap-2 mb-4">
              <Badge
                variant={timeRange === 'week' ? 'default' : 'outline'}
                className={`cursor-pointer px-3 py-1.5 rounded-lg transition-all text-xs ${timeRange === 'week'
                  ? 'bg-[#22C55E] text-white hover:bg-[#22C55E]/90'
                  : 'hover:border-[#22C55E]/50'
                  }`}
                onClick={() => setTimeRange('week')}
              >
                {t.common.week}
              </Badge>
              <Badge
                variant={timeRange === 'month' ? 'default' : 'outline'}
                className={`cursor-pointer px-3 py-1.5 rounded-lg transition-all text-xs ${timeRange === 'month'
                  ? 'bg-[#22C55E] text-white hover:bg-[#22C55E]/90'
                  : 'hover:border-[#22C55E]/50'
                  }`}
                onClick={() => setTimeRange('month')}
              >
                {t.common.month}
              </Badge>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={scoreData} margin={{ left: -10, right: 10, top: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="day"
                  stroke="#94a3b8"
                  style={{ fontSize: '10px' }}
                  interval={timeRange === 'month' ? 4 : 0}
                />
                <YAxis
                  stroke="#94a3b8"
                  style={{ fontSize: '11px' }}
                  domain={[0, 100]}
                  width={35}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    fontSize: '12px'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#22C55E"
                  strokeWidth={2.5}
                  dot={{ fill: '#22C55E', r: 3 }}
                  activeDot={{ r: 5 }}
                  connectNulls
                />
              </LineChart>
            </ResponsiveContainer>
            <p className="text-xs text-muted-foreground text-center mt-3">
              {timeRange === 'week' ? t.stats.weeklyOverview : `${t.common.month} - ${t.stats.trend}`}
            </p>
          </div>
        </div>

        {/* Logout Button */}
        <div className="px-6 pb-6">
          <button
            onClick={onLogout}
            className="w-full bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow border border-gray-100 text-left text-[#EF4444]"
          >
            <div className="flex items-center justify-center gap-2">
              <LogOut className="w-5 h-5" />
              <span>{t.profile.signOut}</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

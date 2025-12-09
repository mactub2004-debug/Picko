/**
 * RegistrationScreen - 8-Step Registration Flow
 * Includes Food + Cosmetic (Skin) profile setup
 * 
 * @version 2.0 Multi-Vertical
 */

import { useState } from 'react';
import {
  ChevronLeft, ChevronRight, ClipboardList,
  Milk, Egg, Fish, Shell, Nut, Wheat, Bean, Cookie,
  Leaf, Carrot, ShieldCheck, Droplet, Utensils, Flame, Zap,
  TrendingDown, TrendingUp, Weight, Activity, Sparkles, Heart, Apple, Stethoscope,
  Sun, Frown, Smile, Search
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import {
  countries,
  languages as supportedLanguages,
  skinTypes
} from '../../lib/demo-data';
import { useLanguage } from '../../contexts/LanguageContext';
import { StorageService } from '../../lib/storage';

interface RegistrationScreenProps {
  onComplete: () => void;
}

export function RegistrationScreen({ onComplete }: RegistrationScreenProps) {
  const { t, language, setLanguage } = useLanguage();
  const [step, setStep] = useState(1);
  const totalSteps = 8;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    country: '',
    language: language === 'ES' ? 'Español' : 'English',
    allergies: [] as string[],
    preferences: [] as string[],
    goals: [] as string[],
    skinType: '' as string,
    skinConcerns: [] as string[]
  });

  const toggleSelection = (category: 'allergies' | 'preferences' | 'goals' | 'skinConcerns', item: string) => {
    setFormData(prev => ({
      ...prev,
      [category]: prev[category].includes(item)
        ? prev[category].filter(i => i !== item)
        : [...prev[category], item]
    }));
  };

  const handleLanguageChange = (val: string) => {
    setFormData({ ...formData, language: val });
    setLanguage(val === 'English' ? 'EN' : 'ES');
  };

  const canProceed = () => {
    if (step === 1) return formData.name && formData.email && formData.country;
    if (step === 6) return !!formData.skinType; // Skin Type obligatorio
    return true;
  };

  const handleComplete = () => {
    const finalProfile = {
      name: formData.name,
      email: formData.email,
      country: formData.country,
      language: formData.language === 'English' ? 'EN' : 'ES',
      allergies: formData.allergies,
      preferences: formData.preferences,
      goals: formData.goals,
      skin: {
        type: formData.skinType as any,
        concerns: formData.skinConcerns,
        avoid: []
      }
    };

    StorageService.saveUserProfile(finalProfile as any);
    onComplete();
  };

  // --- ICON MAPPINGS (supports both ES and EN labels) ---
  const getIcon = (name: string) => {
    const icons: Record<string, any> = {
      // Allergens EN
      'Gluten': Wheat, 'Milk': Milk, 'Dairy': Milk, 'Eggs': Egg, 'Fish': Fish, 'Shellfish': Shell,
      'Crustaceans': Shell, 'Tree Nuts': Nut, 'Nuts': Nut, 'Peanuts': Nut, 'Wheat': Wheat,
      'Soy': Bean, 'Sesame': Cookie,
      // Allergens ES
      'Leche': Milk, 'Lácteos': Milk, 'Huevos': Egg, 'Pescado': Fish, 'Crustáceos': Shell,
      'Nueces': Nut, 'Maní': Nut, 'Trigo': Wheat, 'Soja': Bean, 'Sésamo': Cookie,
      // Preferences EN
      'Vegan': Leaf, 'Vegetarian': Carrot, 'Gluten Free': ShieldCheck, 'Gluten-free': ShieldCheck,
      'Dairy Free': Droplet, 'Dairy-free': Droplet, 'Organic': Leaf,
      'Low Sugar': Apple, 'Low sugar': Apple, 'Low Sodium': Droplet, 'Low sodium': Droplet,
      'High Protein': Flame, 'High protein': Flame, 'Keto': Zap, 'Keto-friendly': Zap, 'Paleo': Utensils,
      // Preferences ES
      'Vegano': Leaf, 'Vegetariano': Carrot, 'Sin gluten': ShieldCheck, 'Sin lácteos': Droplet,
      'Orgánico': Leaf, 'Bajo en azúcar': Apple, 'Bajo en sodio': Droplet, 'Alto en proteína': Flame,
      // Goals EN
      'Lose Weight': TrendingDown, 'Lose weight': TrendingDown, 'Build Muscle': TrendingUp, 'Gain muscle': TrendingUp,
      'Maintain Weight': Weight, 'Maintain weight': Weight, 'Improve Energy': Zap, 'Improve energy': Zap,
      'Better Digestion': Activity, 'Better digestion': Activity, 'Heart Health': Heart, 'Heart health': Heart,
      'Manage Diabetes': Stethoscope, 'Manage diabetes': Stethoscope, 'Reduce Cholesterol': Sparkles, 'Reduce cholesterol': Sparkles,
      // Goals ES  
      'Perder peso': TrendingDown, 'Ganar músculo': TrendingUp, 'Mantener peso': Weight,
      'Mejorar energía': Zap, 'Mejor digestión': Activity, 'Salud del corazón': Heart,
      'Controlar diabetes': Stethoscope, 'Reducir colesterol': Sparkles,
      // Skin Types
      'Dry': Sun, 'Oily': Droplet, 'Combination': Activity, 'Normal': Smile, 'Sensitive': ShieldCheck,
      // Skin Concerns EN
      'Acne': Frown, 'Aging': Activity, 'Dark Spots': Sun, 'Pores': Search,
      'Sensitivity': ShieldCheck, 'Dryness': Sun, 'Oiliness': Droplet, 'Redness': Flame,
      // Skin Concerns ES
      'Acné': Frown, 'Envejecimiento': Activity, 'Manchas': Sun, 'Poros': Search,
      'Sensibilidad': ShieldCheck, 'Sequedad': Sun, 'Grasa excesiva': Droplet, 'Rojeces': Flame
    };
    return icons[name] || Sparkles;
  };

  // Helper to get skin type label from value
  const getSkinTypeLabel = (value: string) => {
    // @ts-ignore - Dynamic access
    return t.registration?.step6?.options?.[value] || value;
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 pt-10 pb-6">
        <div className="max-w-md mx-auto flex items-center gap-3">
          {step > 1 && (
            <button onClick={() => setStep(step - 1)} className="p-2 hover:bg-gray-100 rounded-full -ml-2 transition-colors">
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}
          <div className="flex-1">
            <h1 className="text-xl font-bold">{t.registration.header.title}</h1>
            <p className="text-sm text-muted-foreground">{t.registration.header.step} {step} / {totalSteps}</p>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-md mx-auto h-1.5 bg-gray-100">
          <motion.div
            className="h-full bg-[#22C55E]"
            initial={{ width: 0 }}
            animate={{ width: `${(step / totalSteps) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="max-w-md mx-auto px-6 py-4 flex-1 flex flex-col w-full">

          {/* STEP 1: BASIC INFO */}
          {step === 1 && (
            <motion.div
              className="space-y-5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div>
                <h2 className="text-2xl font-bold mb-2">{t.registration.step1.title}</h2>
                <p className="text-sm text-muted-foreground">{t.registration.step1.subtitle}</p>
              </div>
              <div className="space-y-4">
                <Input
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="bg-white h-12 rounded-xl"
                  placeholder={t.registration.step1.namePlaceholder}
                />
                <Input
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="bg-white h-12 rounded-xl"
                  placeholder={t.registration.step1.emailPlaceholder}
                  type="email"
                />
                <Select value={formData.country} onValueChange={(v: string) => setFormData({ ...formData, country: v })}>
                  <SelectTrigger className="bg-white h-12 rounded-xl">
                    <SelectValue placeholder={t.registration.step1.countryPlaceholder} />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={formData.language} onValueChange={handleLanguageChange}>
                  <SelectTrigger className="bg-white h-12 rounded-xl">
                    <SelectValue placeholder={t.registration.step1.languagePlaceholder} />
                  </SelectTrigger>
                  <SelectContent>
                    {supportedLanguages.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </motion.div>
          )}

          {/* STEP 2: TRANSITION */}
          {step === 2 && (
            <motion.div
              className="space-y-6 flex flex-col items-center justify-center min-h-[50vh]"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="relative w-40 h-40 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-[#22C55E]/20 animate-pulse" style={{ animationDuration: '2s' }} />
                <div className="absolute inset-4 rounded-full bg-[#22C55E]/30 animate-pulse" style={{ animationDuration: '2.5s', animationDelay: '0.3s' }} />
                <ClipboardList className="w-16 h-16 text-[#22C55E]" strokeWidth={2} />
              </div>
              <h2 className="text-center px-4 text-xl font-semibold">{t.registration.step2.title}</h2>
            </motion.div>
          )}

          {/* STEP 3: ALLERGIES */}
          {step === 3 && (
            <SelectionStep
              title={t.registration.step3.title}
              subtitle={t.registration.step3.subtitle}
              items={t.lists.allergens}
              selected={formData.allergies}
              onToggle={(i: string) => toggleSelection('allergies', i)}
              color="#EF4444"
              getIcon={getIcon}
            />
          )}

          {/* STEP 4: DIETARY PREFERENCES */}
          {step === 4 && (
            <SelectionStep
              title={t.registration.step4.title}
              subtitle={t.registration.step4.subtitle}
              items={t.lists.dietaryPreferences}
              selected={formData.preferences}
              onToggle={(i: string) => toggleSelection('preferences', i)}
              color="#22C55E"
              getIcon={getIcon}
            />
          )}

          {/* STEP 5: HEALTH GOALS */}
          {step === 5 && (
            <SelectionStep
              title={t.registration.step5.title}
              subtitle={t.registration.step5.subtitle}
              items={t.lists.healthGoals}
              selected={formData.goals}
              onToggle={(i: string) => toggleSelection('goals', i)}
              color="#3B82F6"
              getIcon={getIcon}
            />
          )}

          {/* STEP 6: SKIN TYPE */}
          {step === 6 && (
            <motion.div
              className="space-y-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div>
                <h2 className="text-xl font-bold">{t.registration.step6.title}</h2>
                <p className="text-sm text-muted-foreground">{t.registration.step6.subtitle}</p>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {skinTypes.map((type, i) => {
                  const typeValue = typeof type === 'string' ? type : type.value;
                  const Icon = getIcon(typeValue);
                  const isSelected = formData.skinType === typeValue;
                  return (
                    <motion.button
                      key={typeValue}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => setFormData({ ...formData, skinType: typeValue })}
                      className={`p-3 rounded-xl border-2 flex items-center gap-3 transition-all ${isSelected
                        ? 'bg-[#9333EA] border-[#9333EA] text-white shadow-md'
                        : 'bg-white border-gray-200 hover:border-[#9333EA]/50'
                        }`}
                    >
                      <div className={`p-1.5 rounded-full ${isSelected ? 'bg-white/20' : 'bg-[#9333EA]/10'}`}>
                        <Icon className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-[#9333EA]'}`} />
                      </div>
                      <span className="font-medium text-sm">{getSkinTypeLabel(typeValue)}</span>
                      {isSelected && (
                        <div className="ml-auto bg-white rounded-full p-0.5">
                          <div className="w-2 h-2 bg-[#9333EA] rounded-full" />
                        </div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* STEP 7: SKIN CONCERNS */}
          {step === 7 && (
            <SelectionStep
              title={t.registration.step7.title}
              subtitle={t.registration.step7.subtitle}
              items={t.lists.skinConcerns}
              selected={formData.skinConcerns}
              onToggle={(i: string) => toggleSelection('skinConcerns', i)}
              color="#F97316"
              getIcon={getIcon}
            />
          )}

          {/* STEP 8: REVIEW */}
          {step === 8 && (
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">{t.registration.step8.title}</h2>
                <p className="text-muted-foreground">{t.registration.step8.subtitle}</p>
              </div>
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
                <SummaryRow
                  label={t.registration.step8.labels.name}
                  value={formData.name}
                />
                <SummaryRow
                  label={t.registration.step8.labels.food}
                  value={`${formData.allergies.length + formData.preferences.length} ${t.registration.step8.labels.filters}`}
                />
                <SummaryRow
                  label={t.registration.step8.labels.skin}
                  value={`${getSkinTypeLabel(formData.skinType) || '-'} + ${formData.skinConcerns.length} ${t.registration.step8.labels.goals}`}
                />
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 p-6 pb-8">
        <div className="max-w-md mx-auto">
          <Button
            onClick={step < totalSteps ? () => setStep(step + 1) : handleComplete}
            disabled={!canProceed()}
            className="w-full h-14 bg-[#22C55E] text-white hover:bg-[#22C55E]/90 rounded-2xl shadow-md text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {step < totalSteps ? (t.registration.continue || 'Continue') : (t.registration.finish || 'Finish')}
            {step < totalSteps && <ChevronRight className="w-5 h-5 ml-2" />}
          </Button>
        </div>
      </div>
    </div>
  );
}

// === HELPER COMPONENTS ===

interface SelectionStepProps {
  title: string;
  subtitle: string;
  items: string[];
  selected: string[];
  onToggle: (item: string) => void;
  color: string;
  getIcon: (name: string) => any;
}

function SelectionStep({ title, subtitle, items, selected, onToggle, color, getIcon }: SelectionStepProps) {
  // Calculate rows needed (2 columns, so items/2 rounded up)
  const rows = Math.ceil(items.length / 2);

  return (
    <motion.div
      className="flex-1 flex flex-col gap-3"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex-shrink-0">
        <h2 className="text-xl font-bold">{title}</h2>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
      <div
        className="flex-1 grid grid-cols-2 gap-2"
        style={{ gridTemplateRows: `repeat(${rows}, 1fr)` }}
      >
        {items.map((item, index) => {
          const Icon = getIcon(item);
          const isSelected = selected.includes(item);
          return (
            <motion.button
              key={item}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.02 }}
              onClick={() => onToggle(item)}
              className="relative p-2 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-2 min-h-[60px]"
              style={{
                backgroundColor: isSelected ? color : 'white',
                borderColor: isSelected ? color : '#e5e7eb',
                color: isSelected ? 'white' : undefined
              }}
            >
              <Icon
                className="w-7 h-7"
                style={{ color: isSelected ? 'white' : color }}
              />
              <span className="text-xs font-medium text-center leading-tight">{item}</span>
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-1 right-1 w-1.5 h-1.5 bg-white rounded-full"
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0">
      <span className="text-gray-500 text-sm">{label}</span>
      <span className="font-semibold text-gray-900">{value}</span>
    </div>
  );
}

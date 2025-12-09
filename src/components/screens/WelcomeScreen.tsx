import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { Language } from '../../lib/translations';
import pickoLogo from '../../assets/picko-logo.png';

interface WelcomeScreenProps {
    onGetStarted: () => void;
    onSignIn: () => void;
}

const languages: Record<Language, { label: string; flag: string }> = {
    ES: { label: 'Español', flag: '🇪🇸' },
    EN: { label: 'English', flag: '🇺🇸' }
};

export function WelcomeScreen({ onGetStarted, onSignIn }: WelcomeScreenProps) {
    const { language, setLanguage, t } = useLanguage();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gray-50 text-gray-800 h-full flex flex-col relative overflow-hidden font-sans">

            {/* Language Selector: Top Right - Pill Style */}
            <div className="absolute top-6 right-6 z-50">
                <div className="relative">
                    <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="flex items-center space-x-1 bg-white border border-gray-200 rounded-full px-3 py-1.5 shadow-sm text-sm font-medium text-gray-600 active:bg-gray-50 transition-colors"
                    >
                        <span>{language}</span>
                        <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                        {isDropdownOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                                transition={{ duration: 0.1 }}
                                className="absolute right-0 mt-2 w-36 bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden z-50 origin-top-right"
                            >
                                {(Object.keys(languages) as Language[]).map((lang) => (
                                    <button
                                        key={lang}
                                        onClick={() => {
                                            setLanguage(lang);
                                            setIsDropdownOpen(false);
                                        }}
                                        className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors flex items-center gap-3 ${language === lang ? 'text-[#28C567] font-medium bg-green-50/30' : 'text-gray-600'
                                            }`}
                                    >
                                        <span className="text-base">{languages[lang].flag}</span>
                                        {languages[lang].label}
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Main Content: Aligned to bottom with balanced spacing */}
            <main className="flex-grow flex flex-col items-center justify-end px-6 pb-24 w-full max-w-md mx-auto">

                {/* Logo Group & Brand */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="flex flex-col items-center mb-10"
                >
                    {/* Picko Logo - Slightly smaller for better balance */}
                    <div className="w-28 h-28 mb-5 flex items-center justify-center">
                        <img
                            src={pickoLogo}
                            alt="Picko Logo"
                            className="w-full h-full object-contain drop-shadow-lg"
                        />
                    </div>

                    {/* Brand Name */}
                    <h1 className="text-5xl font-bold tracking-tight text-[#28C567]">
                        Picko
                    </h1>
                </motion.div>

                {/* Text Content - Increased spacing for symmetry */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                    className="text-center space-y-3 mb-12"
                >
                    <h2 className="text-2xl font-semibold text-gray-900">
                        {t.welcome.title}
                    </h2>
                    <p className="text-gray-500 text-base max-w-[280px] mx-auto leading-relaxed">
                        {t.welcome.subtitle}
                    </p>
                </motion.div>

                {/* Action Area - Centered button with consistent width */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    className="w-full flex justify-center"
                >
                    <button
                        onClick={onGetStarted}
                        className="w-full max-w-[300px] bg-[#28C567] hover:bg-[#23ad5a] active:scale-[0.98] transition-all text-white font-bold py-4 rounded-xl shadow-lg shadow-green-200 text-lg"
                    >
                        {t.welcome.getStarted}
                    </button>
                </motion.div>

            </main>

            {/* Footer / Sign In link */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="pb-8 w-full text-center"
            >
                <p className="text-sm text-gray-500 font-medium">
                    {t.welcome.alreadyHaveAccount}
                    <button
                        onClick={onSignIn}
                        className="text-[#28C567] hover:text-[#228B49] font-bold ml-1 outline-none focus:underline"
                    >
                        {t.welcome.signIn}
                    </button>
                </p>
                {/* Home indicator spacing for iOS aesthetics */}
                <div className="h-1 w-32 bg-gray-200 rounded mx-auto mt-6 opacity-50"></div>
            </motion.div>

        </div>
    );
}
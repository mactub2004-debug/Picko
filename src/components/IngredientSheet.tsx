/**
 * IngredientSheet - Ficha técnica de ingrediente
 * Diseño optimizado para mobile, simétrico y premium
 */

import React from 'react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from './ui/sheet';
import { IngredientLookupResult } from '../services/ingredient.service';
import { getRiskLevel, getRiskColor, RiskLevel } from '../lib/types';
import { useLanguage } from '../contexts/LanguageContext';
import { X, ChevronDown, AlertTriangle, CheckCircle2, XCircle, HelpCircle, Leaf, FlaskConical, Dna } from 'lucide-react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    result: IngredientLookupResult | null;
}

export function IngredientSheet({ isOpen, onClose, result }: Props) {
    const { language } = useLanguage();

    if (!result) return null;

    // === FALLBACK UI: Ingrediente no encontrado ===
    if (!result.found || !result.ingredient) {
        return (
            <Sheet open={isOpen} onOpenChange={onClose}>
                <SheetContent side="bottom" className="ingredient-sheet">
                    <SheetHeader className="sr-only">
                        <SheetTitle>{result.fallback?.name}</SheetTitle>
                        <SheetDescription>Ingredient details</SheetDescription>
                    </SheetHeader>

                    {/* Handle bar */}
                    <div className="ingredient-sheet__handle" />

                    <div className="ingredient-sheet__unknown">
                        <div className="ingredient-sheet__unknown-icon">
                            <HelpCircle size={32} />
                        </div>
                        <h3 className="ingredient-sheet__unknown-name">{result.fallback?.name}</h3>
                        <p className="ingredient-sheet__unknown-message">{result.fallback?.message}</p>
                        <span className="ingredient-sheet__unknown-note">
                            {language === 'ES'
                                ? 'Procede con precaución'
                                : 'Proceed with caution'}
                        </span>
                    </div>
                </SheetContent>
            </Sheet>
        );
    }

    const { ingredient } = result;
    const riskLevel = getRiskLevel(ingredient.safetyScore);

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent side="bottom" className="ingredient-sheet">
                <SheetHeader className="sr-only">
                    <SheetTitle>{ingredient.name}</SheetTitle>
                    <SheetDescription>Ingredient technical sheet</SheetDescription>
                </SheetHeader>

                {/* Handle bar */}
                <div className="ingredient-sheet__handle" />

                {/* Header con Score centrado */}
                <div className="ingredient-sheet__hero">
                    <ScoreCircle score={ingredient.safetyScore} riskLevel={riskLevel} />
                    <h2 className="ingredient-sheet__name">{ingredient.name}</h2>
                    <div className="ingredient-sheet__origin">
                        <OriginIcon origin={ingredient.origin} />
                        <span>{getOriginLabel(ingredient.origin, language)}</span>
                    </div>
                </div>

                {/* Categorías funcionales */}
                <div className="ingredient-sheet__tags">
                    {ingredient.functionCategories.slice(0, 3).map(cat => (
                        <span key={cat} className="ingredient-sheet__tag">{cat}</span>
                    ))}
                </div>

                {/* Compatibilidad prominente */}
                <CompatibilityCard
                    compatibility={ingredient.compatibility}
                    language={language}
                />

                {/* Descripción */}
                <div className="ingredient-sheet__section">
                    <p className="ingredient-sheet__description">
                        {ingredient.description[language.toLowerCase() as 'es' | 'en']}
                    </p>
                </div>

                {/* Datos regulatorios colapsable */}
                <details className="ingredient-sheet__details">
                    <summary className="ingredient-sheet__summary">
                        <span>{language === 'ES' ? 'Información Regulatoria' : 'Regulatory Info'}</span>
                        <ChevronDown size={16} className="ingredient-sheet__chevron" />
                    </summary>
                    <div className="ingredient-sheet__regulations">
                        {ingredient.regulations.map(({ region, info }) => (
                            <div key={region} className="ingredient-sheet__reg-row">
                                <span className="ingredient-sheet__reg-flag">{getRegionFlag(region)}</span>
                                <span className="ingredient-sheet__reg-name">{region}</span>
                                <span className={`ingredient-sheet__reg-status ingredient-sheet__reg-status--${info.status}`}>
                                    {getStatusLabel(info.status, language)}
                                </span>
                            </div>
                        ))}
                    </div>
                </details>

                {/* Footer con fuente */}
                <div className="ingredient-sheet__footer">
                    <span className="ingredient-sheet__source">
                        📚 {ingredient.sourceReference}
                    </span>
                    <span className="ingredient-sheet__date">
                        {ingredient.lastVerified}
                    </span>
                </div>
            </SheetContent>
        </Sheet>
    );
}

// ============================================
// SUB-COMPONENTS
// ============================================

function ScoreCircle({ score, riskLevel }: { score: number | null; riskLevel: RiskLevel }) {
    const isUnknown = score === null;
    const displayScore = isUnknown ? '?' : score;
    const circumference = 2 * Math.PI * 45;
    const progress = isUnknown ? 0 : ((score || 0) / 100) * circumference;

    return (
        <div className="score-circle">
            <svg className="score-circle__svg" viewBox="0 0 100 100">
                {/* Background circle */}
                <circle
                    className="score-circle__bg"
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    strokeWidth="8"
                />
                {/* Progress circle */}
                {!isUnknown && (
                    <circle
                        className="score-circle__progress"
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        strokeWidth="8"
                        strokeLinecap="round"
                        style={{
                            stroke: getRiskColor(riskLevel),
                            strokeDasharray: `${progress} ${circumference}`,
                            transform: 'rotate(-90deg)',
                            transformOrigin: '50% 50%'
                        }}
                    />
                )}
            </svg>
            <div className="score-circle__content">
                <span
                    className="score-circle__value"
                    style={{ color: isUnknown ? 'var(--muted-foreground)' : getRiskColor(riskLevel) }}
                >
                    {displayScore}
                </span>
                <span className="score-circle__label">
                    {getRiskLabel(riskLevel)}
                </span>
            </div>
        </div>
    );
}

function OriginIcon({ origin }: { origin: string }) {
    const icons: Record<string, React.ReactNode> = {
        synthetic: <FlaskConical size={14} />,
        natural: <Leaf size={14} />,
        animal: <span>🐄</span>,
        mineral: <span>�ite</span>,
        mixed: <Dna size={14} />,
    };
    return <span className="origin-icon">{icons[origin] || <HelpCircle size={14} />}</span>;
}

interface CompatibilityCardProps {
    compatibility: {
        warningLevel: 'safe' | 'caution' | 'avoid' | 'unknown';
        warningMessage: string | null;
    };
    language: 'ES' | 'EN';
}

function CompatibilityCard({ compatibility, language }: CompatibilityCardProps) {
    const { warningLevel, warningMessage } = compatibility;

    const config: Record<string, {
        icon: React.ReactNode;
        class: string;
        title: Record<string, string>;
        subtitle: Record<string, string>;
    }> = {
        safe: {
            icon: <CheckCircle2 size={24} />,
            class: 'safe',
            title: { ES: 'Compatible contigo', EN: 'Compatible with you' },
            subtitle: { ES: 'Sin problemas detectados', EN: 'No issues detected' }
        },
        caution: {
            icon: <AlertTriangle size={24} />,
            class: 'caution',
            title: { ES: 'Usar con precaución', EN: 'Use with caution' },
            subtitle: { ES: 'Revisa las notas', EN: 'Check the notes' }
        },
        avoid: {
            icon: <XCircle size={24} />,
            class: 'avoid',
            title: { ES: 'Evitar', EN: 'Avoid' },
            subtitle: { ES: 'No recomendado para ti', EN: 'Not recommended for you' }
        },
        unknown: {
            icon: <HelpCircle size={24} />,
            class: 'unknown',
            title: { ES: 'Sin datos de compatibilidad', EN: 'No compatibility data' },
            subtitle: { ES: 'No podemos evaluarlo', EN: 'Unable to evaluate' }
        },
    };

    const current = config[warningLevel] || config.unknown;

    return (
        <div className={`compatibility-card compatibility-card--${current.class}`}>
            <div className="compatibility-card__icon">{current.icon}</div>
            <div className="compatibility-card__text">
                <strong className="compatibility-card__title">{current.title[language]}</strong>
                <span className="compatibility-card__subtitle">
                    {warningMessage || current.subtitle[language]}
                </span>
            </div>
        </div>
    );
}

// ============================================
// HELPERS
// ============================================

function getRiskLabel(riskLevel: RiskLevel): string {
    const labels: Record<RiskLevel, string> = {
        safe: '✓',
        low: '✓',
        moderate: '!',
        high: '✗',
        unknown: '?',
    };
    return labels[riskLevel];
}

function getOriginLabel(origin: string, language: 'ES' | 'EN'): string {
    const labels: Record<string, Record<string, string>> = {
        synthetic: { ES: 'Sintético', EN: 'Synthetic' },
        natural: { ES: 'Natural', EN: 'Natural' },
        animal: { ES: 'Animal', EN: 'Animal' },
        mineral: { ES: 'Mineral', EN: 'Mineral' },
        mixed: { ES: 'Mixto', EN: 'Mixed' },
        unknown: { ES: 'Desconocido', EN: 'Unknown' },
    };
    return labels[origin]?.[language] || origin;
}

function getRegionFlag(region: string): string {
    const flags: Record<string, string> = { EU: '🇪🇺', USA: '🇺🇸', LATAM: '🌎' };
    return flags[region] || '🌐';
}

function getStatusLabel(status: string, language: 'ES' | 'EN'): string {
    const labels: Record<string, Record<string, string>> = {
        permitted: { ES: 'Permitido', EN: 'Permitted' },
        restricted: { ES: 'Restringido', EN: 'Restricted' },
        banned: { ES: 'Prohibido', EN: 'Banned' },
        unknown: { ES: 'Sin datos', EN: 'Unknown' },
    };
    return labels[status]?.[language] || status;
}

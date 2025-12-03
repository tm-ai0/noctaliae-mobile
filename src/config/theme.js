// Noctaliae Theme Configuration - Multi-Theme System
// Version: 3.1.0 - 3 Free + 3 Premium themes
// Updated: 2025-11-08

// ============================================
// 🎨 THEME VARIANTS (6 total: 3 free + 3 premium)
// ============================================

// Palette de base commune
const baseColors = {
  background: '#0c0e27',
  backgroundDeep: '#08091c',
  backgroundElevated: '#0f1130',
  
  // 💚 PRIMARY - Noctaliæ Neon Green
  primary: '#00FFB0',
  primaryDark: '#00D994',
  primaryLight: '#33FFBD',
  primaryGlow: 'rgba(0, 255, 176, 0.15)',
  primaryStrong: 'rgba(0, 255, 176, 0.25)',
  
  // 🌿 ORGANIC GREEN - Pour soutien/Ko-fi
  organicGreen: '#39FF88',
  organicGreenDark: '#12D66A',
  organicGreenLight: '#7AFFB5',
  organicGreenSubtle: 'rgba(57, 255, 136, 0.15)',
  
  // 🧊 ACCENTS PREMIUM
  arcticCyan: '#3CF0FF',
  arcticCyanSubtle: 'rgba(60, 240, 255, 0.12)',
  electricBlue: '#4F8DFF',
  electricBlueSubtle: 'rgba(79, 141, 255, 0.12)',
  ultraviolet: '#6B5CFF',
  ultravioletSubtle: 'rgba(107, 92, 255, 0.12)',
  cyberMagenta: '#FF3FD1',
  cyberMagentaSubtle: 'rgba(255, 63, 209, 0.12)',
  chrome: '#DDE2EA',
  chromeSubtle: 'rgba(221, 226, 234, 0.12)',
  
  text: '#FFFFFF',
  textPrimary: '#FFFFFF',
  textSecondary: '#A0B4D4',
  textTertiary: '#7B8DAA',
  textMuted: '#5A6B89',
  
  // 🎨 COULEURS OBLIGATOIRES NOCTALIÆ
  coolGrayGreen: '#A0B4D4',
  coolGrayGreenSubtle: 'rgba(160, 180, 212, 0.12)',
  scientificBlueGreen: '#A0B4D4',
  scientificBlueGreenSubtle: 'rgba(160, 180, 212, 0.12)',
  
  success: '#00FFB0',
  successSubtle: 'rgba(0, 255, 176, 0.12)',
  info: '#3CF0FF',
  infoSubtle: 'rgba(60, 240, 255, 0.12)',
  error: '#FF4D6D',
  errorSubtle: 'rgba(255, 77, 109, 0.12)',
  warning: '#FFC85A',
  warningSubtle: 'rgba(255, 200, 90, 0.12)',
  
  overlay: 'rgba(8, 9, 28, 0.95)',
  overlayStrong: 'rgba(8, 9, 28, 0.98)',
  
  divider: 'rgba(160, 180, 212, 0.08)',
  dividerStrong: 'rgba(160, 180, 212, 0.15)',
};

// ============================================
// 🆓 FREE THEMES (3)
// ============================================

// 📦 THEME 1: ORIGINAL (Couleurs obligatoires)
const ORIGINAL_THEME = {
  name: 'Original',
  id: 'original',
  isPremium: false,
  colors: {
    ...baseColors,
    cardBackground: '#151842', // Augmenté pour meilleur contraste (était #0f1130)
    cardBackgroundHover: '#1a1d4f',
    cardBorder: 'rgba(160, 180, 212, 0.15)', // Augmenté de 0.08 à 0.15
    
    warmGold: '#D2B14C',
    warmGoldDark: '#B89A3E',
    warmGoldSubtle: 'rgba(210, 177, 76, 0.12)',
    warmBrown: '#88735C', // ✅ COULEUR OBLIGATOIRE
    warmBrownSubtle: 'rgba(136, 115, 92, 0.12)',
    
    deepAnalysis: '#8A2BE2',
    deepAnalysisSubtle: 'rgba(138, 43, 226, 0.15)',
    lightAnalysis: '#D2B14C',
    lightAnalysisSubtle: 'rgba(210, 177, 76, 0.15)',
    
    warning: '#D2B14C',
    warningSubtle: 'rgba(210, 177, 76, 0.12)',
  },
};

// 🌅 THEME 2: WARM GOLD (Or chaleureux)
const WARM_GOLD_THEME = {
  name: 'Warm Gold',
  id: 'warm-gold',
  isPremium: false,
  colors: {
    ...baseColors,
    cardBackground: 'rgba(210, 177, 76, 0.08)',
    cardBackgroundHover: 'rgba(210, 177, 76, 0.12)',
    cardBorder: 'rgba(210, 177, 76, 0.15)',
    
    warmGold: '#D2B14C',
    warmGoldDark: '#B89A3E',
    warmGoldSubtle: 'rgba(210, 177, 76, 0.12)',
    warmBrown: '#88735C',
    warmBrownSubtle: 'rgba(136, 115, 92, 0.12)',
    
    deepAnalysis: '#D2B14C',
    deepAnalysisSubtle: 'rgba(210, 177, 76, 0.15)',
    lightAnalysis: '#E6C86E',
    lightAnalysisSubtle: 'rgba(230, 200, 110, 0.15)',
    
    warning: '#D2B14C',
    warningSubtle: 'rgba(210, 177, 76, 0.12)',
  },
};

// 🍂 THEME 3: EARTHY BROWN (Brun terreux)
const EARTHY_BROWN_THEME = {
  name: 'Earthy Brown',
  id: 'earthy-brown',
  isPremium: false,
  colors: {
    ...baseColors,
    cardBackground: 'rgba(136, 115, 92, 0.08)',
    cardBackgroundHover: 'rgba(136, 115, 92, 0.12)',
    cardBorder: 'rgba(136, 115, 92, 0.15)',
    
    warmGold: '#D2B14C',
    warmGoldDark: '#B89A3E',
    warmGoldSubtle: 'rgba(210, 177, 76, 0.12)',
    warmBrown: '#88735C',
    warmBrownSubtle: 'rgba(136, 115, 92, 0.12)',
    
    deepAnalysis: '#88735C',
    deepAnalysisSubtle: 'rgba(136, 115, 92, 0.15)',
    lightAnalysis: '#A69179',
    lightAnalysisSubtle: 'rgba(166, 145, 121, 0.15)',
    
    warning: '#D2B14C',
    warningSubtle: 'rgba(210, 177, 76, 0.12)',
  },
};

// ============================================
// 💎 PREMIUM THEMES (3)
// ============================================

// ⚡ THEME 4: NEON GREEN (Vert néon intense) - PREMIUM
const NEON_GREEN_THEME = {
  name: 'Neon Green',
  id: 'neon-green',
  isPremium: true,
  colors: {
    ...baseColors,
    cardBackground: 'rgba(0, 255, 176, 0.05)',
    cardBackgroundHover: 'rgba(0, 255, 176, 0.08)',
    cardBorder: 'rgba(0, 255, 176, 0.15)',
    
    warmGold: '#00FFB0',
    warmGoldDark: '#00D994',
    warmGoldSubtle: 'rgba(0, 255, 176, 0.12)',
    warmBrown: '#00D994',
    warmBrownSubtle: 'rgba(0, 217, 148, 0.12)',
    
    deepAnalysis: '#00FFB0',
    deepAnalysisSubtle: 'rgba(0, 255, 176, 0.15)',
    lightAnalysis: '#33FFBD',
    lightAnalysisSubtle: 'rgba(51, 255, 189, 0.15)',
    
    warning: '#00FFB0',
    warningSubtle: 'rgba(0, 255, 176, 0.12)',
  },
};

// 🌊 THEME 5: DEEP OCEAN (Océan profond) - PREMIUM
const DEEP_OCEAN_THEME = {
  name: 'Deep Ocean',
  id: 'deep-ocean',
  isPremium: true,
  colors: {
    ...baseColors,
    cardBackground: '#0C2552',
    cardBackgroundHover: '#0F2E66',
    cardBorder: 'rgba(74, 109, 197, 0.15)',
    
    warmGold: '#4A6DC5',
    warmGoldDark: '#3D5BA8',
    warmGoldSubtle: 'rgba(74, 109, 197, 0.12)',
    warmBrown: '#5B7FE0',
    warmBrownSubtle: 'rgba(91, 127, 224, 0.12)',
    
    deepAnalysis: '#4A6DC5',
    deepAnalysisSubtle: 'rgba(74, 109, 197, 0.15)',
    lightAnalysis: '#5B7FE0',
    lightAnalysisSubtle: 'rgba(91, 127, 224, 0.15)',
    
    warning: '#D2B14C',
    warningSubtle: 'rgba(210, 177, 76, 0.12)',
  },
};

// 🌸 THEME 6: SOFT PINK (Rose doux) - PREMIUM
const SOFT_PINK_THEME = {
  name: 'Soft Pink',
  id: 'soft-pink',
  isPremium: true,
  colors: {
    ...baseColors,
    cardBackground: 'rgba(255, 182, 193, 0.05)',
    cardBackgroundHover: 'rgba(255, 182, 193, 0.08)',
    cardBorder: 'rgba(255, 182, 193, 0.15)',
    
    warmGold: '#FFB6C1',
    warmGoldDark: '#FF9AAA',
    warmGoldSubtle: 'rgba(255, 182, 193, 0.12)',
    warmBrown: '#FFC0CB',
    warmBrownSubtle: 'rgba(255, 192, 203, 0.12)',
    
    deepAnalysis: '#FFB6C1',
    deepAnalysisSubtle: 'rgba(255, 182, 193, 0.15)',
    lightAnalysis: '#FFC0CB',
    lightAnalysisSubtle: 'rgba(255, 192, 203, 0.15)',
    
    warning: '#D2B14C',
    warningSubtle: 'rgba(210, 177, 76, 0.12)',
  },
};

// ============================================
// 📐 COMMON THEME STRUCTURE
// ============================================
const commonTheme = {
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  
  borderRadius: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    round: 999,
  },
  
  fontSize: {
    xs: 11,
    sm: 12,
    md: 14,
    base: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 28,
    huge: 32,
  },
  
  fontWeight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
  
  shadow: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.25,
      shadowRadius: 16,
      elevation: 8,
    },
    neon: {
      shadowColor: '#00FFB0',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.6,
      shadowRadius: 20,
      elevation: 10,
    },
    neonStrong: {
      shadowColor: '#00FFB0',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.8,
      shadowRadius: 30,
      elevation: 15,
    },
  },
  
  badges: {
    deep: 'Mode Profond',
    light: 'Mode Leger',
    deepShort: '*',
    lightShort: '+',
  },
};

// ============================================
// 🎨 EXPORT ALL THEMES (6 total)
// ============================================
export const THEMES = {
  // Free
  original: { ...commonTheme, ...ORIGINAL_THEME },
  'warm-gold': { ...commonTheme, ...WARM_GOLD_THEME },
  'earthy-brown': { ...commonTheme, ...EARTHY_BROWN_THEME },
  // Premium
  'neon-green': { ...commonTheme, ...NEON_GREEN_THEME },
  'deep-ocean': { ...commonTheme, ...DEEP_OCEAN_THEME },
  'soft-pink': { ...commonTheme, ...SOFT_PINK_THEME },
};

// Liste des thèmes pour le sélecteur (3 free + 3 premium)
export const THEME_LIST = [
  // FREE
  { id: 'original', name: 'Original', icon: 'water', iconFamily: 'MaterialIcons', description: 'Bleu-mauve profond', isPremium: false },
  { id: 'warm-gold', name: 'Warm Gold', icon: 'wb-sunny', iconFamily: 'MaterialIcons', description: 'Or chaleureux', isPremium: false },
  { id: 'earthy-brown', name: 'Earthy Brown', icon: 'terrain', iconFamily: 'MaterialIcons', description: 'Brun terreux', isPremium: false },
  // PREMIUM
  { id: 'neon-green', name: 'Neon Green', icon: 'flash-on', iconFamily: 'MaterialIcons', description: 'Vert néon intense', isPremium: true },
  { id: 'deep-ocean', name: 'Deep Ocean', icon: 'waves', iconFamily: 'MaterialIcons', description: 'Océan profond', isPremium: true },
  { id: 'soft-pink', name: 'Soft Pink', icon: 'local-florist', iconFamily: 'MaterialIcons', description: 'Rose doux', isPremium: true },
];

// Export du thème par défaut (pour compatibilité)
export const THEME = THEMES.original;

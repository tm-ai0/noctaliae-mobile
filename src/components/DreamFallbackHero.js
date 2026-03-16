/**
 * DreamFallbackHero
 * Composant visuel riche pour remplacer l'image Gemini quand indisponible.
 * Détecte le thème dominant du rêve via tags/titre → gradient + icône.
 * Compatible avec les mêmes dimensions que les images générées (hero 200px / viewer fullscreen).
 */

import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';

// ── Mapping thème → config visuelle ─────────────────────────────────────────
const THEME_CONFIGS = {
  vol: {
    icon: 'bird',
    iconLib: 'MaterialCommunityIcons',
    colors: ['#0f0c29', '#302b63', '#24243e'],
    accent: '#A0B4D4',
    label: 'Vol',
    keywords: ['vol', 'voler', 'envol', 'oiseau', 'aile', 'ciel', 'nuage', 'planer', 'flotter'],
  },
  eau: {
    icon: 'waves',
    iconLib: 'MaterialIcons',
    colors: ['#0f2027', '#203a43', '#2c5364'],
    accent: '#4F8DFF',
    label: 'Eau',
    keywords: ['eau', 'mer', 'océan', 'rivière', 'pluie', 'noyade', 'nager', 'lac', 'inondation', 'tsunami', 'piscine'],
  },
  ville: {
    icon: 'city-variant-outline',
    iconLib: 'MaterialCommunityIcons',
    colors: ['#1a1a2e', '#16213e', '#0f3460'],
    accent: '#00FFB0',
    label: 'Ville',
    keywords: ['ville', 'rue', 'maison', 'immeuble', 'métro', 'voiture', 'route', 'bâtiment', 'appartement'],
  },
  foret: {
    icon: 'tree-outline',
    iconLib: 'MaterialCommunityIcons',
    colors: ['#0d1b0d', '#1a3a1a', '#0d2b0d'],
    accent: '#6BCB77',
    label: 'Nature',
    keywords: ['forêt', 'arbre', 'nature', 'jardin', 'montagne', 'campagne', 'herbe', 'fleur', 'animal', 'bois'],
  },
  lumiere: {
    icon: 'star-four-points',
    iconLib: 'MaterialCommunityIcons',
    colors: ['#2d1b00', '#4a2a00', '#6b3a00'],
    accent: '#D2B14C',
    label: 'Lumière',
    keywords: ['lumière', 'soleil', 'étoile', 'feu', 'flamme', 'explosion', 'rayon', 'brillant', 'or', 'doré'],
  },
  famille: {
    icon: 'account-group-outline',
    iconLib: 'MaterialCommunityIcons',
    colors: ['#1a0a1a', '#2d0d2d', '#1a0d2d'],
    accent: '#FF9966',
    label: 'Famille',
    keywords: ['famille', 'mère', 'père', 'enfant', 'ami', 'amour', 'mariage', 'reunion', 'soeur', 'frère', 'proche'],
  },
  chute: {
    icon: 'arrow-down-bold',
    iconLib: 'MaterialCommunityIcons',
    colors: ['#1a0000', '#2d0000', '#400000'],
    accent: '#EF4444',
    label: 'Chute',
    keywords: ['chute', 'tomber', 'précipice', 'abîme', 'vide', 'descente', 'escalier', 'ascenseur'],
  },
  poursuite: {
    icon: 'run-fast',
    iconLib: 'MaterialCommunityIcons',
    colors: ['#0a0a1a', '#12121a', '#1a0d00'],
    accent: '#FF6B35',
    label: 'Poursuite',
    keywords: ['poursuite', 'courir', 'fuir', 'peur', 'danger', 'menace', 'piège', 'ennemi', 'attaque'],
  },
  transformation: {
    icon: 'auto-fix',
    iconLib: 'MaterialCommunityIcons',
    colors: ['#1a001a', '#2d002d', '#1a0d2d'],
    accent: '#8B5CF6',
    label: 'Transformation',
    keywords: ['transformation', 'changer', 'métamorphose', 'devenir', 'personnage', 'visage', 'corps', 'identité'],
  },
  // Défaut générique
  default: {
    icon: 'moon-waning-crescent',
    iconLib: 'MaterialCommunityIcons',
    colors: ['#0c0e27', '#1a1f3a', '#0f1130'],
    accent: '#00FFB0',
    label: 'Rêve',
    keywords: [],
  },
};

// ── Détection du thème dominant ──────────────────────────────────────────────
export function detectDreamTheme(tags = [], title = '', analysis = '') {
  const haystack = [
    ...(Array.isArray(tags) ? tags : []),
    title || '',
    (analysis || '').slice(0, 300),
  ].join(' ').toLowerCase();

  for (const [themeKey, config] of Object.entries(THEME_CONFIGS)) {
    if (themeKey === 'default') continue;
    if (config.keywords.some(kw => haystack.includes(kw))) {
      return themeKey;
    }
  }
  return 'default';
}

// ── Composant principal ───────────────────────────────────────────────────────
export default function DreamFallbackHero({ // eslint-disable-line
  tags,
  title,
  analysis,
  style,
  height = 200,
  fullscreen = false,
  onPress = null, // 🌟 CTA optionnel — rend le hero tappable
}) {
  const themeKey = useMemo(
    () => detectDreamTheme(tags, title, analysis),
    [tags, title, analysis]
  );
  const config = THEME_CONFIGS[themeKey] || THEME_CONFIGS.default;
  const IconComponent = config.iconLib === 'MaterialIcons' ? MaterialIcons : MaterialCommunityIcons;
  const iconSize = fullscreen ? 96 : 56;

  const Wrapper = onPress ? TouchableOpacity : View;

  return (
    <Wrapper
      onPress={onPress}
      activeOpacity={0.88}
      style={[styles.container, { height: fullscreen ? '100%' : height }, style]}
    >
      <LinearGradient
        colors={config.colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Phosphènes décoratifs */}
      <View style={[styles.glow, { backgroundColor: config.accent + '18', top: '10%', right: '15%' }]} />
      <View style={[styles.glow, { backgroundColor: config.accent + '0E', bottom: '20%', left: '10%', width: 120, height: 120, borderRadius: 60 }]} />

      {/* Icône centrale */}
      <View style={[styles.iconWrap, { borderColor: config.accent + '30', backgroundColor: config.accent + '12' }]}>
        <IconComponent name={config.icon} size={iconSize} color={config.accent} style={{ opacity: 0.85 }} />
      </View>

      {/* Label discret — caché si CTA actif */}
      {!fullscreen && !onPress && (
        <View style={[styles.labelWrap, { backgroundColor: config.accent + '18', borderColor: config.accent + '30' }]}>
          <Text style={[styles.label, { color: config.accent }]}>{config.label}</Text>
        </View>
      )}

      {/* 🌟 Badge CTA discret — uniquement si onPress fourni */}
      {onPress && !fullscreen && (
        <View style={styles.ctaOverlay}>
          <View style={styles.ctaBadge}>
            <MaterialCommunityIcons name="image-filter-vintage" size={12} color="#D2B14C" />
            <Text style={styles.ctaText}>Générer l’image</Text>
          </View>
        </View>
      )}
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  glow: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
  },
  iconWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelWrap: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  label: {
    fontSize: 11,
    fontFamily: 'AtkinsonHyperlegibleNext-Bold',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    opacity: 0.7,
  },
  ctaOverlay: {
    position: 'absolute',
    bottom: 10,
    right: 10,
  },
  ctaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(12,14,39,0.72)',
    borderWidth: 1,
    borderColor: '#D2B14C40',
    borderRadius: 10,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  ctaText: {
    fontSize: 11,
    fontFamily: 'AtkinsonHyperlegibleNext-Bold',
    color: '#D2B14C',
    letterSpacing: 0.3,
  },
});

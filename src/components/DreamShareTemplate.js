import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import ViewShot from 'react-native-view-shot';
import { useTranslation } from 'react-i18next';

const { width: SCREEN_W } = Dimensions.get('window');

/**
 * DreamShareTemplate
 *
 * Composant rendu HORS-ÉCRAN (left: SCREEN_W * 2) — capturé par ViewShot.
 * Utilisé par useDreamShare pour produire une image PNG avec branding.
 *
 * Props:
 *  - captureRef   : ref passé par useDreamShare
 *  - dream        : { imageUrl, imagePalette, dreamTitle|title, date, tags, analysis }
 *  - oneLiner     : première phrase de l'analyse (pré-calculée par le hook)
 */
export default function DreamShareTemplate({ captureRef, dream, oneLiner }) {
  const { t } = useTranslation();

  if (!dream) return null;

  const title = (() => {
    const titleVal = dream.dreamTitle || dream.title;
    return titleVal && titleVal !== 'Mon rêve' && titleVal !== 'Rêve sans titre' && titleVal.length > 3
      ? titleVal : 'Rêve sans titre';
  })();

  const dateStr = (() => {
    if (!dream.date) return '';
    const d = new Date(dream.date).toLocaleDateString('fr-FR', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    });
    return d.charAt(0).toUpperCase() + d.slice(1);
  })();

  const palette = Array.isArray(dream.imagePalette) ? dream.imagePalette.slice(0, 5) : [];
  const tags    = Array.isArray(dream.tags) ? dream.tags.slice(0, 4) : [];

  const hasImage = !!dream.imageUrl;

  return (
    <View style={styles.outerWrapper} pointerEvents="none">
      <ViewShot
        ref={captureRef}
        style={styles.card}
        options={{ format: 'png', quality: 0.95 }}
      >
        {/* ── Image ou fond dégradé ── */}
        {hasImage ? (
          <Image source={{ uri: dream.imageUrl }} style={StyleSheet.absoluteFill} resizeMode="cover" />
        ) : (
          <LinearGradient
            colors={['#0c0e27', '#1a1740', '#0c0e27']}
            style={StyleSheet.absoluteFill}
          />
        )}

        {/* Gradient bas */}
        <LinearGradient
          colors={['transparent', 'rgba(12,14,39,0.88)', '#0c0e27']}
          locations={[0.3, 0.68, 1]}
          style={styles.bottomGradient}
        />

        {/* Contenu bas */}
        <View style={styles.bottomContent}>
          {/* Palette */}
          {palette.length > 0 && (
            <View style={styles.paletteRow}>
              {palette.map((color, i) => (
                <View
                  key={i}
                  style={[
                    styles.paletteCircle,
                    { backgroundColor: color, zIndex: palette.length - i },
                    i > 0 && { marginLeft: -8 },
                  ]}
                />
              ))}
              <Text style={styles.paletteLabel}>{t('dreamShareTemplate.paletteLabel')}</Text>
            </View>
          )}

          {/* Titre */}
          <Text style={styles.title} numberOfLines={2}>{title}</Text>

          {/* One-liner */}
          {!!oneLiner && (
            <Text style={styles.oneLiner} numberOfLines={3}>"{oneLiner}"</Text>
          )}

          {/* Date */}
          {!!dateStr && <Text style={styles.date}>{dateStr}</Text>}

          {/* Tags */}
          {tags.length > 0 && (
            <View style={styles.tagsRow}>
              {tags.map((tag, i) => (
                <View key={i} style={styles.tag}>
                  <Text style={styles.tagText}>
                    {String(tag).charAt(0).toUpperCase() + String(tag).slice(1)}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Branding */}
          <View style={styles.brandingRow}>
            <Text style={styles.brandingName}>Noctaliæ</Text>
            <View style={styles.brandingBadge}>
              <MaterialIcons name="android" size={10} color="rgba(255,255,255,0.55)" />
              <Text style={styles.brandingBadgeText}>{t('dreamShareTemplate.playStoreBadge')}</Text>
            </View>
          </View>
        </View>
      </ViewShot>
    </View>
  );
}

const CARD_W = SCREEN_W;
const CARD_H = Math.round(SCREEN_W * (16 / 9));

const styles = StyleSheet.create({
  // Positionné hors écran — invisible mais rendu dans l'arbre
  outerWrapper: {
    position: 'absolute',
    left: SCREEN_W * 2,
    top: 0,
    width: CARD_W,
    height: CARD_H,
    zIndex: -1,
  },
  card: {
    width: CARD_W,
    height: CARD_H,
    backgroundColor: '#0c0e27',
    overflow: 'hidden',
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: CARD_H * 0.55,
  },
  bottomContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 28,
    paddingBottom: 36,
  },
  paletteRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  paletteCircle: {
    width: 24, height: 24, borderRadius: 12,
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.25)',
  },
  paletteLabel: {
    fontSize: 12, color: 'rgba(255,255,255,0.45)',
    fontFamily: 'AtkinsonHyperlegibleNext-Regular',
    marginLeft: 16, letterSpacing: 0.5, textTransform: 'uppercase',
  },
  title: {
    fontSize: 40, fontFamily: 'CormorantUpright-Bold', color: '#00FFB0',
    lineHeight: 48, paddingBottom: 4, marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  oneLiner: {
    fontSize: 15, fontFamily: 'AtkinsonHyperlegibleNext-Regular',
    color: 'rgba(255,255,255,0.7)', lineHeight: 22,
    marginBottom: 10, fontStyle: 'italic',
  },
  date: {
    fontSize: 14, fontFamily: 'AtkinsonHyperlegibleNext-Regular',
    color: 'rgba(255,255,255,0.45)', marginBottom: 12,
    textTransform: 'capitalize',
  },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 18 },
  tag: {
    backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 6,
    paddingHorizontal: 12, paddingVertical: 5,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
  },
  tagText: {
    fontSize: 13, fontFamily: 'AtkinsonHyperlegibleNext-Bold',
    color: 'rgba(255,255,255,0.65)',
  },
  brandingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  brandingName: {
    fontSize: 14,
    fontFamily: 'CormorantUpright-Bold',
    color: 'rgba(210,177,76,0.7)',
    letterSpacing: 1,
  },
  brandingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  brandingBadgeText: {
    fontSize: 10,
    fontFamily: 'AtkinsonHyperlegibleNext-Regular',
    color: 'rgba(255,255,255,0.45)',
    letterSpacing: 0.3,
  },
});

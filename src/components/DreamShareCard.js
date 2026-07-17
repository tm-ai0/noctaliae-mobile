import React from 'react';
import i18next from 'i18next';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

/**
 * DreamShareCard
 * Card 9:16 capturée par ViewShot puis partagée.
 * Rendu hors-écran (opacity:0, position:absolute).
 * Style : full-bleed image + overlay dégradé + typographie Noctaliæ.
 * Minimal : titre + date + tags + URL. Le visuel parle pour lui-même.
 *
 * Props : dream, cardRef (ViewShot ref)
 */

const CARD_WIDTH  = 375;
const CARD_HEIGHT = Math.round(CARD_WIDTH * (16 / 9)); // 667

export { CARD_WIDTH, CARD_HEIGHT };

export default function DreamShareCard({ dream, cardRef }) {
  const ViewShot = require('react-native-view-shot').default;

  const title = (() => {
    const t = dream?.dreamTitle || dream?.title;
    return t && t !== 'Mon rêve' && t !== 'Rêve sans titre' && t.length > 3
      ? t : 'Rêve sans titre';
  })();

  const dateStr = dream?.date
    ? new Date(dream.date).toLocaleDateString(i18next.language, {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
      })
    : '';

  const palette = Array.isArray(dream?.imagePalette)
    ? dream.imagePalette.slice(0, 5) : [];

  const tags = Array.isArray(dream?.tags)
    ? dream.tags.slice(0, 3) : [];

  return (
    <ViewShot
      ref={cardRef}
      options={{ format: 'jpg', quality: 0.95 }}
      style={styles.card}
      collapsable={false}
    >
      {/* Image plein cadre */}
      {dream?.imageUrl ? (
        <Image
          source={{ uri: dream.imageUrl }}
          style={styles.image}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.image, { backgroundColor: '#1a1f3a' }]} />
      )}

      {/* Gradient overlay bas */}
      <LinearGradient
        colors={['transparent', 'rgba(12,14,39,0.55)', 'rgba(12,14,39,0.97)']}
        locations={[0.25, 0.55, 1]}
        style={styles.gradient}
      />

      {/* Gradient overlay haut (léger) */}
      <LinearGradient
        colors={['rgba(12,14,39,0.45)', 'transparent']}
        style={styles.gradientTop}
      />

      {/* Branding top-left */}
      <View style={styles.brandingTop}>
        <Text style={styles.brandingMoon}>🌙</Text>
        <Text style={styles.brandingName}>Noctaliæ</Text>
      </View>

      {/* Palette top-right */}
      {palette.length > 0 && (
        <View style={styles.paletteTop}>
          {palette.map((color, i) => (
            <View
              key={i}
              style={[
                styles.paletteCircle,
                { backgroundColor: color },
                i > 0 && { marginLeft: -6 },
              ]}
            />
          ))}
        </View>
      )}

      {/* Contenu bas */}
      <View style={styles.content}>

        {/* Date */}
        <Text style={styles.date} numberOfLines={1}>
          {dateStr.charAt(0).toUpperCase() + dateStr.slice(1)}
        </Text>

        {/* Titre */}
        <Text style={styles.title} numberOfLines={3}>
          {title}
        </Text>

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

        {/* Footer branding */}
        <View style={styles.footer}>
          <View style={styles.footerDivider} />
          <Text style={styles.footerText}>nocty.thomasmaury.fr</Text>
          <Text style={[styles.footerText, { fontSize: 10, marginTop: 2, color: 'rgba(0,255,176,0.35)' }]}>
            ↓ Disponible sur Google Play
          </Text>
        </View>
      </View>
    </ViewShot>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: '#0c0e27',
    overflow: 'hidden',
  },
  image: {
    position: 'absolute',
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: CARD_HEIGHT * 0.72,
  },
  gradientTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  brandingTop: {
    position: 'absolute',
    top: 28,
    left: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  brandingMoon: { fontSize: 18 },
  brandingName: {
    fontSize: 16,
    fontFamily: 'CormorantUpright-Bold',
    color: 'rgba(255,255,255,0.85)',
    letterSpacing: 1,
  },
  paletteTop: {
    position: 'absolute',
    top: 32,
    right: 24,
    flexDirection: 'row',
    alignItems: 'center',
  },
  paletteCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  content: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 28,
    paddingBottom: 36,
  },
  date: {
    fontSize: 12,
    fontFamily: 'AtkinsonHyperlegibleNext-Regular',
    color: 'rgba(255,255,255,0.5)',
    textTransform: 'capitalize',
    marginBottom: 10,
    letterSpacing: 0.3,
  },
  title: {
    fontSize: 40,
    fontFamily: 'CormorantUpright-Bold',
    color: '#00FFB0',
    lineHeight: 46,
    marginBottom: 14,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  tag: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  tagText: {
    fontSize: 11,
    fontFamily: 'AtkinsonHyperlegibleNext-Bold',
    color: 'rgba(255,255,255,0.7)',
  },
  footer: {
    alignItems: 'center',
    gap: 8,
  },
  footerDivider: {
    width: 40,
    height: 1,
    backgroundColor: 'rgba(0,255,176,0.3)',
  },
  footerText: {
    fontSize: 11,
    fontFamily: 'AtkinsonHyperlegibleNext-Regular',
    color: 'rgba(255,255,255,0.3)',
    letterSpacing: 0.8,
    textAlign: 'center',
  },
});

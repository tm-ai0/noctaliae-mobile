/**
 * 🗺️ AtlasScreen - Teaser / Coming Soon
 * 
 * Mode standby : présente l'Atlas comme une feature à venir
 * avec un CTA vers Ko-fi pour soutenir le développement.
 * 
 * L'ancien code complet est dans _PERSONAL_NOTES/AtlasScreen_FULL.js.bak
 */

import React, { useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
  Linking
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../config/ThemeContext';
import DebugScreenLabel from '../components/DebugScreenLabel';

const { width } = Dimensions.get('window');

const KOFI_URL = 'https://ko-fi.com/tm_ai0';
const VOTE_FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSe9TVWMzCk761X4jLwoGBR53WNyfPirQD_EjdWhxRvvOlhaNg/viewform';

// 🎨 Couleurs des modules (preview)
const MODULE_COLORS = {
  explorer: '#D2B14C',
  cartographie: '#8B5CF6',
  laboratoire: '#A0B4D4',
  decrypter: '#00FFB0',
};

export default function AtlasScreen({ navigation }) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  
  // 🎭 Animation pulse pour les ghost cards
  const pulseAnim = useRef(new Animated.Value(0.3)).current;
  // 🎭 Animation flottante pour l'icône principale
  const floatAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    // Pulse des ghost cards
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.6,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.3,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Flottement de l'icône
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -8,
          duration: 2500,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handleSupportPress = () => {
    Linking.openURL(KOFI_URL).catch(err => 
      console.error('❌ Erreur ouverture Ko-fi:', err)
    );
  };

  // Mini preview card (ghost/teaser)
  const PreviewCard = ({ icon, title, color }) => (
    <Animated.View 
      style={[
        styles.previewCard, 
        { 
          backgroundColor: theme.colors.cardBackground,
          borderColor: color + '30',
          opacity: pulseAnim,
        }
      ]}
    >
      <View style={[styles.previewIcon, { backgroundColor: color + '15' }]}>
        <MaterialCommunityIcons name={icon} size={24} color={color + '80'} />
      </View>
      <Text style={[styles.previewTitle, { color: theme.colors.textSecondary }]}>
        {title}
      </Text>
    </Animated.View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: theme.colors.background }]}>
      <DebugScreenLabel screenName="🗺️ Atlas" />
      
      <ScrollView 
        contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom, 0) + 120 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <MaterialCommunityIcons name="map-marker-path" size={32} color={theme.colors.primary} />
          <View style={styles.headerText}>
            <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>Atlas</Text>
            <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
              L'univers des rêves, bientôt
            </Text>
          </View>
        </View>

        {/* ✨ Hero Section */}
        <View style={[styles.heroSection, { backgroundColor: theme.colors.cardBackground, borderColor: theme.colors.cardBorder }]}>
          
          {/* Icône flottante */}
          <Animated.View style={{ transform: [{ translateY: floatAnim }] }}>
            <View style={[styles.heroIconContainer, { backgroundColor: theme.colors.primary + '15' }]}>
              <MaterialCommunityIcons name="map-legend" size={48} color={theme.colors.primary} />
            </View>
          </Animated.View>

          {/* Titre */}
          <Text style={[styles.heroTitle, { color: theme.colors.textPrimary }]}>
            L'Atlas des Rêves{'\n'}arrive bientôt
          </Text>
          
          {/* Description */}
          <Text style={[styles.heroDescription, { color: theme.colors.textSecondary }]}>
            Un espace dédié pour explorer la science des rêves, visualiser vos patterns oniriques et approfondir vos connaissances.
          </Text>

          {/* Preview des 4 modules */}
          <View style={styles.previewGrid}>
            <PreviewCard icon="compass-outline" title="Explorer" color={MODULE_COLORS.explorer} />
            <PreviewCard icon="chart-timeline-variant" title="Cartographie" color={MODULE_COLORS.cartographie} />
            <PreviewCard icon="flask-outline" title="Laboratoire" color={MODULE_COLORS.laboratoire} />
            <PreviewCard icon="key-variant" title="Décrypter" color={MODULE_COLORS.decrypter} />
          </View>

          {/* Séparateur */}
          <View style={[styles.separator, { backgroundColor: theme.colors.cardBorder }]} />

          {/* Question d'intérêt */}
          <Text style={[styles.interestQuestion, { color: theme.colors.textPrimary }]}>
            Ça vous intéresse ?
          </Text>
          <Text style={[styles.interestSubtext, { color: theme.colors.textSecondary }]}>
            Dites-nous ce qui vous plaît et aidez-nous à construire la suite !
          </Text>

          {/* CTA Buttons Row */}
          <View style={styles.ctaRow}>
            {/* Bouton Vote */}
            <TouchableOpacity 
              style={[styles.ctaButtonVote, { backgroundColor: '#4F8DFF' }]}
              onPress={() => Linking.openURL(VOTE_FORM_URL)}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="vote" size={20} color="#0c0e27" />
              <Text style={styles.ctaText}>Donnez votre avis</Text>
            </TouchableOpacity>

            {/* Bouton Ko-fi */}
            <TouchableOpacity 
              style={[styles.ctaButtonKofi, { borderColor: theme.colors.primary + '50' }]}
              onPress={handleSupportPress}
              activeOpacity={0.8}
            >
              <Text style={{ fontSize: 16 }}>☕</Text>
              <Text style={[styles.ctaTextKofi, { color: theme.colors.primary }]}>Soutenir</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Info bottom */}
        <View style={[styles.infoCard, { backgroundColor: theme.colors.primaryGlow }]}>
          <MaterialCommunityIcons name="information-outline" size={18} color={theme.colors.primary} />
          <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
            L'Atlas est en cours de développement. Les fonctionnalités d'analyse et d'enregistrement de rêves restent disponibles normalement.
          </Text>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 120,
  },
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
    gap: 15,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 32,
    fontFamily: 'CormorantUpright-Bold',
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  // Hero Section
  heroSection: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 30,
    alignItems: 'center',
    marginBottom: 20,
  },
  heroIconContainer: {
    width: 88,
    height: 88,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  heroTitle: {
    fontSize: 28,
    fontFamily: 'CormorantUpright-Bold',
    textAlign: 'center',
    lineHeight: 32,
    marginBottom: 12,
  },
  heroDescription: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 10,
  },
  // Preview Grid
  previewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
    marginBottom: 24,
    width: '100%',
  },
  previewCard: {
    width: (width - 100) / 2,
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    alignItems: 'center',
    gap: 8,
  },
  previewIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewTitle: {
    fontSize: 13,
    fontFamily: 'AtkinsonHyperlegibleNext-Bold',
  },
  // Separator
  separator: {
    width: 60,
    height: 1,
    marginBottom: 24,
  },
  // Interest
  interestQuestion: {
    fontSize: 24,
    fontFamily: 'CormorantUpright-Bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  interestSubtext: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  // CTA Row
  ctaRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  ctaButtonVote: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  ctaText: {
    fontSize: 14,
    fontFamily: 'AtkinsonHyperlegibleNext-Bold',
    color: '#0c0e27',
  },
  ctaButtonKofi: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  ctaTextKofi: {
    fontSize: 15,
    fontFamily: 'AtkinsonHyperlegibleNext-Bold',
  },
  // Info Card
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
  },
});

/**
 * 🗺️ AtlasScreen - Hub de l'univers Noctaliæ
 * 
 * 4 portails vers la connaissance des rêves :
 * - Explorer : Micro-leçons interactives (Coming Soon)
 * - Cartographie : Visualisations de données (Coming Soon)
 * - Laboratoire : Analyses avancées (Coming Soon)
 * - Décrypter : Fiches scientifiques (LIVE - première fiche 82%)
 */

import React, { useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
  Animated
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../config/ThemeContext';
import DebugScreenLabel from '../components/DebugScreenLabel';

const { width } = Dimensions.get('window');

// 🎨 Couleurs des cards
const CARD_COLORS = {
  explorer: '#D2B14C',      // Or - Primaire
  cartographie: '#8B5CF6',  // Violet
  laboratoire: '#A0B4D4',   // Gris-Vert
  decrypter: '#00FFB0',     // Vert néon
};

export default function AtlasScreen({ navigation }) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  
  // 🎭 Animation pulse pour la section WIP
  const pulseAnim = useRef(new Animated.Value(0.4)).current;
  
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.7,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.4,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // 🚧 Handler pour les sections Coming Soon
  const handleComingSoon = (title, description) => {
    Alert.alert(
      `${title}`,
      `${description}\n\nCette fonctionnalité arrive bientôt ! 🚀`,
      [{ text: 'J\'ai hâte !', style: 'default' }],
      { userInterfaceStyle: 'dark' }
    );
  };

  // 🎴 Composant Card
  const AtlasCard = ({ icon, title, subtitle, color, isLive, onPress }) => (
    <TouchableOpacity 
      style={[
        styles.card, 
        { 
          backgroundColor: theme.colors.cardBackground,
          borderColor: isLive ? color : theme.colors.cardBorder,
          borderWidth: isLive ? 2 : 1,
        }
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Badge Live */}
      {isLive && (
        <View style={[styles.liveBadge, { backgroundColor: color }]}>
          <Text style={styles.liveBadgeText}>LIVE</Text>
        </View>
      )}
      
      {/* Icon */}
      <View style={[styles.cardIcon, { backgroundColor: color + '20' }]}>
        <MaterialCommunityIcons name={icon} size={32} color={color} />
      </View>
      
      {/* Title */}
      <Text style={[styles.cardTitle, { color: theme.colors.textPrimary }]}>
        {title}
      </Text>
      
      {/* Subtitle */}
      <Text style={[styles.cardSubtitle, { color: theme.colors.textSecondary }]}>
        {subtitle}
      </Text>

      {/* Arrow ou Lock */}
      <View style={[styles.cardArrow, { backgroundColor: isLive ? color + '20' : theme.colors.background }]}>
        <MaterialCommunityIcons 
          name={isLive ? "arrow-right" : "clock-outline"} 
          size={18} 
          color={isLive ? color : theme.colors.textSecondary} 
        />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: theme.colors.background }]}>
      <DebugScreenLabel screenName="🗺️ Atlas" />
      
      <ScrollView 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <MaterialCommunityIcons name="map-marker-path" size={32} color={theme.colors.primary} />
          <View style={styles.headerText}>
            <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>Atlas</Text>
            <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
              Explorez l'univers des rêves
            </Text>
          </View>
        </View>

        {/* Cards Grid */}
        <View style={styles.cardsGrid}>
          
          {/* 🧭 Explorer - LIVE (mini parcours) */}
          <AtlasCard
            icon="compass-outline"
            title="Explorer"
            subtitle="Micro-leçons interactives"
            color={CARD_COLORS.explorer}
            isLive={true}
            onPress={() => navigation.navigate('Explorer')}
          />

          {/* 🗺️ Cartographie - Coming Soon */}
          <AtlasCard
            icon="chart-timeline-variant"
            title="Cartographie"
            subtitle="Vos données visualisées"
            color={CARD_COLORS.cartographie}
            isLive={false}
            onPress={() => handleComingSoon(
              '🗺️ Cartographie',
              'Visualisez vos patterns oniriques.\n\n• Graphiques d\'émotions\n• Thèmes récurrents\n• Évolution temporelle'
            )}
          />

          {/* 🔬 Laboratoire - Coming Soon */}
          <AtlasCard
            icon="flask-outline"
            title="Laboratoire"
            subtitle="Analyses scientifiques"
            color={CARD_COLORS.laboratoire}
            isLive={false}
            onPress={() => handleComingSoon(
              '🔬 Laboratoire',
              'Analyses avancées de vos rêves.\n\n• Corrélations sommeil/rêves\n• Détection de patterns\n• Export pour recherche'
            )}
          />

          {/* 🔓 Décrypter - LIVE */}
          <AtlasCard
            icon="key-variant"
            title="Décrypter"
            subtitle="Comprendre la science"
            color={CARD_COLORS.decrypter}
            isLive={true}
            onPress={() => navigation.navigate('Decrypter')}
          />

        </View>

        {/* Info card */}
        <View style={[styles.infoCard, { backgroundColor: theme.colors.primaryGlow }]}>
          <MaterialCommunityIcons name="lightbulb-on-outline" size={20} color={theme.colors.primary} />
          <Text style={[styles.infoText, { color: theme.colors.text }]}>
            L'Atlas grandit avec vous. Chaque mise à jour apporte de nouvelles explorations.
          </Text>
        </View>

        {/* Teaser scientifique */}
        <TouchableOpacity 
          style={[styles.teaserCard, { 
            backgroundColor: CARD_COLORS.decrypter + '15',
            borderColor: CARD_COLORS.decrypter + '40'
          }]}
          onPress={() => navigation.navigate('Decrypter')}
          activeOpacity={0.8}
        >
          <View style={styles.teaserContent}>
            <Text style={[styles.teaserLabel, { color: CARD_COLORS.decrypter }]}>
              PREMIÈRE FICHE DISPONIBLE
            </Text>
            <Text style={[styles.teaserTitle, { color: theme.colors.textPrimary }]}>
              Pourquoi 82% de nos rêves{'\n'}sont négatifs ?
            </Text>
            <Text style={[styles.teaserSubtitle, { color: theme.colors.textSecondary }]}>
              Découvrez la théorie de simulation des menaces
            </Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={28} color={CARD_COLORS.decrypter} />
        </TouchableOpacity>

        {/* 🚧 Section WIP - En construction */}
        <View style={styles.wipSection}>
          {/* Divider avec label */}
          <View style={styles.wipDivider}>
            <View style={[styles.wipLine, { backgroundColor: theme.colors.cardBorder }]} />
            <View style={[styles.wipLabelContainer, { backgroundColor: theme.colors.background }]}>
              <MaterialCommunityIcons name="hammer-wrench" size={14} color={theme.colors.textSecondary} />
              <Text style={[styles.wipLabel, { color: theme.colors.textSecondary }]}>
                En construction
              </Text>
            </View>
            <View style={[styles.wipLine, { backgroundColor: theme.colors.cardBorder }]} />
          </View>

          {/* Ghost cards avec animation pulse */}
          <View style={styles.ghostCardsGrid}>
            <Animated.View 
              style={[
                styles.ghostCard, 
                { 
                  backgroundColor: theme.colors.cardBackground,
                  borderColor: theme.colors.cardBorder,
                  opacity: pulseAnim
                }
              ]}
            >
              <View style={[styles.ghostIcon, { backgroundColor: theme.colors.cardBorder }]} />
              <View style={[styles.ghostLine, { backgroundColor: theme.colors.cardBorder, width: '60%' }]} />
              <View style={[styles.ghostLine, { backgroundColor: theme.colors.cardBorder, width: '80%' }]} />
              <Text style={[styles.ghostText, { color: theme.colors.textSecondary }]}>Bientôt...</Text>
            </Animated.View>

            <Animated.View 
              style={[
                styles.ghostCard, 
                { 
                  backgroundColor: theme.colors.cardBackground,
                  borderColor: theme.colors.cardBorder,
                  opacity: pulseAnim
                }
              ]}
            >
              <View style={[styles.ghostIcon, { backgroundColor: theme.colors.cardBorder }]} />
              <View style={[styles.ghostLine, { backgroundColor: theme.colors.cardBorder, width: '70%' }]} />
              <View style={[styles.ghostLine, { backgroundColor: theme.colors.cardBorder, width: '50%' }]} />
              <Text style={[styles.ghostText, { color: theme.colors.textSecondary }]}>Bientôt...</Text>
            </Animated.View>
          </View>

          {/* Message encourageant */}
          <View style={[styles.wipMessage, { backgroundColor: theme.colors.cardBackground, borderColor: theme.colors.cardBorder }]}>
            <MaterialCommunityIcons name="rocket-launch-outline" size={20} color={theme.colors.primary} />
            <Text style={[styles.wipMessageText, { color: theme.colors.textSecondary }]}>
              Plus de contenus arrivent avec les prochaines mises à jour !
            </Text>
          </View>
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
    fontSize: 28,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  // Cards Grid
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
    marginBottom: 20,
  },
  card: {
    width: (width - 55) / 2,
    borderRadius: 16,
    padding: 18,
    position: 'relative',
    overflow: 'hidden',
  },
  liveBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  liveBadgeText: {
    color: '#000',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  cardIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 12,
  },
  cardArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  // Info Card
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    marginBottom: 20,
    overflow: 'hidden',
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  // Teaser Card
  teaserCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    gap: 15,
  },
  teaserContent: {
    flex: 1,
  },
  teaserLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 8,
  },
  teaserTitle: {
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
    marginBottom: 6,
  },
  teaserSubtitle: {
    fontSize: 13,
  },
  // 🚧 WIP Section
  wipSection: {
    marginTop: 30,
  },
  wipDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  wipLine: {
    flex: 1,
    height: 1,
  },
  wipLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
  },
  wipLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  ghostCardsGrid: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 20,
  },
  ghostCard: {
    flex: 1,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  ghostIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    marginBottom: 12,
  },
  ghostLine: {
    height: 10,
    borderRadius: 5,
    marginBottom: 8,
  },
  ghostText: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 8,
  },
  wipMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  wipMessageText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
});

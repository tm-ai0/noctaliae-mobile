import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView,
  Dimensions
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../config/ThemeContext';
import DebugScreenLabel from '../components/DebugScreenLabel';

const { width } = Dimensions.get('window');

export default function AtlasScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

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
          <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>Atlas</Text>
        </View>

        {/* Coming soon */}
        <View style={styles.comingSoonContainer}>
          <View style={[styles.iconContainer, { backgroundColor: theme.colors.primaryGlow }]}>
            <MaterialCommunityIcons 
              name="map-legend" 
              size={80} 
              color={theme.colors.primary} 
            />
          </View>
          
          <Text style={[styles.comingSoonTitle, { color: theme.colors.textPrimary }]}>
            Bientôt disponible
          </Text>
          
          <Text style={[styles.comingSoonText, { color: theme.colors.textSecondary }]}>
            Explorez la cartographie de vos rêves{'\n'}
            et découvrez les connexions cachées
          </Text>
        </View>

        {/* Preview features */}
        <View style={styles.previewGrid}>
          <View style={[styles.previewCard, { 
            backgroundColor: theme.colors.cardBackground,
            borderColor: theme.colors.cardBorder 
          }]}>
            <MaterialCommunityIcons name="compass-outline" size={32} color={theme.colors.primary} />
            <Text style={[styles.previewTitle, { color: theme.colors.textPrimary }]}>
              Explorer
            </Text>
            <Text style={[styles.previewDesc, { color: theme.colors.textSecondary }]}>
              Cards ludiques Kinuu
            </Text>
          </View>

          <View style={[styles.previewCard, { 
            backgroundColor: theme.colors.cardBackground,
            borderColor: theme.colors.cardBorder 
          }]}>
            <MaterialCommunityIcons name="chart-timeline-variant" size={32} color={theme.colors.warmGold} />
            <Text style={[styles.previewTitle, { color: theme.colors.textPrimary }]}>
              Cartographie
            </Text>
            <Text style={[styles.previewDesc, { color: theme.colors.textSecondary }]}>
              Vos données visualisées
            </Text>
          </View>

          <View style={[styles.previewCard, { 
            backgroundColor: theme.colors.cardBackground,
            borderColor: theme.colors.cardBorder 
          }]}>
            <MaterialCommunityIcons name="flask-outline" size={32} color="#A0B4D4" />
            <Text style={[styles.previewTitle, { color: theme.colors.textPrimary }]}>
              Laboratoire
            </Text>
            <Text style={[styles.previewDesc, { color: theme.colors.textSecondary }]}>
              Analyses scientifiques
            </Text>
          </View>

          <View style={[styles.previewCard, { 
            backgroundColor: theme.colors.cardBackground,
            borderColor: theme.colors.cardBorder 
          }]}>
            <MaterialCommunityIcons name="book-open-page-variant-outline" size={32} color="#FF9966" />
            <Text style={[styles.previewTitle, { color: theme.colors.textPrimary }]}>
              Documentation
            </Text>
            <Text style={[styles.previewDesc, { color: theme.colors.textSecondary }]}>
              Références & guides
            </Text>
          </View>
        </View>

        {/* Info card */}
        <View style={[styles.infoCard, { backgroundColor: theme.colors.primaryGlow }]}>
          <MaterialCommunityIcons name="lightbulb-on-outline" size={20} color={theme.colors.primary} />
          <Text style={[styles.infoText, { color: theme.colors.text }]}>
            L'Atlas cartographiera automatiquement vos rêves pour révéler des patterns inconscients
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
    paddingBottom: 200,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    gap: 15,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
  },
  comingSoonContainer: {
    alignItems: 'center',
    paddingVertical: 30,
    marginBottom: 30,
  },
  iconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 25,
  },
  comingSoonTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
  },
  comingSoonText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  previewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
    marginBottom: 25,
  },
  previewCard: {
    width: (width - 55) / 2,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    overflow: 'hidden', // 🔧 FIX GLOW
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 6,
  },
  previewDesc: {
    fontSize: 13,
    textAlign: 'center',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    overflow: 'hidden', // 🔧 FIX GLOW
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
});

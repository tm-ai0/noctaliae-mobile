import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { THEME } from '../config/theme';
import DebugScreenLabel from '../components/DebugScreenLabel';
import { useTranslation } from 'react-i18next';

const { width } = Dimensions.get('window');

export default function InsightsScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <DebugScreenLabel screenName="💡 Insights" />
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <MaterialCommunityIcons name="chart-line" size={32} color={THEME.colors.primary} />
          <Text style={styles.headerTitle}>{t('insights.title')}</Text>
        </View>

        {/* Coming soon */}
        <View style={styles.comingSoonContainer}>
          <MaterialCommunityIcons 
            name="chart-arc" 
            size={80} 
            color={THEME.colors.textSecondary} 
            style={{ marginBottom: 20 }}
          />
          <Text style={styles.comingSoonTitle}>{t('insights.comingSoon')}</Text>
          <Text style={styles.comingSoonText}>{t('insights.comingSoonDesc')}</Text>
        </View>

        {/* Preview cards */}
        <View style={styles.previewGrid}>
          <View style={styles.previewCard}>
            <MaterialIcons name="timeline" size={32} color={THEME.colors.primary} />
            <Text style={styles.previewTitle}>{t('insights.preview_timeline')}</Text>
            <Text style={styles.previewDesc}>{t('insights.preview_timeline_desc')}</Text>
          </View>

          <View style={styles.previewCard}>
            <MaterialCommunityIcons name="brain" size={32} color={THEME.colors.primary} />
            <Text style={styles.previewTitle}>{t('insights.preview_patterns')}</Text>
            <Text style={styles.previewDesc}>{t('insights.preview_patterns_desc')}</Text>
          </View>

          <View style={styles.previewCard}>
            <MaterialIcons name="bar-chart" size={32} color={THEME.colors.primary} />
            <Text style={styles.previewTitle}>{t('insights.preview_stats')}</Text>
            <Text style={styles.previewDesc}>{t('insights.preview_stats_desc')}</Text>
          </View>

          <View style={styles.previewCard}>
            <MaterialCommunityIcons name="cloud-outline" size={32} color={THEME.colors.primary} />
            <Text style={styles.previewTitle}>{t('insights.preview_wordcloud')}</Text>
            <Text style={styles.previewDesc}>{t('insights.preview_wordcloud_desc')}</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    gap: 15,
  },
  headerTitle: {
    fontSize: THEME.fontSize.xxxl,
    fontWeight: THEME.fontWeight.bold,
    color: THEME.colors.textPrimary,
  },
  comingSoonContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    marginBottom: 40,
  },
  comingSoonTitle: {
    fontSize: THEME.fontSize.xxl,
    fontWeight: THEME.fontWeight.bold,
    color: THEME.colors.textPrimary,
    marginBottom: 10,
  },
  comingSoonText: {
    fontSize: THEME.fontSize.base,
    color: THEME.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  previewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },
  previewCard: {
    width: (width - 55) / 2,
    backgroundColor: THEME.colors.cardBackground,
    borderRadius: THEME.borderRadius.lg,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
    ...THEME.shadow.sm,
  },
  previewTitle: {
    fontSize: THEME.fontSize.base,
    fontWeight: THEME.fontWeight.bold,
    color: THEME.colors.textPrimary,
    marginTop: 12,
    marginBottom: 8,
  },
  previewDesc: {
    fontSize: THEME.fontSize.sm,
    color: THEME.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
});

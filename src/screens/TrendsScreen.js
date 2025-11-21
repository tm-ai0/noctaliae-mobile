import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView,
  TouchableOpacity,
  Dimensions
} from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../config/ThemeContext';
import { getAllDreams } from '../services/storageService';
import { MarkdownText } from '../components/MarkdownText';
import DebugScreenLabel from '../components/DebugScreenLabel';

const { width } = Dimensions.get('window');

export default function TrendsScreen({ navigation }) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [stats, setStats] = useState({
    totalDreams: 0,
    analyzedDreams: 0,
    avgWordsPerDream: 0,
    mostFrequentWords: [],
    weeklyTrend: []
  });

  useFocusEffect(
    React.useCallback(() => {
      loadStats();
    }, [])
  );

  async function loadStats() {
    try {
      const dreams = await getAllDreams();
      const nonArchived = dreams.filter(d => !d.archived);
      const analyzed = nonArchived.filter(d => d.analysis);

      // Calculer moyenne de mots
      const totalWords = nonArchived.reduce((sum, d) => {
        const words = d.transcription ? d.transcription.split(/\s+/).length : 0;
        return sum + words;
      }, 0);
      const avgWords = nonArchived.length > 0 ? Math.round(totalWords / nonArchived.length) : 0;

      // Mots les plus fréquents (simple)
      const allWords = {};
      nonArchived.forEach(d => {
        if (d.transcription) {
          const words = d.transcription.toLowerCase()
            .replace(/[^\w\sàâäéèêëïîôöùûüÿçñ]/g, '')
            .split(/\s+/)
            .filter(w => w.length > 4); // Mots > 4 lettres
          
          words.forEach(word => {
            allWords[word] = (allWords[word] || 0) + 1;
          });
        }
      });

      const topWords = Object.entries(allWords)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([word, count]) => ({ word, count }));

      // Tendance hebdomadaire (7 derniers jours)
      const now = new Date();
      const weeklyData = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        
        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + 1);
        
        const count = nonArchived.filter(d => {
          const dreamDate = new Date(d.date);
          return dreamDate >= date && dreamDate < nextDate;
        }).length;

        weeklyData.push({
          day: date.toLocaleDateString('fr-FR', { weekday: 'short' }),
          count
        });
      }

      setStats({
        totalDreams: nonArchived.length,
        analyzedDreams: analyzed.length,
        avgWordsPerDream: avgWords,
        mostFrequentWords: topWords,
        weeklyTrend: weeklyData
      });

    } catch (error) {
      console.error('❌ Erreur chargement stats:', error);
    }
  }

  function renderStatCard(title, value, icon, color) {
    return (
      <View style={[
        styles.statCard, 
        { 
          backgroundColor: theme.colors.cardBackground,
          borderColor: theme.colors.cardBorder
        }
      ]}>
        <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
          <MaterialCommunityIcons name={icon} size={28} color={color} />
        </View>
        <Text style={[styles.statValue, { color: theme.colors.textPrimary }]}>{value}</Text>
        <Text style={[styles.statTitle, { color: theme.colors.textSecondary }]}>{title}</Text>
      </View>
    );
  }

  const maxCount = Math.max(...stats.weeklyTrend.map(d => d.count), 1);

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: theme.colors.background }]}>
      <DebugScreenLabel screenName="📈 Tendances" />
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <MaterialCommunityIcons 
            name="trending-up" 
            size={32} 
            color={theme.colors.primary} 
          />
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            Tendances
          </Text>
        </View>

        <TouchableOpacity 
          style={[
            styles.iconButton,
            { backgroundColor: theme.colors.cardBackground, borderColor: theme.colors.cardBorder }
          ]}
          onPress={() => navigation.navigate('Settings')}
        >
          <MaterialCommunityIcons name="cog-outline" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {renderStatCard('Total Rêves', stats.totalDreams, 'weather-night', theme.colors.primary)}
          {renderStatCard('Analysés', stats.analyzedDreams, 'brain', theme.colors.warmGold)}
          {renderStatCard('Mots / Rêve', stats.avgWordsPerDream, 'text', '#A0B4D4')}
          {renderStatCard('Cette semaine', stats.weeklyTrend.reduce((sum, d) => sum + d.count, 0), 'calendar-week', '#FF9966')}
        </View>

        {/* Graphique hebdomadaire */}
        <View style={[
          styles.chartCard,
          { 
            backgroundColor: theme.colors.cardBackground,
            borderColor: theme.colors.cardBorder
          }
        ]}>
          <View style={styles.chartHeader}>
            <Text style={[styles.chartTitle, { color: theme.colors.textPrimary }]}>
              Activité des 7 derniers jours
            </Text>
            <MaterialCommunityIcons name="chart-line" size={20} color={theme.colors.primary} />
          </View>

          <View style={styles.chart}>
            {stats.weeklyTrend.map((day, index) => (
              <View key={index} style={styles.barContainer}>
                <View 
                  style={[
                    styles.bar,
                    { 
                      height: `${(day.count / maxCount) * 100}%`,
                      backgroundColor: theme.colors.primary
                    }
                  ]}
                />
                <Text style={[styles.barLabel, { color: theme.colors.textSecondary }]}>
                  {day.day}
                </Text>
                <Text style={[styles.barValue, { color: theme.colors.textPrimary }]}>
                  {day.count}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Mots fréquents */}
        <View style={[
          styles.wordsCard,
          { 
            backgroundColor: theme.colors.cardBackground,
            borderColor: theme.colors.cardBorder
          }
        ]}>
          <View style={styles.wordsHeader}>
            <Text style={[styles.wordsTitle, { color: theme.colors.textPrimary }]}>
              Mots récurrents
            </Text>
            <MaterialCommunityIcons name="tag-multiple" size={20} color={theme.colors.warmGold} />
          </View>

          {stats.mostFrequentWords.length === 0 ? (
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              Pas assez de rêves pour analyser
            </Text>
          ) : (
            <View style={styles.wordsList}>
              {stats.mostFrequentWords.map((item, index) => (
                <View key={index} style={[
                  styles.wordTag,
                  { 
                    backgroundColor: theme.colors.background,
                    borderColor: theme.colors.primary
                  }
                ]}>
                  <Text style={[styles.wordText, { color: theme.colors.textPrimary }]}>
                    {item.word}
                  </Text>
                  <View style={[styles.wordCount, { backgroundColor: theme.colors.primary }]}>
                    <Text style={[styles.wordCountText, { color: theme.colors.background }]}>
                      {item.count}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Info scientifique */}
        <View style={[
          styles.infoCard,
          { backgroundColor: theme.colors.primaryGlow }
        ]}>
          <MaterialCommunityIcons name="information" size={20} color={theme.colors.primary} />
          <Text style={[styles.infoText, { color: theme.colors.text }]}>
            Les mots récurrents peuvent révéler des thèmes inconscients selon la neuroscience des rêves
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
  },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    width: (width - 52) / 2,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
  },
  statIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 13,
  },
  chartCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 20,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  chart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 150,
    paddingHorizontal: 5,
  },
  barContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  bar: {
    width: '70%',
    minHeight: 4,
    borderRadius: 4,
    marginBottom: 8,
  },
  barLabel: {
    fontSize: 11,
    marginTop: 4,
  },
  barValue: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  wordsCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 20,
  },
  wordsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  wordsTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  wordsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  wordTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 12,
    paddingRight: 6,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  wordText: {
    fontSize: 14,
    fontWeight: '500',
  },
  wordCount: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wordCountText: {
    fontSize: 11,
    fontWeight: '700',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 14,
    paddingVertical: 20,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
});

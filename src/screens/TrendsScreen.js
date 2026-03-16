import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../config/ThemeContext';
import { getAllDreams } from '../services/storageService';
import DebugScreenLabel from '../components/DebugScreenLabel';

// ============================================
// 🧠 NEUROSCIENCE INSIGHTS ENGINE
// ============================================
function generateNeuroscienceInsight(dreams, tagFrequencies) {
  if (!dreams || dreams.length === 0) {
    return {
      icon: 'brain',
      title: 'Commencez votre journal',
      text: 'Enregistrez vos rêves pour débloquer des insights neuroscientifiques personnalisés.',
      source: null,
    };
  }

  const insights = [];
  const recentDreams = dreams.slice(0, 7);

  // 1. Continuité thématique (Domhoff)
  if (tagFrequencies.length >= 2) {
    const topTag = tagFrequencies[0];
    const recentWithTag = recentDreams.filter(d => 
      d.tags && d.tags.some(t => t.toLowerCase() === topTag.tag.toLowerCase())
    );
    if (recentWithTag.length >= 2) {
      insights.push({
        icon: 'link-variant',
        title: 'Continuité thématique détectée',
        text: `« ${topTag.tag} » apparaît dans ${recentWithTag.length} de vos ${recentDreams.length} derniers rêves. Selon la théorie de la continuité de Domhoff, vos rêves reflètent vos préoccupations éveillées actuelles.`,
        source: 'Domhoff, 2003',
      });
    }
  }

  // 2. Fréquence de rappel
  const last14 = dreams.filter(d => {
    const diff = (Date.now() - new Date(d.date).getTime()) / (1000 * 60 * 60 * 24);
    return diff <= 14;
  });
  if (last14.length >= 8) {
    insights.push({
      icon: 'flash',
      title: 'Rappel onirique élevé',
      text: `${last14.length} rêves en 14 jours — votre rappel onirique est nettement au-dessus de la moyenne. La recherche montre que les grands rêveurs ont une activité accrue du cortex préfrontal médian.`,
      source: 'Eichenlaub et al., 2014',
    });
  } else if (dreams.length >= 3 && last14.length <= 2) {
    insights.push({
      icon: 'weather-night',
      title: 'Phase de rappel faible',
      text: 'Votre fréquence de rappel a diminué. C\'est normal — elle fluctue avec le stress, le sommeil et l\'attention portée aux rêves au réveil.',
      source: 'Schredl, 2018',
    });
  }

  // 3. Diversité thématique
  if (tagFrequencies.length >= 5) {
    const uniqueTags = tagFrequencies.length;
    const totalTagOccurrences = tagFrequencies.reduce((s, t) => s + t.count, 0);
    const diversityRatio = uniqueTags / Math.max(totalTagOccurrences, 1);
    if (diversityRatio > 0.6) {
      insights.push({
        icon: 'scatter-plot',
        title: 'Grande diversité onirique',
        text: `Vos rêves couvrent ${uniqueTags} thèmes différents. Cette diversité est associée à une plus grande flexibilité cognitive et créativité selon la théorie de la simulation de Revonsuo.`,
        source: 'Revonsuo, 2000',
      });
    }
  }

  // 4. Pattern émotionnel via couleurs
  const dreamsWithPalette = dreams.filter(d => d.imagePalette && d.imagePalette.length > 0);
  if (dreamsWithPalette.length >= 3) {
    const recentPalettes = dreamsWithPalette.slice(0, 5);
    const allColors = recentPalettes.flatMap(d => d.imagePalette);
    const warmCount = allColors.filter(c => isWarmColor(c)).length;
    const coolCount = allColors.length - warmCount;
    if (warmCount > coolCount * 1.5) {
      insights.push({
        icon: 'palette',
        title: 'Tonalité émotionnelle chaude',
        text: 'Vos rêves récents montrent une dominante chromatique chaude (rouges, oranges, dorés). Cela peut refléter un état émotionnel activé — énergie, passion ou tension.',
        source: 'Schredl & Erlacher, 2008',
      });
    } else if (coolCount > warmCount * 1.5) {
      insights.push({
        icon: 'palette',
        title: 'Tonalité émotionnelle froide',
        text: 'Vos rêves récents présentent une dominante chromatique froide (bleus, verts, violets). Cela peut indiquer un état de calme, réflexion ou distance émotionnelle.',
        source: 'Schredl & Erlacher, 2008',
      });
    }
  }

  // 5. Régularité (streak-based)
  const streak = calculateStreak(dreams);
  if (streak >= 5) {
    insights.push({
      icon: 'trophy',
      title: 'Consolidation mnésique active',
      text: `${streak} jours consécutifs d'enregistrement ! La pratique régulière du journal de rêves renforce la mémoire prospective et améliore le rappel onirique à long terme.`,
      source: 'Aspy et al., 2017',
    });
  }

  if (insights.length === 0) {
    return {
      icon: 'lightbulb-outline',
      title: 'Continuez d\'enregistrer',
      text: 'Plus vous enregistrez de rêves, plus les patterns émergent. La recherche montre qu\'il faut environ 2 semaines de journal pour voir des tendances significatives.',
      source: 'Schredl, 2018',
    };
  }

  return insights[Math.floor(Math.random() * insights.length)];
}

// ============================================
// 🔧 UTILS
// ============================================
function isWarmColor(hex) {
  if (!hex || hex.length < 7) return false;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return r > 150 && r > b;
}

function calculateStreak(dreams) {
  if (!dreams || dreams.length === 0) return 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dreamDays = new Set();
  dreams.forEach(d => {
    const date = new Date(d.date);
    date.setHours(0, 0, 0, 0);
    dreamDays.add(date.getTime());
  });
  let streak = 0;
  let currentDay = new Date(today);
  if (!dreamDays.has(currentDay.getTime())) {
    currentDay.setDate(currentDay.getDate() - 1);
  }
  while (dreamDays.has(currentDay.getTime())) {
    streak++;
    currentDay.setDate(currentDay.getDate() - 1);
  }
  return streak;
}

function getDreamFrequency(dreams, days = 30) {
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  const recentDreams = dreams.filter(d => new Date(d.date).getTime() > cutoff);
  if (recentDreams.length === 0) return 0;
  return Math.round((recentDreams.length / days) * 7 * 10) / 10;
}

function aggregateTags(dreams) {
  const tagMap = {};
  dreams.forEach(d => {
    if (d.tags && Array.isArray(d.tags)) {
      d.tags.forEach(tag => {
        const normalized = tag.trim().toLowerCase();
        if (normalized) {
          tagMap[normalized] = (tagMap[normalized] || 0) + 1;
        }
      });
    }
  });
  return Object.entries(tagMap)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);
}

// Générer la grille calendrier des 21 derniers jours
function buildStreakCalendar(dreams, days = 21) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const dreamDays = new Map(); // timestamp -> count
  dreams.forEach(d => {
    const date = new Date(d.date);
    date.setHours(0, 0, 0, 0);
    const ts = date.getTime();
    dreamDays.set(ts, (dreamDays.get(ts) || 0) + 1);
  });

  const calendar = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    const ts = date.getTime();
    const count = dreamDays.get(ts) || 0;
    calendar.push({
      date,
      count,
      isToday: i === 0,
      dayLabel: date.toLocaleDateString('fr-FR', { weekday: 'narrow' }), // L, M, M, J, V, S, D
    });
  }
  return calendar;
}

// ============================================
// 📊 MAIN COMPONENT
// ============================================
export default function TrendsScreen({ navigation }) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [stats, setStats] = useState({
    totalDreams: 0,
    streak: 0,
    frequency: 0,
    weeklyTrend: [],
    tagFrequencies: [],
    chromaticTimeline: [],
    streakCalendar: [],
    insight: null,
  });

  useFocusEffect(
    React.useCallback(() => {
      loadStats();
    }, [])
  );

  async function loadStats() {
    try {
      const allDreams = await getAllDreams();
      const nonArchived = allDreams.filter(d => !d.archived);
      nonArchived.sort((a, b) => new Date(b.date) - new Date(a.date));

      const streak = calculateStreak(nonArchived);
      const frequency = getDreamFrequency(nonArchived);
      const tagFrequencies = aggregateTags(nonArchived);
      const streakCalendar = buildStreakCalendar(nonArchived, 21);

      const chromaticTimeline = nonArchived
        .filter(d => d.imagePalette && d.imagePalette.length > 0)
        .reverse()
        .map(d => ({
          id: d.id,
          date: d.date,
          colors: d.imagePalette,
          emoji: d.emoji || null,
          title: d.dreamTitle || null,
        }));

      const now = new Date();
      const weeklyData = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + 1);
        const dayDreams = nonArchived.filter(d => {
          const dreamDate = new Date(d.date);
          return dreamDate >= date && dreamDate < nextDate;
        });
        weeklyData.push({
          day: date.toLocaleDateString('fr-FR', { weekday: 'short' }),
          count: dayDreams.length,
          emoji: dayDreams.length > 0 ? (dayDreams[0].emoji || null) : null,
        });
      }

      const insight = generateNeuroscienceInsight(nonArchived, tagFrequencies);

      setStats({
        totalDreams: nonArchived.length,
        streak,
        frequency,
        weeklyTrend: weeklyData,
        tagFrequencies,
        chromaticTimeline,
        streakCalendar,
        insight,
      });
    } catch (error) {
      console.error('❌ Erreur chargement stats:', error);
    }
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
          <Text style={[styles.headerTitle, { color: theme.colors.text, fontFamily: theme.fontFamily.display }]}>
            Profil Onirique
          </Text>
        </View>
        <TouchableOpacity 
          style={[
            styles.iconButton,
            { backgroundColor: theme.colors.cardBackground, borderColor: theme.colors.cardBorder }
          ]}
          onPress={() => navigation.navigate('Persona')}
        >
          <MaterialCommunityIcons name="dna" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ============================================ */}
        {/* 1. STREAK CALENDAR + STATS */}
        {/* ============================================ */}
        <View style={[
          styles.streakCard,
          { backgroundColor: theme.colors.cardBackground, borderColor: theme.colors.cardBorder }
        ]}>
          {/* Top row: streak number + stats */}
          <View style={styles.streakTopRow}>
            <View style={styles.streakMainStat}>
              <MaterialCommunityIcons name="fire" size={22} color={theme.colors.primary} />
              <Text style={[styles.streakMainNumber, { color: theme.colors.primary, fontFamily: theme.fontFamily.bodyBold }]}>
                {stats.streak}
              </Text>
              <Text style={[styles.streakMainLabel, { color: theme.colors.textSecondary, fontFamily: theme.fontFamily.body }]}>
                {stats.streak <= 1 ? 'jour' : 'jours'}
              </Text>
            </View>
            <View style={[styles.streakStatsDivider, { backgroundColor: theme.colors.dividerStrong }]} />
            <View style={styles.streakMiniStats}>
              <View style={styles.streakMiniStat}>
                <Text style={[styles.streakMiniNumber, { color: theme.colors.warmGold, fontFamily: theme.fontFamily.bodyBold }]}>
                  {stats.frequency}
                </Text>
                <Text style={[styles.streakMiniLabel, { color: theme.colors.textTertiary, fontFamily: theme.fontFamily.body }]}>
                  /sem
                </Text>
              </View>
              <View style={styles.streakMiniStat}>
                <Text style={[styles.streakMiniNumber, { color: theme.colors.coolGrayGreen, fontFamily: theme.fontFamily.bodyBold }]}>
                  {stats.totalDreams}
                </Text>
                <Text style={[styles.streakMiniLabel, { color: theme.colors.textTertiary, fontFamily: theme.fontFamily.body }]}>
                  total
                </Text>
              </View>
            </View>
          </View>

          {/* Calendar grid — 21 days, 7 columns */}
          <View style={styles.calendarGrid}>
            {stats.streakCalendar.map((day, index) => {
              const hasReve = day.count > 0;
              const isToday = day.isToday;
              return (
                <View 
                  key={index} 
                  style={[
                    styles.calendarCell,
                    {
                      backgroundColor: hasReve
                        ? (day.count >= 2 ? theme.colors.primary : theme.colors.primary + '90')
                        : theme.colors.background,
                      borderColor: isToday 
                        ? theme.colors.primary 
                        : 'transparent',
                      borderWidth: isToday ? 1.5 : 0,
                    }
                  ]}
                >
                  {hasReve && day.count >= 2 && (
                    <Text style={styles.calendarCellCount}>{day.count}</Text>
                  )}
                </View>
              );
            })}
          </View>

          {/* Day labels under grid */}
          <View style={styles.calendarLabels}>
            {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((label, i) => (
              <Text key={i} style={[styles.calendarLabel, { color: theme.colors.textMuted, fontFamily: theme.fontFamily.body }]}>
                {label}
              </Text>
            ))}
          </View>

          {/* CTA quand streak = 0 */}
          {stats.streak === 0 && stats.totalDreams > 0 && (
            <View style={[styles.streakCta, { backgroundColor: theme.colors.primaryGlow }]}>
              <MaterialCommunityIcons name="alarm" size={14} color={theme.colors.primary} />
              <Text style={[styles.streakCtaText, { color: theme.colors.primary, fontFamily: theme.fontFamily.bodyMedium }]}>
                Enregistrez un rêve pour relancer votre série !
              </Text>
            </View>
          )}

          {/* Motivation quand streak >= 3 */}
          {stats.streak >= 3 && (
            <View style={[styles.streakCta, { backgroundColor: theme.colors.primaryGlow }]}>
              <MaterialCommunityIcons name="star-four-points" size={14} color={theme.colors.primary} />
              <Text style={[styles.streakCtaText, { color: theme.colors.primary, fontFamily: theme.fontFamily.bodyMedium }]}>
                {stats.streak >= 7 
                  ? `${stats.streak} jours — votre rappel onirique se renforce !`
                  : `${stats.streak} jours d'affilée — continuez !`
                }
              </Text>
            </View>
          )}
        </View>

        {/* ============================================ */}
        {/* 2. CHROMATIC TIMELINE */}
        {/* ============================================ */}
        {stats.chromaticTimeline.length > 0 && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary, fontFamily: theme.fontFamily.displayBold }]}>
                Timeline Chromatique
              </Text>
              <MaterialCommunityIcons name="palette" size={18} color={theme.colors.warmGold} />
            </View>
            <Text style={[styles.sectionSubtitle, { color: theme.colors.textTertiary, fontFamily: theme.fontFamily.body }]}>
              L'empreinte émotionnelle de chaque rêve
            </Text>

            <FlatList
              data={stats.chromaticTimeline}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.chromaticList}
              renderItem={({ item }) => (
                <View style={styles.chromaticItem}>
                  <View style={[styles.chromaticBar, { borderColor: theme.colors.cardBorder }]}>
                    {item.colors.map((color, idx) => (
                      <View 
                        key={idx} 
                        style={[
                          styles.chromaticColor,
                          { 
                            backgroundColor: color,
                            borderTopLeftRadius: idx === 0 ? 8 : 0,
                            borderTopRightRadius: idx === 0 ? 8 : 0,
                            borderBottomLeftRadius: idx === item.colors.length - 1 ? 8 : 0,
                            borderBottomRightRadius: idx === item.colors.length - 1 ? 8 : 0,
                          }
                        ]} 
                      />
                    ))}
                  </View>
                  {item.emoji && (
                    <Text style={styles.chromaticEmoji}>{item.emoji}</Text>
                  )}
                  <Text style={[styles.chromaticDate, { color: theme.colors.textMuted, fontFamily: theme.fontFamily.body }]}>
                    {new Date(item.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                  </Text>
                </View>
              )}
            />
          </View>
        )}

        {/* ============================================ */}
        {/* 3. TAG CLOUD — CHIPS INDIVIDUELS */}
        {/* ============================================ */}
        <View style={[
          styles.card,
          { backgroundColor: theme.colors.cardBackground, borderColor: theme.colors.cardBorder }
        ]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: theme.colors.textPrimary, fontFamily: theme.fontFamily.displayBold }]}>
              Univers Thématique
            </Text>
            <MaterialCommunityIcons name="tag-multiple" size={18} color={theme.colors.warmGold} />
          </View>

          {stats.tagFrequencies.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="tag-off-outline" size={32} color={theme.colors.textMuted} />
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary, fontFamily: theme.fontFamily.body }]}>
                Analysez des rêves pour voir vos thèmes émerger
              </Text>
            </View>
          ) : (
            <View style={styles.tagCloud}>
              {stats.tagFrequencies.slice(0, 15).map((item, index) => {
                const maxFreq = stats.tagFrequencies[0].count;
                const ratio = maxFreq > 1 ? item.count / maxFreq : (index < 3 ? 1 : 0.6);
                // Taille plus agressive: 13-24px
                const fontSize = 13 + Math.round(ratio * 11);
                const isTop3 = index < 3;
                
                return (
                  <View key={item.tag} style={[
                    styles.tagChip,
                    { 
                      backgroundColor: isTop3 
                        ? theme.colors.primaryGlow 
                        : theme.colors.background,
                      borderColor: isTop3 
                        ? theme.colors.primary + '50'
                        : theme.colors.dividerStrong,
                    }
                  ]}>
                    <Text style={[
                      styles.tagChipText,
                      { 
                        color: isTop3 ? theme.colors.primary : theme.colors.textSecondary,
                        fontSize,
                        fontFamily: isTop3 ? theme.fontFamily.bodyBold : theme.fontFamily.body,
                      }
                    ]}>
                      {item.tag}
                    </Text>
                    {item.count > 1 && (
                      <View style={[
                        styles.tagChipBadge,
                        { backgroundColor: isTop3 ? theme.colors.primary + '30' : theme.colors.divider }
                      ]}>
                        <Text style={[
                          styles.tagChipBadgeText,
                          { 
                            color: isTop3 ? theme.colors.primary : theme.colors.textTertiary,
                            fontFamily: theme.fontFamily.bodyBold,
                          }
                        ]}>
                          {item.count}
                        </Text>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* ============================================ */}
        {/* 4. RYTHME 7J — DOT-LINE CHART */}
        {/* ============================================ */}
        <View style={[
          styles.card,
          { backgroundColor: theme.colors.cardBackground, borderColor: theme.colors.cardBorder }
        ]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: theme.colors.textPrimary, fontFamily: theme.fontFamily.displayBold }]}>
              Rythme onirique
            </Text>
            <MaterialCommunityIcons name="pulse" size={18} color={theme.colors.primary} />
          </View>

          {/* Dot-line chart */}
          <View style={styles.dotLineChart}>
            {/* Connecting line (behind dots) */}
            <View style={styles.dotLineBg}>
              {stats.weeklyTrend.map((day, index) => {
                if (index === 0) return null;
                const prev = stats.weeklyTrend[index - 1];
                const prevY = prev.count > 0 ? Math.max(1 - (prev.count / maxCount), 0.15) : 0.85;
                const currY = day.count > 0 ? Math.max(1 - (day.count / maxCount), 0.15) : 0.85;
                // Simplified: just a horizontal connecting line at midpoint
                return null; // Line drawn via the track background
              })}
            </View>

            {stats.weeklyTrend.map((day, index) => {
              const hasReve = day.count > 0;
              // Hauteur du stem et margin du dot (proportionnel au count)
              const stemHeight = hasReve 
                ? Math.max(Math.round((day.count / maxCount) * 55), 12)
                : 0;

              return (
                <View key={index} style={styles.dotLineColumn}>
                  {/* Emoji above dot */}
                  {day.emoji ? (
                    <Text style={styles.dotEmoji}>{day.emoji}</Text>
                  ) : (
                    <View style={styles.dotEmojiPlaceholder} />
                  )}

                  {/* Stem + Dot area */}
                  <View style={styles.dotStemArea}>
                    {/* Thin stem from bottom */}
                    {hasReve && (
                      <View style={[
                        styles.dotStem,
                        { 
                          height: stemHeight,
                          backgroundColor: theme.colors.primary + '35',
                        }
                      ]} />
                    )}
                    {/* The dot — sits above stem via marginBottom */}
                    <View style={[
                      styles.dotCircle,
                      hasReve ? {
                        backgroundColor: theme.colors.primary,
                        shadowColor: theme.colors.primary,
                        shadowOffset: { width: 0, height: 0 },
                        shadowOpacity: 0.5,
                        shadowRadius: 6,
                        elevation: 4,
                        marginBottom: stemHeight - 7, // -7 = half dot height, so dot centers on stem top
                      } : {
                        backgroundColor: 'transparent',
                        borderWidth: 1.5,
                        borderColor: theme.colors.textMuted + '80',
                        marginBottom: 0,
                      },
                    ]}>
                      {hasReve && day.count >= 2 && (
                        <Text style={styles.dotCount}>{day.count}</Text>
                      )}
                    </View>
                  </View>

                  {/* Day label */}
                  <Text style={[styles.dotDayLabel, { 
                    color: hasReve ? theme.colors.textPrimary : theme.colors.textMuted, 
                    fontFamily: hasReve ? theme.fontFamily.bodyBold : theme.fontFamily.body 
                  }]}>
                    {day.day}
                  </Text>
                </View>
              );
            })}
          </View>

          {/* Summary line */}
          {stats.weeklyTrend.some(d => d.count > 0) && (
            <View style={[styles.dotSummary, { borderTopColor: theme.colors.divider }]}>
              <Text style={[styles.dotSummaryText, { color: theme.colors.textTertiary, fontFamily: theme.fontFamily.body }]}>
                {stats.weeklyTrend.reduce((s, d) => s + d.count, 0)} rêve{stats.weeklyTrend.reduce((s, d) => s + d.count, 0) > 1 ? 's' : ''} cette semaine
              </Text>
            </View>
          )}
        </View>

        {/* ============================================ */}
        {/* 5. INSIGHT NEUROSCIENCE DYNAMIQUE */}
        {/* ============================================ */}
        {stats.insight && (
          <View style={[
            styles.insightCard,
            { backgroundColor: theme.colors.primaryGlow, borderColor: theme.colors.primary + '20' }
          ]}>
            <View style={styles.insightHeader}>
              <View style={[styles.insightIconCircle, { backgroundColor: theme.colors.primary + '25' }]}>
                <MaterialCommunityIcons 
                  name={stats.insight.icon} 
                  size={22} 
                  color={theme.colors.primary} 
                />
              </View>
              <Text style={[styles.insightTitle, { color: theme.colors.primary, fontFamily: theme.fontFamily.displayBold }]}>
                {stats.insight.title}
              </Text>
            </View>
            <Text style={[styles.insightText, { color: theme.colors.text, fontFamily: theme.fontFamily.body }]}>
              {stats.insight.text}
            </Text>
            {stats.insight.source && (
              <Text style={[styles.insightSource, { color: theme.colors.textTertiary, fontFamily: theme.fontFamily.body }]}>
                📚 {stats.insight.source}
              </Text>
            )}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

// ============================================
// 🎨 STYLES
// ============================================
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
    fontSize: 30,
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
    paddingBottom: 200,
  },

  // ---- SECTION HEADERS ----
  sectionContainer: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 18,
  },
  sectionSubtitle: {
    fontSize: 12,
    marginBottom: 12,
  },

  // ---- 1. STREAK CALENDAR ----
  streakCard: {
    borderRadius: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    padding: 20,
    marginBottom: 20,
    overflow: 'hidden',
  },
  streakTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  streakMainStat: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  streakMainNumber: {
    fontSize: 36,
  },
  streakMainLabel: {
    fontSize: 14,
  },
  streakStatsDivider: {
    width: 1,
    height: 32,
    marginHorizontal: 16,
  },
  streakMiniStats: {
    flexDirection: 'row',
    gap: 16,
  },
  streakMiniStat: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 3,
  },
  streakMiniNumber: {
    fontSize: 20,
  },
  streakMiniLabel: {
    fontSize: 11,
  },
  // Calendar grid: 3 rows x 7 columns
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'center',
  },
  calendarCell: {
    width: 38,
    height: 38,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarCellCount: {
    fontSize: 11,
    color: '#0c0e27',
    fontWeight: '700',
  },
  calendarLabels: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: 6,
  },
  calendarLabel: {
    width: 38,
    textAlign: 'center',
    fontSize: 10,
  },
  streakCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 14,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  streakCtaText: {
    fontSize: 12,
    flex: 1,
  },

  // ---- 2. CHROMATIC TIMELINE ----
  chromaticList: {
    paddingVertical: 4,
    gap: 10,
  },
  chromaticItem: {
    alignItems: 'center',
    width: 44,
  },
  chromaticBar: {
    width: 32,
    height: 72,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
  },
  chromaticColor: {
    flex: 1,
  },
  chromaticEmoji: {
    fontSize: 14,
    marginTop: 6,
  },
  chromaticDate: {
    fontSize: 9,
    marginTop: 3,
  },

  // ---- 3. TAG CLOUD — CHIPS ----
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    marginBottom: 20,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 10,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 14,
  },
  tagCloud: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    alignItems: 'center',
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  tagChipText: {
    // fontSize dynamique via inline style
  },
  tagChipBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  tagChipBadgeText: {
    fontSize: 10,
  },

  // ---- 4. DOT-LINE CHART ----
  dotLineChart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 130,
    paddingHorizontal: 2,
  },
  dotLineBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  dotLineColumn: {
    flex: 1,
    alignItems: 'center',
  },
  dotEmoji: {
    fontSize: 16,
    height: 22,
    textAlign: 'center',
  },
  dotEmojiPlaceholder: {
    height: 22,
  },
  dotStemArea: {
    flex: 1,
    width: 20,
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginBottom: 6,
  },
  dotStem: {
    width: 2.5,
    borderRadius: 1.5,
    position: 'absolute',
    bottom: 0,
  },
  dotCircle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  dotCount: {
    fontSize: 8,
    fontWeight: '800',
    color: '#0c0e27',
  },
  dotDayLabel: {
    fontSize: 11,
  },
  dotSummary: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    alignItems: 'center',
  },
  dotSummaryText: {
    fontSize: 12,
  },

  // ---- 5. INSIGHT NEUROSCIENCE ----
  insightCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    marginBottom: 20,
    overflow: 'hidden',
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  insightIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  insightTitle: {
    fontSize: 16,
    flex: 1,
  },
  insightText: {
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 10,
  },
  insightSource: {
    fontSize: 11,
    fontStyle: 'italic',
  },
});

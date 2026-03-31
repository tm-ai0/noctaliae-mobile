import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  Alert,
  Dimensions,
  Image,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { getAllDreams, archiveDream, setDreamSecret, deleteDream, toggleFavoriteDream, setPinnedDream } from '../services/storageService';
import { useTheme } from '../config/ThemeContext';
import DreamCard from '../components/DreamCard';
import DebugScreenLabel from '../components/DebugScreenLabel';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');
const MENU_HINT_KEY = '@noctaliae_menu_hint_shown';
const FIRST_ARCHIVE_KEY = '@noctaliae_first_archive_shown';

import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';

export default function AnalysisScreen({ navigation, route }) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [dreams, setDreams] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // 🗑️ Mode sélection (activé par paramètre depuis Settings)
  const [isSelectionMode, setIsSelectionMode] = useState(route.params?.startInSelectionMode || false);
  const [selectedDreams, setSelectedDreams] = useState(new Set());
  
  // 🔽 Filtre popover (Tous / Favoris / Secrets)
  const [activeFilter, setActiveFilter] = useState(route.params?.showOnlySecrets ? 'secrets' : null);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  
  // 💡 Hint pour le bouton menu (première utilisation)
  const [showMenuHint, setShowMenuHint] = useState(false);
  
  // 💡 Charger le flag du hint au mount
  React.useEffect(() => {
    async function checkMenuHint() {
      try {
        const hintShown = await AsyncStorage.getItem(MENU_HINT_KEY);
        // Si jamais montré, on affiche le hint
        if (!hintShown) {
          setShowMenuHint(true);
        }
      } catch (error) {
        console.error('❌ Erreur chargement hint:', error);
      }
    }
    checkMenuHint();
  }, []);
  
  // 💡 Handler pour dismiss le hint
  async function handleMenuHintDismiss() {
    try {
      await AsyncStorage.setItem(MENU_HINT_KEY, 'true');
      setShowMenuHint(false);
    } catch (error) {
      console.error('❌ Erreur sauvegarde hint:', error);
    }
  }
  
  useFocusEffect(
    React.useCallback(() => {
      loadAnalyzedDreams();
      // Activer le mode sélection si demandé par Settings
      if (route.params?.startInSelectionMode) {
        setIsSelectionMode(true);
        navigation.setParams({ startInSelectionMode: false });
      }
      // 🔐 Activer le filtre secrets si demandé par Settings
      if (route.params?.showOnlySecrets) {
        setActiveFilter('secrets');
        navigation.setParams({ showOnlySecrets: false });
      }
    }, [route.params?.startInSelectionMode, route.params?.showOnlySecrets])
  );
  
  async function loadAnalyzedDreams() {
    try {
      const allDreams = await getAllDreams();
      const nonArchived = allDreams.filter(dream => !dream.archived);
      const sorted = nonArchived.sort((a, b) => new Date(b.date) - new Date(a.date));
      setDreams(sorted);
    } catch (error) {
      console.error('❌ Erreur chargement rêves:', error);
    }
  }

  function groupDreamsByDate() {
    const filtered = dreams.filter(dream => {
      // 🔐 Filtre secrets : si actif, ne montrer que les secrets
      if (activeFilter === 'secrets' && !dream.isSecret) return false;
      // 🔽 Filtre favoris
      if (activeFilter === 'favorites' && !dream.isFavorite) return false;
      // 📌 Exclure le rêve épinglé de la liste (affiché en haut séparément)
      if (dream.isPinned) return false;

      if (!searchQuery.trim()) return true;
      
      const query = searchQuery.toLowerCase();
      return (
        dream.title?.toLowerCase().includes(query) ||
        dream.transcription?.toLowerCase().includes(query) ||
        dream.analysis?.toLowerCase().includes(query)
      );
    });

    const groups = {};
    
    filtered.forEach(dream => {
      const date = new Date(dream.date);
      const dateKey = date.toLocaleDateString('fr-FR', { 
        day: 'numeric',
        month: 'short' 
      });
      
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(dream);
    });

    return Object.keys(groups).map(dateKey => ({
      date: dateKey,
      data: groups[dateKey]
    }));
  }

  // ⭐ Handlers favoris + épinglage
  async function handleFavoriteToggle(dreamId) {
    await toggleFavoriteDream(dreamId);
    loadAnalyzedDreams();
  }

  async function handlePinToggle(dreamId) {
    await setPinnedDream(dreamId);
    loadAnalyzedDreams();
  }

  // Handler d'archivage avec haptic feedback
  async function handleArchiveDream(dreamId) {
    try {
      await archiveDream(dreamId);
      // Refresh la liste
      loadAnalyzedDreams();
    } catch (error) {
      console.error('❌ Erreur archivage:', error);
    }
  }

  // 🔐 Handler toggle secret
  async function handleSecretToggle(dreamId, isSecret) {
    try {
      await setDreamSecret(dreamId, isSecret);
      loadAnalyzedDreams();
    } catch (error) {
      console.error('❌ Erreur toggle secret:', error);
    }
  }

  // 🗑️ Handlers mode sélection
  function toggleSelectionMode() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (isSelectionMode) {
      // Quitter le mode sélection
      setSelectedDreams(new Set());
    }
    setIsSelectionMode(!isSelectionMode);
  }

  function toggleDreamSelection(dreamId) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newSelected = new Set(selectedDreams);
    if (newSelected.has(dreamId)) {
      newSelected.delete(dreamId);
    } else {
      newSelected.add(dreamId);
    }
    setSelectedDreams(newSelected);
  }

  function selectAll() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const allIds = dreams.map(d => d.id);
    setSelectedDreams(new Set(allIds));
  }

  async function deleteSelectedDreams() {
    if (selectedDreams.size === 0) return;
    
    Alert.alert(
      t('analysis.deleteAlert_title'),
      t('analysis.deleteAlert_msg'),
      [
        { text: t('analysis.deleteAlert_cancel'), style: 'cancel' },
        { 
          text: t('analysis.deleteAlert_confirm'), 
          style: 'destructive', 
          onPress: async () => {
            try {
              for (const dreamId of selectedDreams) {
                await deleteDream(dreamId);
              }
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              setSelectedDreams(new Set());
              setIsSelectionMode(false);
              loadAnalyzedDreams();
            } catch (error) {
              console.error('❌ Erreur suppression:', error);
            }
          }
        }
      ],
      { userInterfaceStyle: 'dark' }
    );
  }

  // 📦 Vérifier si c'est la première archivage
  async function checkFirstArchive() {
    try {
      const shown = await AsyncStorage.getItem(FIRST_ARCHIVE_KEY);
      if (!shown) {
        await AsyncStorage.setItem(FIRST_ARCHIVE_KEY, 'true');
        return true; // C'est la première fois
      }
      return false; // Déjà vu
    } catch (error) {
      console.error('❌ Erreur check first archive:', error);
      return false;
    }
  }

  function renderDreamCard({ item: dream, index, isFirstOverall }) {
    return (
      <DreamCard 
        dream={dream}
        index={index}
        onArchive={handleArchiveDream}
        onFirstArchive={checkFirstArchive}
        onSecretToggle={handleSecretToggle}
        onFavoriteToggle={handleFavoriteToggle}
        onPinToggle={handlePinToggle}
        isSelectionMode={isSelectionMode}
        isSelected={selectedDreams.has(dream.id)}
        onSelectionToggle={() => toggleDreamSelection(dream.id)}
        showMenuHint={showMenuHint && isFirstOverall && !isSelectionMode && activeFilter !== 'secrets'}
        onMenuHintDismiss={handleMenuHintDismiss}
        onPress={() => {
          if (isSelectionMode) {
            toggleDreamSelection(dream.id);
          } else {
            navigation.navigate('Conversation', {
              dreamId: dream.id,
              dreamAnalysis: dream.analysis,
              dreamTranscription: dream.transcription,
              dreamTitle: dream.title,
              dreamDate: dream.date,
              modelUsed: dream.modelUsed,
              dreamTags: dream.tags || [],
              dreamImageUrl: dream.imageUrl || null,
              dreamImagePalette: dream.imagePalette || null,
            });
          }
        }}
      />
    );
  }

  function renderDateSection({ item: section, index: sectionIndex }) {
    return (
      <View>
        {/* Séparateur date */}
        <View style={styles.dateSeparator}>
          <View style={[styles.separatorLine, { backgroundColor: theme.colors.cardBorder }]} />
          <Text style={[styles.dateHeader, { color: theme.colors.textSecondary }]}>
            {section.date.toUpperCase()}{section.data.length > 1 ? ` · ${section.data.length}` : ''}
          </Text>
          <View style={[styles.separatorLine, { backgroundColor: theme.colors.cardBorder }]} />
        </View>
        
        {section.data.map((dream, index) => (
          <View key={dream.id}>
            {renderDreamCard({ 
              item: dream, 
              index, 
              isFirstOverall: sectionIndex === 0 && index === 0 
            })}
          </View>
        ))}
      </View>
    );
  }

  const groupedDreams = groupDreamsByDate();
  const pinnedDream = dreams.find(d => d.isPinned);

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: theme.colors.background }]}>
      <DebugScreenLabel screenName="🧠 Analyses" />
      
      {/* Header */}
      <View style={styles.header}>
        {isSelectionMode ? (
          // Mode sélection actif
          <>
            <TouchableOpacity 
              style={[
                styles.dnaButton,
                { backgroundColor: theme.colors.cardBackground, borderWidth: 1, borderColor: theme.colors.cardBorder }
              ]}
              onPress={() => {
                if (navigation.canGoBack()) {
                  navigation.goBack();
                } else {
                  toggleSelectionMode();
                }
              }}
            >
              <MaterialIcons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
            
            <View style={styles.selectionInfo}>
              <Text style={[styles.selectionText, { color: theme.colors.textPrimary }]}>
                {t('analysis.selectionMode', { count: selectedDreams.size })}
              </Text>
            </View>
            
            <TouchableOpacity 
              style={[
                styles.selectAllButton,
                { backgroundColor: theme.colors.cardBackground, borderWidth: 1, borderColor: theme.colors.cardBorder }
              ]}
              onPress={selectAll}
            >
              <MaterialIcons name="done-all" size={20} color={theme.colors.primary} />
              <Text style={[styles.selectAllText, { color: theme.colors.primary }]}>Tout</Text>
            </TouchableOpacity>
          </>
        ) : activeFilter === 'secrets' ? (
          // 🔐 Mode "Rêves secrets" actif
          <>
            <TouchableOpacity 
              style={[
                styles.dnaButton,
                { backgroundColor: theme.colors.cardBackground, borderWidth: 1, borderColor: theme.colors.cardBorder }
              ]}
              onPress={() => {
                if (navigation.canGoBack()) {
                  navigation.goBack();
                } else {
                  setActiveFilter(null);
                }
              }}
            >
              <MaterialIcons name="arrow-back" size={24} color={theme.colors.text} />
            </TouchableOpacity>
            
            <View style={styles.secretsHeaderCenter}>
              <MaterialCommunityIcons name="lock" size={22} color="#8B5CF6" />
              <Text style={[styles.secretsHeaderTitle, { color: theme.colors.textPrimary }]}>
                {t('analysis.secretsTitle')}
              </Text>
            </View>
            
            <View style={styles.dnaButton} />
          </>
        ) : (
          // Mode normal
          <>
            <View style={styles.headerTitleGroup}>
              <Text style={[styles.screenTitle, { color: theme.colors.textPrimary }]}>
                {t('analysis.title')}
              </Text>
              {dreams.length > 0 && (
                <Text style={[styles.dreamCount, { color: theme.colors.textSecondary }]}>
                  {dreams.length} {dreams.length > 1 ? 'rêves' : 'rêve'}
                </Text>
              )}
            </View>

            <View style={styles.headerActions}>
              {/* 🔽 Bouton filtre + popover */}
              <View>
                <TouchableOpacity
                  style={[
                    styles.headerIconButton,
                    {
                      backgroundColor: activeFilter ? '#D2B14C20' : theme.colors.cardBackground,
                      borderWidth: 1,
                      borderColor: activeFilter ? '#D2B14C' : theme.colors.cardBorder
                    }
                  ]}
                  onPress={() => setShowFilterMenu(v => !v)}
                >
                  <MaterialIcons
                    name="filter-list"
                    size={22}
                    color={activeFilter ? '#D2B14C' : theme.colors.textSecondary}
                  />
                </TouchableOpacity>

                {showFilterMenu && (
                  <>
                    <TouchableOpacity
                      style={styles.filterOverlay}
                      activeOpacity={1}
                      onPress={() => setShowFilterMenu(false)}
                    />
                    <View style={[styles.filterPopover, { backgroundColor: theme.colors.cardBackground, borderColor: theme.colors.cardBorder }]}>
                      {[
                        { key: null, label: t('analysis.filter_all'), icon: 'moon-waning-crescent', lib: 'mci' },
                        { key: 'favorites', label: t('analysis.filter_favorites'), icon: 'star', lib: 'mi' },
                        { key: 'secrets', label: t('analysis.filter_secrets'), icon: 'lock', lib: 'mi' },
                      ].map((opt, i, arr) => {
                        const isActive = activeFilter === opt.key;
                        return (
                          <TouchableOpacity
                            key={String(opt.key)}
                            style={[
                              styles.filterOption,
                              isActive && { backgroundColor: '#D2B14C15' },
                              i < arr.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.colors.cardBorder }
                            ]}
                            onPress={() => {
                              setActiveFilter(opt.key);
                              setShowFilterMenu(false);
                            }}
                          >
                            {opt.lib === 'mci'
                              ? <MaterialCommunityIcons name={opt.icon} size={17} color={isActive ? '#D2B14C' : theme.colors.textSecondary} />
                              : <MaterialIcons name={opt.icon} size={17} color={isActive ? '#D2B14C' : theme.colors.textSecondary} />
                            }
                            <Text style={[styles.filterOptionText, { color: isActive ? '#D2B14C' : theme.colors.text }]}>
                              {opt.label}
                            </Text>
                            {isActive && <MaterialIcons name="check" size={15} color="#D2B14C" style={{ marginLeft: 'auto' }} />}
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </>
                )}
              </View>

              <TouchableOpacity
                style={[
                  styles.headerIconButton,
                  { backgroundColor: theme.colors.cardBackground, borderWidth: 1, borderColor: theme.colors.cardBorder }
                ]}
                onPress={async () => {
                  const allDreams = await getAllDreams();
                  const analyzedDreams = allDreams.filter(d => d.analysis && !d.archived);
                  navigation.navigate('MetaAnalysis', {
                    dreams: analyzedDreams,
                    totalCount: analyzedDreams.length
                  });
                }}
              >
                <MaterialCommunityIcons name="chat-outline" size={22} color={theme.colors.primary} />
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.headerIconButton,
                  { backgroundColor: theme.colors.primary },
                  theme.shadow.neon
                ]}
                onPress={() => navigation.navigate('Persona')}
              >
                <MaterialCommunityIcons name="dna" size={22} color={theme.colors.background} />
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>

      {/* Barre de recherche */}
      <View style={styles.searchContainer}>
        <View style={[
          styles.searchBar,
          { backgroundColor: theme.colors.cardBackground, borderColor: theme.colors.cardBorder }
        ]}>
          <MaterialIcons name="search" size={22} color={theme.colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: theme.colors.textPrimary }]}
            placeholder={t('analysis.searchPlaceholder')}
            placeholderTextColor={theme.colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <MaterialIcons name="close" size={18} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity 
          style={[
            styles.iconButton,
            { backgroundColor: theme.colors.cardBackground, borderColor: theme.colors.cardBorder }
          ]}
          onPress={() => navigation.navigate('Archives')}
        >
          <MaterialIcons name="archive" size={22} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      {/* 📌 Rêve épinglé */}
      {pinnedDream && !isSelectionMode && !activeFilter && (
        <View style={[styles.pinnedSection, { paddingHorizontal: 20 }]}>
          <View style={styles.pinnedHeader}>
            <MaterialCommunityIcons name="pin" size={14} color="#4F8DFF" />
            <Text style={[styles.pinnedLabel, { color: '#4F8DFF' }]}>{t('analysis.pinned')}</Text>
          </View>
          {renderDreamCard({ item: pinnedDream, index: 0, isFirstOverall: false })}
        </View>
      )}

      {/* Liste */}
      {groupedDreams.length === 0 ? (
        <View style={styles.emptyContainer}>
          {activeFilter === 'secrets' ? (
            // 🔐 Empty state pour mode secrets
            <>
              <MaterialCommunityIcons 
                name="lock-open-variant-outline" 
                size={80} 
                color="#8B5CF6" 
                style={{ marginBottom: 20, opacity: 0.5 }}
              />
              <Text style={[styles.emptyTitle, { color: theme.colors.textPrimary }]}>
                {t('analysis.emptySecrets')}
              </Text>
              <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>
                {t('analysis.emptySecretsSub')}
              </Text>
            </>
          ) : (
            // Empty state normal — Nocty
            <View style={styles.emptyCard}>
              <Image
                source={require('../../assets/nocty-welcome.png')}
                style={styles.emptyNocty}
                resizeMode="contain"
              />
              <Text style={[styles.emptyTitle, { color: theme.colors.textPrimary }]}>
                {t('analysis.emptyTitle')}
              </Text>
              <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>
                {t('analysis.emptyAllSub')}
              </Text>
            </View>
          )}
        </View>
      ) : (
        <FlatList
          data={groupedDreams}
          renderItem={renderDateSection}
          keyExtractor={item => item.date}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* 🗑️ Barre d'actions mode sélection */}
      {isSelectionMode && selectedDreams.size > 0 && (
        <View style={[
          styles.selectionBar,
          { backgroundColor: theme.colors.cardBackground, borderTopColor: theme.colors.cardBorder }
        ]}>
          <TouchableOpacity 
            style={[styles.deleteButton, { backgroundColor: '#EF4444' }]}
            onPress={deleteSelectedDreams}
          >
            <MaterialIcons name="delete" size={22} color="#FFFFFF" />
            <Text style={styles.deleteButtonText}>
              {t('analysis.selectionDelete')}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 15,
  },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  dnaButton: {
    width: 48,
    height: 48,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Header mode normal
  headerTitleGroup: {
    flex: 1,
  },
  screenTitle: {
    fontSize: 34,
    fontFamily: 'CormorantUpright-Bold',
    lineHeight: 38,
  },
  dreamCount: {
    fontSize: 12,
    fontFamily: 'AtkinsonHyperlegibleNext-Regular',
    marginTop: 1,
    letterSpacing: 0.3,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerIconButton: {
    width: 44,
    height: 44,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 10,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    paddingHorizontal: 15,
    height: 48,
    gap: 10,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 200, // 🔧 FIX: Espace pour selectionBar
  },
  dateSeparator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 16,
    gap: 12,
  },
  separatorLine: {
    flex: 1,
    height: 1,
  },
  dateHeader: {
    fontSize: 11,
    fontFamily: 'AtkinsonHyperlegibleNext-Bold',
    letterSpacing: 1,
    paddingHorizontal: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingBottom: 100,
  },
  emptyCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,255,176,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(0,255,176,0.15)',
    borderRadius: 20,
    padding: 32,
  },
  emptyNocty: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 26,
    fontFamily: 'CormorantUpright-Bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    fontFamily: 'AtkinsonHyperlegibleNext-Regular',
  },
  
  // Mode sélection
  selectionInfo: {
    flex: 1,
    alignItems: 'center',
  },
  selectionText: {
    fontSize: 18,
    fontFamily: 'AtkinsonHyperlegibleNext-Bold',
  },
  selectAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    gap: 6,
  },
  selectAllText: {
    fontSize: 14,
    fontFamily: 'AtkinsonHyperlegibleNext-Bold',
  },
  selectionBar: {
    position: 'absolute',
    bottom: 180, // 🔧 FIX: Au-dessus du FAB + tab bar
    left: 20,
    right: 20,
    padding: 16,
    borderRadius: 16,
    borderTopWidth: 1,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    width: '100%',
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontFamily: 'AtkinsonHyperlegibleNext-Bold',
  },
  
  // 📌 Épinglé
  pinnedSection: {
    marginBottom: 4,
  },
  pinnedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
    paddingLeft: 2,
  },
  pinnedLabel: {
    fontSize: 11,
    fontFamily: 'AtkinsonHyperlegibleNext-Bold',
    letterSpacing: 1.2,
  },

  // 🔐 Mode secrets
  secretsHeaderCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  secretsHeaderTitle: {
    fontSize: 26,
    fontFamily: 'CormorantUpright-Bold',
  },
  // 🔽 Filtre popover
  filterOverlay: {
    position: 'absolute',
    top: -9999,
    left: -9999,
    right: -9999,
    bottom: -9999,
    zIndex: 10,
  },
  filterPopover: {
    position: 'absolute',
    top: 50,
    right: 0,
    width: 190,
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
    zIndex: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 12,
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  filterOptionText: {
    fontSize: 14,
    fontFamily: 'AtkinsonHyperlegibleNext-Regular',
  },
});

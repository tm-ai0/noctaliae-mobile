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
  Linking
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { getAllDreams, archiveDream, setDreamSecret, deleteDream } from '../services/storageService';
import { useTheme } from '../config/ThemeContext';
import DreamCard from '../components/DreamCard';
import DebugScreenLabel from '../components/DebugScreenLabel';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');
const MENU_HINT_KEY = '@noctaliae_menu_hint_shown';
const FIRST_ARCHIVE_KEY = '@noctaliae_first_archive_shown';

import * as Haptics from 'expo-haptics';

export default function AnalysisScreen({ navigation, route }) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [dreams, setDreams] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // 🗑️ Mode sélection (activé par paramètre depuis Settings)
  const [isSelectionMode, setIsSelectionMode] = useState(route.params?.startInSelectionMode || false);
  const [selectedDreams, setSelectedDreams] = useState(new Set());
  
  // 🔐 Filtre "Rêves secrets uniquement"
  const [showOnlySecrets, setShowOnlySecrets] = useState(route.params?.showOnlySecrets || false);
  
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
        setShowOnlySecrets(true);
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
      if (showOnlySecrets && !dream.isSecret) return false;
      
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
      `🗑️ Supprimer ${selectedDreams.size} rêve${selectedDreams.size > 1 ? 's' : ''} ?`,
      'Cette action est irréversible.',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Supprimer', 
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
        isSelectionMode={isSelectionMode}
        isSelected={selectedDreams.has(dream.id)}
        onSelectionToggle={() => toggleDreamSelection(dream.id)}
        showMenuHint={showMenuHint && isFirstOverall && !isSelectionMode && !showOnlySecrets}
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
              dreamTags: dream.tags || []
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
            {section.date.toUpperCase()}
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
              onPress={toggleSelectionMode}
            >
              <MaterialIcons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
            
            <View style={styles.selectionInfo}>
              <Text style={[styles.selectionText, { color: theme.colors.textPrimary }]}>
                {selectedDreams.size} sélectionné{selectedDreams.size > 1 ? 's' : ''}
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
        ) : showOnlySecrets ? (
          // 🔐 Mode "Rêves secrets" actif
          <>
            <TouchableOpacity 
              style={[
                styles.dnaButton,
                { backgroundColor: theme.colors.cardBackground, borderWidth: 1, borderColor: theme.colors.cardBorder }
              ]}
              onPress={() => setShowOnlySecrets(false)}
            >
              <MaterialIcons name="arrow-back" size={24} color={theme.colors.text} />
            </TouchableOpacity>
            
            <View style={styles.secretsHeaderCenter}>
              <MaterialCommunityIcons name="lock" size={22} color="#8B5CF6" />
              <Text style={[styles.secretsHeaderTitle, { color: theme.colors.textPrimary }]}>
                Rêves protégés
              </Text>
            </View>
            
            <View style={styles.dnaButton} />
          </>
        ) : (
          // Mode normal
          <>
            <TouchableOpacity 
              style={[
                styles.dnaButton,
                { backgroundColor: theme.colors.primary },
                theme.shadow.neon
              ]}
              onPress={() => navigation.navigate('Persona')}
            >
              <MaterialCommunityIcons name="dna" size={24} color={theme.colors.background} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.askButton, { backgroundColor: theme.colors.primary }, theme.shadow.neon]}
              onPress={async () => {
                const allDreams = await getAllDreams();
                const analyzedDreams = allDreams.filter(d => d.analysis && !d.archived);
                
                navigation.navigate('MetaAnalysis', {
                  dreams: analyzedDreams,
                  totalCount: analyzedDreams.length
                });
              }}
            >
              <MaterialCommunityIcons 
                name="chat" 
                size={20} 
                color={theme.colors.background} 
                style={{ marginRight: 8 }} 
              />
              <Text style={[styles.askButtonText, { color: theme.colors.background }]}>Mes rêves</Text>
            </TouchableOpacity>
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
            placeholder="Rechercher..."
            placeholderTextColor={theme.colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        
        <TouchableOpacity 
          style={[
            styles.iconButton,
            { backgroundColor: theme.colors.cardBackground, borderColor: theme.colors.cardBorder }
          ]}
          onPress={() => Linking.openURL('https://nocty.thomasmaury.fr')}
        >
          <MaterialIcons name="help-outline" size={22} color={theme.colors.text} />
        </TouchableOpacity>
        
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

      {/* Liste */}
      {groupedDreams.length === 0 ? (
        <View style={styles.emptyContainer}>
          {showOnlySecrets ? (
            // 🔐 Empty state pour mode secrets
            <>
              <MaterialCommunityIcons 
                name="lock-open-variant-outline" 
                size={80} 
                color="#8B5CF6" 
                style={{ marginBottom: 20, opacity: 0.5 }}
              />
              <Text style={[styles.emptyTitle, { color: theme.colors.textPrimary }]}>
                Aucun rêve protégé
              </Text>
              <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>
                Pour protéger un rêve, appuyez sur ⋮ puis « Protéger ce rêve »
              </Text>
            </>
          ) : (
            // Empty state normal
            <>
              <MaterialCommunityIcons 
                name="brain" 
                size={80} 
                color={theme.colors.textSecondary} 
                style={{ marginBottom: 20 }}
              />
              <Text style={[styles.emptyTitle, { color: theme.colors.textPrimary }]}>
                Aucune analyse
              </Text>
              <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>
                Enregistrez un rêve et analysez-le pour qu'il apparaisse ici
              </Text>
            </>
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
              Supprimer ({selectedDreams.size})
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
  askButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
  },
  askButtonText: {
    fontSize: 16,
    fontWeight: '700',
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
    borderRadius: 12,
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
    fontWeight: '700',
    letterSpacing: 1,
    paddingHorizontal: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingBottom: 100,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  
  // Mode sélection
  selectionInfo: {
    flex: 1,
    alignItems: 'center',
  },
  selectionText: {
    fontSize: 18,
    fontWeight: '600',
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
    fontWeight: '600',
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
    fontSize: 16,
    fontWeight: '600',
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
    fontSize: 20,
    fontWeight: '700',
  },
});

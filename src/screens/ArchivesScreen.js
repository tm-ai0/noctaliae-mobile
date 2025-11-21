import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList,
  Alert,
  Platform
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { getAllDreams, deleteDream, restoreDream } from '../services/storageService';
import { THEME } from '../config/theme';
import { Swipeable } from 'react-native-gesture-handler';
import DebugScreenLabel from '../components/DebugScreenLabel';

export default function ArchivesScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [archivedDreams, setArchivedDreams] = useState([]);
  
  useFocusEffect(
    React.useCallback(() => {
      loadArchivedDreams();
    }, [])
  );
  
  async function loadArchivedDreams() {
    try {
      const allDreams = await getAllDreams();
      const archived = allDreams.filter(dream => dream.archived);
      const sorted = archived.sort((a, b) => new Date(b.archivedAt) - new Date(a.archivedAt));
      setArchivedDreams(sorted);
    } catch (error) {
      console.error('❌ Erreur chargement archives:', error);
    }
  }

  async function handleDeleteDream(dreamId) {
    Alert.alert(
      'Supprimer définitivement',
      'Cette action est irréversible.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            await deleteDream(dreamId);
            loadArchivedDreams();
          }
        }
      ]
    );
  }

  async function handleRestoreDream(dreamId) {
    await restoreDream(dreamId);
    loadArchivedDreams();
  }

  async function handleDeleteAll() {
    if (archivedDreams.length === 0) return;
    
    Alert.alert(
      'Tout supprimer',
      `Voulez-vous supprimer définitivement les ${archivedDreams.length} rêve(s) archivé(s) ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Tout supprimer',
          style: 'destructive',
          onPress: async () => {
            for (const dream of archivedDreams) {
              await deleteDream(dream.id);
            }
            loadArchivedDreams();
          }
        }
      ]
    );
  }

  function getDaysRemaining(archivedAt) {
    const archived = new Date(archivedAt);
    const now = new Date();
    const expirationDate = new Date(archived.getTime() + 30 * 24 * 60 * 60 * 1000);
    const daysLeft = Math.ceil((expirationDate - now) / (1000 * 60 * 60 * 24));
    return Math.max(0, daysLeft);
  }

  function renderLeftActions(dream) {
    return (
      <TouchableOpacity 
        style={styles.restoreAction}
        onPress={() => handleRestoreDream(dream.id)}
      >
        <MaterialIcons name="restore" size={28} color="#FFFFFF" />
      </TouchableOpacity>
    );
  }

  function renderRightActions(dreamId) {
    return (
      <TouchableOpacity 
        style={styles.deleteAction}
        onPress={() => handleDeleteDream(dreamId)}
      >
        <MaterialIcons name="delete-forever" size={28} color="#FFFFFF" />
      </TouchableOpacity>
    );
  }

  function renderDreamCard({ item: dream }) {
    const date = new Date(dream.date);
    const time = date.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    const daysLeft = getDaysRemaining(dream.archivedAt);

    return (
      <Swipeable
        renderLeftActions={() => renderLeftActions(dream)}
        renderRightActions={() => renderRightActions(dream.id)}
        overshootLeft={false}
        overshootRight={false}
      >
        <View style={styles.dreamCard}>
          <View style={styles.cardHeader}>
            <View style={styles.daysLeftBadge}>
              <MaterialIcons name="schedule" size={14} color="#FFFFFF" />
              <Text style={styles.daysLeftText}>{daysLeft}j restants</Text>
            </View>
            <Text style={styles.cardTime}>{time}</Text>
          </View>

          <Text style={styles.cardTitle} numberOfLines={1}>
            {dream.title}
          </Text>

          <Text style={styles.cardInfo}>
            Archivé le {new Date(dream.archivedAt).toLocaleDateString('fr-FR')}
          </Text>
        </View>
      </Swipeable>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <DebugScreenLabel screenName="📦 Archives" />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <MaterialIcons name="arrow-back" size={24} color={THEME.colors.text} />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Archives</Text>

        <TouchableOpacity 
          style={styles.iconButton}
          onPress={handleDeleteAll}
        >
          <MaterialIcons name="delete-sweep" size={24} color={THEME.colors.text} />
        </TouchableOpacity>
      </View>

      {/* Info */}
      <View style={styles.infoBox}>
        <MaterialIcons name="info-outline" size={20} color={THEME.colors.primary} />
        <Text style={styles.infoText}>
          Les rêves archivés sont supprimés après 30 jours.{'\n'}
          Swipe left pour restaurer, swipe right pour supprimer.
        </Text>
      </View>

      {/* Liste */}
      {archivedDreams.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialIcons 
            name="inventory-2" 
            size={80} 
            color={THEME.colors.textSecondary} 
            style={{ marginBottom: 20 }}
          />
          <Text style={styles.emptyTitle}>Aucune archive</Text>
          <Text style={styles.emptySubtitle}>
            Les rêves archivés apparaîtront ici
          </Text>
        </View>
      ) : (
        <FlatList
          data={archivedDreams}
          renderItem={renderDreamCard}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 15,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: THEME.colors.text,
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: THEME.colors.cardBackground,
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 15,
    borderRadius: 12,
    gap: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: THEME.colors.textSecondary,
    lineHeight: 18,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  dreamCard: {
    backgroundColor: THEME.colors.cardBackground,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: THEME.colors.warning,
    ...Platform.select({
      ios: {
        shadowColor: THEME.colors.warning,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  daysLeftBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.warning,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  daysLeftText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  cardTime: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME.colors.text,
    marginBottom: 6,
  },
  cardInfo: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    fontStyle: 'italic',
  },
  restoreAction: {
    backgroundColor: THEME.colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
    marginBottom: 12,
  },
  deleteAction: {
    backgroundColor: THEME.colors.error,
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
    marginBottom: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: THEME.colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: THEME.colors.textSecondary,
    textAlign: 'center',
  },
});

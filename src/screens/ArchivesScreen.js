import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ImageBackground,
  Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { getAllDreams, deleteDream, restoreDream } from '../services/storageService';
import { THEME } from '../config/theme';
import DebugScreenLabel from '../components/DebugScreenLabel';
import { useNoctaliaeAlert } from '../components/NoctaliaeAlert';
import { useTranslation } from 'react-i18next';
import i18next from 'i18next';

export default function ArchivesScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const [archivedDreams, setArchivedDreams] = useState([]);
  const { showAlert, AlertComponent } = useNoctaliaeAlert();

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
      console.error('Erreur chargement archives:', error);
    }
  }

  async function handleDeleteDream(dreamId) {
    showAlert({
      type: 'confirm',
      title: t('archives.deleteAlert_title'),
      message: t('archives.deleteAlert_msg'),
      confirmText: t('archives.deleteAlert_confirm'),
      cancelText: t('archives.deleteAlert_cancel'),
      onConfirm: async () => {
        await deleteDream(dreamId);
        loadArchivedDreams();
      },
    });
  }

  async function handleRestoreDream(dreamId) {
    await restoreDream(dreamId);
    loadArchivedDreams();
  }

  async function handleDeleteAll() {
    if (archivedDreams.length === 0) return;
    showAlert({
      type: 'warning',
      title: t('archives.deleteAllAlert_title'),
      message: t('archives.deleteAllAlert_msg', { count: archivedDreams.length }),
      confirmText: t('archives.deleteAllAlert_confirm'),
      cancelText: t('archives.deleteAllAlert_cancel'),
      onConfirm: async () => {
        for (const dream of archivedDreams) {
          await deleteDream(dream.id);
        }
        loadArchivedDreams();
      },
    });
  }

  function getDaysRemaining(archivedAt) {
    const archived = new Date(archivedAt);
    const now = new Date();
    const expirationDate = new Date(archived.getTime() + 30 * 24 * 60 * 60 * 1000);
    const daysLeft = Math.ceil((expirationDate - now) / (1000 * 60 * 60 * 24));
    return Math.max(0, daysLeft);
  }

  // ── Ouvrir en lecture seule → ConversationScreen ─────────────────────────
  function handleOpenDream(dream) {
    navigation.navigate('Conversation', {
      dreamId: dream.id,
      dreamAnalysis: dream.analysis || '',
      dreamTranscription: dream.transcription || '',
      dreamTitle: dream.dreamTitle || dream.title || t('archives.dreamFallback'),
      dreamDate: dream.date,
      modelUsed: dream.modelUsed || 'llama',
      dreamTags: dream.tags || [],
      dreamImageUrl: dream.imageUrl || null,
      dreamImagePalette: dream.imagePalette || [],
      readOnly: true, // 🔒 Mode lecture seule
    });
  }

  function renderDreamCard({ item: dream }) {
    const date = new Date(dream.date);
    const time = date.toLocaleTimeString(i18next.language, { hour: '2-digit', minute: '2-digit' });
    const daysLeft = getDaysRemaining(dream.archivedAt);
    const isExpiringSoon = daysLeft <= 7;
    const hasImage = !!dream.imageUrl;
    const palette = Array.isArray(dream.imagePalette) && dream.imagePalette.length >= 2
      ? dream.imagePalette
      : null;

    // Couleur de bordure selon urgence
    const borderColor = isExpiringSoon ? THEME.colors.error : THEME.colors.warning;

    return (
      <TouchableOpacity
        activeOpacity={0.88}
        onPress={() => handleOpenDream(dream)}
        style={[styles.dreamCard, { borderColor }, isExpiringSoon && styles.dreamCardUrgent]}
      >
        {/* ── Hero image floutée ou gradient palette ── */}
        {hasImage ? (
          <ImageBackground
            source={{ uri: dream.imageUrl }}
            style={styles.cardHeroBg}
            imageStyle={styles.cardHeroImage}
            blurRadius={18}
          >
            <LinearGradient
              colors={['rgba(12,14,39,0.55)', 'rgba(12,14,39,0.95)']}
              style={StyleSheet.absoluteFill}
            />
          </ImageBackground>
        ) : palette ? (
          <LinearGradient
            colors={[palette[0] + '22', palette[1] + '18', 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.cardHeroBg}
          />
        ) : null}

        {/* ── Contenu ── */}
        <View style={styles.cardContent}>
          {/* Header : badge jours + heure */}
          <View style={styles.cardHeader}>
            <View style={[styles.daysLeftBadge, isExpiringSoon && styles.daysLeftBadgeUrgent]}>
              <MaterialIcons name="schedule" size={13} color="#FFF" />
              <Text style={styles.daysLeftText}>{t('archives.daysLeft', { count: daysLeft })}</Text>
            </View>
            <View style={styles.cardHeaderRight}>
              {hasImage && (
                <MaterialIcons name="image" size={14} color="rgba(255,255,255,0.35)" style={{ marginRight: 6 }} />
              )}
              <Text style={styles.cardTime}>{time}</Text>
            </View>
          </View>

          {/* Titre */}
          <Text style={styles.cardTitle} numberOfLines={2}>
            {dream.dreamTitle || dream.title || t('archives.dreamFallback')}
          </Text>

          {/* Date archivage */}
          <Text style={styles.cardInfo}>
            {t('archives.archivedOn', { date: new Date(dream.archivedAt).toLocaleDateString(i18next.language) })}
          </Text>

          {/* Actions */}
          <View style={styles.cardActions}>
            <TouchableOpacity
              style={styles.restoreBtn}
              onPress={() => handleRestoreDream(dream.id)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <MaterialIcons name="restore" size={15} color={THEME.colors.success} />
              <Text style={[styles.actionBtnText, { color: THEME.colors.success }]}>{t('archives.restoreBtn')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={() => handleDeleteDream(dream.id)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <MaterialIcons name="delete-forever" size={15} color={THEME.colors.error} />
              <Text style={[styles.actionBtnText, { color: THEME.colors.error }]}>{t('archives.deleteBtn')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <DebugScreenLabel screenName="Archives" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={THEME.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('archives.title')}</Text>
        <TouchableOpacity style={styles.iconButton} onPress={handleDeleteAll}>
          <MaterialIcons name="delete-sweep" size={24} color={THEME.colors.text} />
        </TouchableOpacity>
      </View>

      {/* Info */}
      <View style={styles.infoBox}>
        <MaterialIcons name="info-outline" size={18} color={THEME.colors.primary} />
        <Text style={styles.infoText}>{t('archives.info')}</Text>
      </View>

      {/* Liste */}
      {archivedDreams.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="inventory-2" size={72} color={THEME.colors.textSecondary} style={{ marginBottom: 20 }} />
          <Text style={styles.emptyTitle}>{t('archives.emptyTitle')}</Text>
          <Text style={styles.emptySubtitle}>{t('archives.emptySub')}</Text>
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

      <AlertComponent />
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
  backButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 24, fontFamily: 'CormorantUpright-Bold', color: THEME.colors.text },
  iconButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },

  infoBox: {
    flexDirection: 'row',
    backgroundColor: THEME.colors.cardBackground,
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 14,
    borderRadius: 12,
    gap: 10,
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: THEME.colors.textSecondary,
    lineHeight: 18,
    fontFamily: 'AtkinsonHyperlegibleNext-Regular',
  },

  listContent: { paddingHorizontal: 20, paddingBottom: 24 },

  // ── Card ──────────────────────────────────────────────────────────────────
  dreamCard: {
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    overflow: 'hidden',
    backgroundColor: THEME.colors.cardBackground,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 8 },
      android: { elevation: 4 },
    }),
  },
  dreamCardUrgent: {
    // borderColor override via inline
  },

  // Hero image floutée
  cardHeroBg: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
  },
  cardHeroImage: {
    borderRadius: 16,
    opacity: 0.7,
  },

  // Contenu par-dessus le hero
  cardContent: {
    padding: 16,
  },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  daysLeftBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.warning,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  daysLeftBadgeUrgent: {
    backgroundColor: THEME.colors.error,
  },
  daysLeftText: {
    color: '#FFF',
    fontSize: 11,
    fontFamily: 'AtkinsonHyperlegibleNext-Bold',
  },
  cardTime: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    fontFamily: 'AtkinsonHyperlegibleNext-Regular',
  },

  cardTitle: {
    fontSize: 22,
    fontFamily: 'CormorantUpright-Bold',
    color: '#FFFFFF',
    marginBottom: 4,
    lineHeight: 28,
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  cardInfo: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
    fontStyle: 'italic',
    marginBottom: 14,
    fontFamily: 'AtkinsonHyperlegibleNext-Regular',
  },

  cardActions: {
    flexDirection: 'row',
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
    paddingTop: 12,
  },
  restoreBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: THEME.colors.success,
    backgroundColor: THEME.colors.success + '15',
  },
  deleteBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: THEME.colors.error,
    backgroundColor: THEME.colors.error + '15',
  },
  actionBtnText: {
    fontSize: 13,
    fontFamily: 'AtkinsonHyperlegibleNext-Bold',
  },

  // Empty
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  emptyTitle: { fontSize: 22, fontFamily: 'CormorantUpright-Bold', color: THEME.colors.text, marginBottom: 8, textAlign: 'center' },
  emptySubtitle: { fontSize: 15, color: THEME.colors.textSecondary, textAlign: 'center', fontFamily: 'AtkinsonHyperlegibleNext-Regular' },
});

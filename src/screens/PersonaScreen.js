import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../config/ThemeContext';
import DebugScreenLabel from '../components/DebugScreenLabel';

const FINGERPRINTS_KEY = '@noctaliae_user_fingerprints';

export default function PersonaScreen({ navigation }) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  
  const [fingerprints, setFingerprints] = useState([]);
  const [newFingerprint, setNewFingerprint] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  // 🌍 Multilangue (FR par défaut, prêt pour EN/ES)
  const i18n = {
    fr: {
      title: 'Mes Empreintes',
      infoText: 'Ces empreintes aident Noctaliæ à personnaliser ses analyses et conversations',
      emptyTitle: 'Aucune empreinte',
      emptySubtitle: 'Ajoute des repères sur toi pour des analyses plus personnalisées',
      inputPlaceholder: 'Ex: Je suis graphiste, j\'aime la montagne...',
      add: 'Ajouter',
      cancel: 'Annuler',
      deleteTitle: 'Supprimer',
      deleteMessage: 'Cette empreinte sera effacée définitivement',
      fieldEmpty: 'Champ vide',
      fieldEmptyMessage: 'Écris quelque chose sur toi',
      tooShort: 'Trop court',
      tooShortMessage: 'Minimum 5 caractères',
      ok: 'OK',
      counter: (count) => `${count} empreinte${count > 1 ? 's' : ''}`
    },
    en: {
      title: 'My Fingerprints',
      infoText: 'These fingerprints help Noctaliæ personalize its analyses and conversations',
      emptyTitle: 'No fingerprint',
      emptySubtitle: 'Add some markers about yourself for more personalized analyses',
      inputPlaceholder: 'E.g. I\'m a graphic designer, I love mountains...',
      add: 'Add',
      cancel: 'Cancel',
      deleteTitle: 'Delete',
      deleteMessage: 'This fingerprint will be permanently deleted',
      fieldEmpty: 'Empty field',
      fieldEmptyMessage: 'Write something about yourself',
      tooShort: 'Too short',
      tooShortMessage: 'Minimum 5 characters',
      ok: 'OK',
      counter: (count) => `${count} fingerprint${count > 1 ? 's' : ''}`
    },
    es: {
      title: 'Mis Huellas',
      infoText: 'Estas huellas ayudan a Noctaliæ a personalizar sus análisis y conversaciones',
      emptyTitle: 'Sin huellas',
      emptySubtitle: 'Añade marcadores sobre ti para análisis más personalizados',
      inputPlaceholder: 'Ej: Soy diseñador gráfico, me encanta la montaña...',
      add: 'Añadir',
      cancel: 'Cancelar',
      deleteTitle: 'Eliminar',
      deleteMessage: 'Esta huella se eliminará definitivamente',
      fieldEmpty: 'Campo vacío',
      fieldEmptyMessage: 'Escribe algo sobre ti',
      tooShort: 'Muy corto',
      tooShortMessage: 'Mínimo 5 caracteres',
      ok: 'OK',
      counter: (count) => `${count} huella${count > 1 ? 's' : ''}`
    }
  };

  const t = i18n.fr; // Langue par défaut (à remplacer par state global plus tard)

  useEffect(() => {
    loadFingerprints();
  }, []);

  async function loadFingerprints() {
    try {
      const stored = await AsyncStorage.getItem(FINGERPRINTS_KEY);
      if (stored) {
        setFingerprints(JSON.parse(stored));
      }
    } catch (error) {
      console.error('❌ Erreur chargement empreintes:', error);
    }
  }

  async function saveFingerprints(updatedFingerprints) {
    try {
      await AsyncStorage.setItem(FINGERPRINTS_KEY, JSON.stringify(updatedFingerprints));
      setFingerprints(updatedFingerprints);
    } catch (error) {
      console.error('❌ Erreur sauvegarde empreintes:', error);
      Alert.alert('Erreur', 'Impossible de sauvegarder', [{text: t.ok}], {userInterfaceStyle: 'dark'});
    }
  }

  function handleAddFingerprint() {
    const trimmed = newFingerprint.trim();
    
    if (!trimmed) {
      Alert.alert(t.fieldEmpty, t.fieldEmptyMessage, [{text: t.ok}], {userInterfaceStyle: 'dark'});
      return;
    }

    if (trimmed.length < 5) {
      Alert.alert(t.tooShort, t.tooShortMessage, [{text: t.ok}], {userInterfaceStyle: 'dark'});
      return;
    }

    const newFingerprintObj = {
      id: Date.now().toString(),
      text: trimmed,
      createdAt: new Date().toISOString(),
    };

    const updated = [newFingerprintObj, ...fingerprints];
    saveFingerprints(updated);
    setNewFingerprint('');
    setIsAdding(false);
  }

  function handleDeleteFingerprint(id) {
    Alert.alert(
      t.deleteTitle,
      t.deleteMessage,
      [
        { text: t.cancel, style: 'cancel' },
        {
          text: t.deleteTitle,
          style: 'destructive',
          onPress: () => {
            const updated = fingerprints.filter(f => f.id !== id);
            saveFingerprints(updated);
          }
        }
      ],
      {userInterfaceStyle: 'dark'}
    );
  }

  function renderFingerprintCard(fingerprint) {
    const date = new Date(fingerprint.createdAt);
    const formattedDate = date.toLocaleDateString('fr-FR', { 
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });

    return (
      <View 
        key={fingerprint.id}
        style={[
          styles.fingerprintCard,
          { 
            backgroundColor: theme.colors.cardBackground,
            borderColor: theme.colors.cardBorder
          }
        ]}
      >
        <View style={styles.fingerprintContent}>
          <MaterialCommunityIcons 
            name="fingerprint" 
            size={20} 
            color={theme.colors.primary} 
            style={styles.fingerprintIcon}
          />
          <Text style={[styles.fingerprintText, { color: theme.colors.text }]}>
            {fingerprint.text}
          </Text>
        </View>
        
        <View style={styles.fingerprintFooter}>
          <Text style={[styles.fingerprintDate, { color: theme.colors.textSecondary }]}>
            {formattedDate}
          </Text>
          <TouchableOpacity 
            onPress={() => handleDeleteFingerprint(fingerprint.id)}
            style={styles.deleteButton}
          >
            <MaterialIcons name="delete-outline" size={20} color={theme.colors.error} />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 20}
    >
      <DebugScreenLabel screenName="🎭 Persona" />
      {/* Header */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 15) + 15 }]}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <MaterialIcons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <MaterialCommunityIcons 
            name="fingerprint" 
            size={32} 
            color={theme.colors.primary} 
          />
          <View>
            <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
              {t.title}
            </Text>
            {fingerprints.length > 0 && (
              <Text style={[styles.headerCounter, { color: theme.colors.primary }]}>
                {t.counter(fingerprints.length)}
              </Text>
            )}
          </View>
        </View>
      </View>

      {/* Info Section */}
      <View style={styles.infoSection}>
        <View style={[styles.infoCard, { backgroundColor: theme.colors.primaryGlow }]}>
          <MaterialCommunityIcons name="information" size={20} color={theme.colors.primary} />
          <Text style={[styles.infoText, { color: theme.colors.text }]}>
            {t.infoText}
          </Text>
        </View>
      </View>

      {/* Fingerprints List */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {fingerprints.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons 
              name="fingerprint" 
              size={64} 
              color={theme.colors.textSecondary} 
            />
            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
              {t.emptyTitle}
            </Text>
            <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>
              {t.emptySubtitle}
            </Text>
          </View>
        ) : (
          fingerprints.map(fingerprint => renderFingerprintCard(fingerprint))
        )}
      </ScrollView>

      {/* Add Fingerprint Section */}
      {isAdding ? (
        <View style={[
          styles.addFingerprintContainer,
          { 
            backgroundColor: theme.colors.cardBackground,
            borderTopColor: theme.colors.cardBorder,
            paddingBottom: Math.max(insets.bottom, 15)
          }
        ]}>
          <TextInput
            style={[
              styles.fingerprintInput,
              { 
                backgroundColor: theme.colors.background,
                borderColor: theme.colors.primary,
                color: theme.colors.text
              }
            ]}
            placeholder={t.inputPlaceholder}
            placeholderTextColor={theme.colors.textSecondary}
            value={newFingerprint}
            onChangeText={setNewFingerprint}
            multiline
            maxLength={200}
            autoFocus
          />
          <View style={styles.addFingerprintActions}>
            <TouchableOpacity 
              onPress={() => {
                setIsAdding(false);
                setNewFingerprint('');
              }}
              style={[styles.cancelButton, { backgroundColor: theme.colors.cardBackground }]}
            >
              <Text style={[styles.cancelButtonText, { color: theme.colors.textSecondary }]}>
                {t.cancel}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={handleAddFingerprint}
              style={[
                styles.saveButton, 
                { backgroundColor: theme.colors.primary }
              ]}
              disabled={!newFingerprint.trim()}
            >
              <MaterialIcons name="check" size={20} color={theme.colors.background} />
              <Text style={[styles.saveButtonText, { color: theme.colors.background }]}>
                {t.add}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <TouchableOpacity 
          style={[
            styles.addButton,
            { 
              backgroundColor: theme.colors.primary,
              bottom: Math.max(insets.bottom, 15) + 90
            }
          ]}
          onPress={() => setIsAdding(true)}
        >
          <MaterialIcons name="add" size={28} color={theme.colors.background} />
        </TouchableOpacity>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
  },
  headerCounter: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 2,
  },
  infoSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
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
    fontSize: 14,
    lineHeight: 20,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 200,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 40,
  },
  fingerprintCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  fingerprintContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  fingerprintIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  fingerprintText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
  },
  fingerprintFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fingerprintDate: {
    fontSize: 12,
  },
  deleteButton: {
    padding: 4,
  },
  addButton: {
    position: 'absolute',
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#00FFB0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  addFingerprintContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 20,
    borderTopWidth: 1,
  },
  fingerprintInput: {
    borderRadius: 12,
    borderWidth: 2,
    padding: 15,
    fontSize: 16,
    minHeight: 100,
    maxHeight: 150,
    textAlignVertical: 'top',
    marginBottom: 15,
  },
  addFingerprintActions: {
    flexDirection: 'row',
    gap: 10,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

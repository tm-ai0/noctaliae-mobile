import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../config/ThemeContext';
import { useNoctaliaeAlert } from '../components/NoctaliaeAlert';
import DebugScreenLabel from '../components/DebugScreenLabel';
import { useTranslation } from 'react-i18next';

const FINGERPRINTS_KEY = '@noctaliae_user_fingerprints';
const ONBOARDING_COMPLETED_KEY = '@noctaliae_onboarding_completed';

export default function PersonaScreen({ navigation }) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { showAlert, AlertComponent } = useNoctaliaeAlert();
  
  const [fingerprints, setFingerprints] = useState([]);
  const [newFingerprint, setNewFingerprint] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  // 🔧 Fix Android : Détecter le clavier pour ajuster le background
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => setKeyboardVisible(true)
    );
    const keyboardDidHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setKeyboardVisible(false)
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const { t } = useTranslation();

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
      showAlert({
        type: 'error',
        title: t('common.error'),
        message: t('persona.errSave_msg'),
        confirmText: t('common.ok')
      });
    }
  }

  function handleAddFingerprint() {
    const trimmed = newFingerprint.trim();
    
    if (!trimmed) {
      showAlert({
        type: 'warning',
        title: t('persona.validEmpty_title'),
        message: t('persona.validEmpty_msg'),
        confirmText: t('common.ok')
      });
      return;
    }

    if (trimmed.length < 5) {
      showAlert({
        type: 'warning',
        title: t('persona.validShort_title'),
        message: t('persona.validShort_msg'),
        confirmText: t('common.ok')
      });
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
    showAlert({
      type: 'confirm',
      title: t('persona.deleteAlert_title'),
      message: t('persona.deleteAlert_msg'),
      confirmText: t('persona.deleteAlert_confirm'),
      cancelText: t('persona.deleteAlert_cancel'),
      onConfirm: () => {
        const updated = fingerprints.filter(f => f.id !== id);
        saveFingerprints(updated);
      }
    });
  }

  // 🔄 Refaire l'onboarding
  function handleRestartOnboarding() {
    showAlert({
      type: 'confirm',
      title: t('persona.redo'),
      message: t('persona.redoConfirm'),
      confirmText: t('common.ok'),
      cancelText: t('common.cancel'),
      onConfirm: async () => {
        try {
          await AsyncStorage.removeItem(ONBOARDING_COMPLETED_KEY);
          navigation.reset({
            index: 0,
            routes: [{ name: 'OnboardingWelcome' }],
          });
        } catch (error) {
          console.error('❌ Erreur reset onboarding:', error);
        }
      }
    });
  }

  // 🎯 Détection du type d'empreinte
  function detectType(text) {
    // Clé:valeur structuré (from onboarding markers) → ex: "Rythme de vie : calm"
    if (text.includes(' : ') && text.split(' : ')[0].length < 30) return 'structured';
    // Tag court : émoji + 1-2 mots OU texte < 20 car sans espace multiple
    const wordCount = text.trim().split(/\s+/).length;
    if (wordCount <= 3 && text.length <= 25) return 'chip';
    return 'text';
  }

  // Regrouper les chips pour les afficher en ligne
  function renderFingerprints(fps) {
    const chips = fps.filter(f => detectType(f.text) === 'chip');
    const others = fps.filter(f => detectType(f.text) !== 'chip');

    return (
      <>
        {/* CHIPS — tags courts */}
        {chips.length > 0 && (
          <View style={styles.chipsSection}>
            <Text style={[styles.chipsSectionLabel, { color: theme.colors.textSecondary }]}>Tags</Text>
            <View style={styles.chipsRow}>
              {chips.map(fp => (
                <TouchableOpacity
                  key={fp.id}
                  style={[styles.chip, { borderColor: theme.colors.primary, backgroundColor: theme.colors.primaryGlow }]}
                  onPress={() => handleDeleteFingerprint(fp.id)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.chipText, { color: theme.colors.primary }]}>{fp.text}</Text>
                  <MaterialIcons name="close" size={12} color={theme.colors.primary} style={{ marginLeft: 4 }} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
        {/* CARTES — structured + texte libre */}
        {others.map(fp => renderFingerprintCard(fp))}
      </>
    );
  }

  function renderFingerprintCard(fingerprint) {
    const type = detectType(fingerprint.text);
    const date = new Date(fingerprint.createdAt);
    const formattedDate = date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });

    if (type === 'structured') {
      const [key, value] = fingerprint.text.split(' : ');
      return (
        <View key={fingerprint.id} style={[styles.structuredCard, { backgroundColor: theme.colors.cardBackground, borderColor: theme.colors.cardBorder }]}>
          <View style={styles.structuredContent}>
            <Text style={[styles.structuredKey, { color: theme.colors.textSecondary }]}>{key}</Text>
            <Text style={[styles.structuredValue, { color: theme.colors.text }]}>{value}</Text>
          </View>
          <TouchableOpacity onPress={() => handleDeleteFingerprint(fingerprint.id)} style={styles.deleteButton}>
            <MaterialIcons name="close" size={16} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View 
        key={fingerprint.id}
        style={[styles.fingerprintCard, { backgroundColor: theme.colors.cardBackground, borderColor: theme.colors.cardBorder }]}
      >
        <View style={styles.fingerprintContent}>
          <MaterialCommunityIcons name="fingerprint" size={18} color={theme.colors.primary} style={styles.fingerprintIcon} />
          <Text style={[styles.fingerprintText, { color: theme.colors.text }]}>{fingerprint.text}</Text>
        </View>
        <View style={styles.fingerprintFooter}>
          <Text style={[styles.fingerprintDate, { color: theme.colors.textSecondary }]}>{formattedDate}</Text>
          <TouchableOpacity onPress={() => handleDeleteFingerprint(fingerprint.id)} style={styles.deleteButton}>
            <MaterialIcons name="delete-outline" size={18} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* 🔧 Fix Android : Background qui couvre tout l'écran y compris derrière le clavier */}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: theme.colors.background }]} />
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
            name="dna" 
            size={32} 
            color={theme.colors.primary} 
          />
          <View>
            <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
              {t('persona.title')}
            </Text>
            {fingerprints.length > 0 && (
              <Text style={[styles.headerCounter, { color: theme.colors.primary }]}>
                {t('persona.counter', { count: fingerprints.length })}
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
            {t('persona.infoText')}
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
              {t('persona.empty')}
            </Text>
            <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>
              {t('persona.emptySub')}
            </Text>
          </View>
        ) : (
          renderFingerprints(fingerprints)
        )}

        {/* 🔄 Bouton Refaire l'onboarding */}
        <TouchableOpacity
          style={[
            styles.restartOnboardingButton,
            { 
              backgroundColor: theme.colors.cardBackground,
              borderColor: theme.colors.cardBorder
            }
          ]}
          onPress={handleRestartOnboarding}
          activeOpacity={0.7}
        >
          <MaterialIcons name="replay" size={20} color={theme.colors.textSecondary} />
          <Text style={[styles.restartOnboardingText, { color: theme.colors.textSecondary }]}>
            {t('persona.redo')}
          </Text>
        </TouchableOpacity>
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
            placeholder={t('persona.placeholder')}
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
                {t('persona.cancel')}
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
                {t('persona.add')}
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

      {/* 🌙 Alert custom dark mode */}
      <AlertComponent />
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
    fontSize: 32,
    fontFamily: 'CormorantUpright-Bold',
  },
  headerCounter: {
    fontSize: 14,
    fontFamily: 'AtkinsonHyperlegibleNext-Bold',
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
    fontSize: 22,
    fontFamily: 'CormorantUpright-Bold',
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
    fontSize: 17,
    fontFamily: 'AtkinsonHyperlegibleNext-Bold',
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
    fontSize: 17,
    fontFamily: 'AtkinsonHyperlegibleNext-Bold',
  },
  // 🏷️ CHIPS — tags courts
  chipsSection: {
    marginBottom: 16,
  },
  chipsSectionLabel: {
    fontSize: 11,
    fontFamily: 'AtkinsonHyperlegibleNext-Bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  chipText: {
    fontSize: 14,
    fontFamily: 'AtkinsonHyperlegibleNext-Bold',
  },
  // 🎯 STRUCTURED — key:value markers
  structuredCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
    borderWidth: 1,
  },
  structuredContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  structuredKey: {
    fontSize: 12,
    fontFamily: 'AtkinsonHyperlegibleNext-Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    minWidth: 100,
  },
  structuredValue: {
    fontSize: 15,
    fontFamily: 'AtkinsonHyperlegibleNext-Bold',
  },
  // 🔄 Bouton refaire onboarding
  restartOnboardingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 30,
  },
  restartOnboardingText: {
    fontSize: 15,
    fontFamily: 'AtkinsonHyperlegibleNext-Medium',
  },
});

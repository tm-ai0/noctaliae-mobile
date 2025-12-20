import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Switch, 
  ScrollView, 
  TouchableOpacity,
  Platform,
  Linking
} from 'react-native';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { premiumService } from '../services/premiumService';
import { useTheme } from '../config/ThemeContext';
import DebugScreenLabel from '../components/DebugScreenLabel';
import { DeepDreamInfoModal } from '../components/DeepDreamInfoModal';
import { ContributeResearchModal } from '../components/ContributeResearchModal';
import { useNoctaliaeAlert } from '../components/NoctaliaeAlert';
const FINGERPRINTS_KEY = '@noctaliae_user_fingerprints';
const ONBOARDING_COMPLETED_KEY = '@noctaliae_onboarding_completed';
const PLAYGROUND_KOFI_KEY = '@noctaliae_playground_kofi';
const MENU_HINT_KEY = '@noctaliae_menu_hint_shown';
import { ResearchOptInVIP } from '../components/ResearchOptInVIP';
import { useGlow } from '../contexts/GlowContext';
import { getAllDreams, deleteDream } from '../services/storageService';
import BiometricService from '../services/biometricService';

export default function SettingsScreen({ navigation }) {
  const { theme, currentThemeId, changeTheme, availableThemes } = useTheme();
  const { refreshGlowStates } = useGlow();
  const insets = useSafeAreaInsets();
  const { showAlert, AlertComponent } = useNoctaliaeAlert();
  
  const [isPremium, setIsPremium] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [appearanceExpanded, setAppearanceExpanded] = useState(false);
  const [kofiExpanded, setKofiExpanded] = useState(false);
  const [fingerprintCount, setFingerprintCount] = useState(0);
  const [showDeepDreamModal, setShowDeepDreamModal] = useState(false);
  const [kofiStyles, setKofiStyles] = useState(null); // 🎨 Styles du Playground

  useEffect(() => {
    loadPremiumStatus();
    loadFingerprintCount();
  }, []);

  // Focus listener pour rafraîchir le compteur
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadFingerprintCount();
      loadKofiStyles(); // 🎨 Recharger les styles Ko-fi
    });
    return unsubscribe;
  }, [navigation]);

  // 🎨 Charger les styles Ko-fi du Playground
  const loadKofiStyles = async () => {
    try {
      const stored = await AsyncStorage.getItem(PLAYGROUND_KOFI_KEY);
      if (stored) {
        setKofiStyles(JSON.parse(stored));
      }
    } catch (error) {
      console.error('❌ Erreur chargement styles Ko-fi:', error);
    }
  };

  const loadPremiumStatus = async () => {
    try {
      const status = await premiumService.isPremium();
      setIsPremium(status);
    } catch (error) {
      console.error('Erreur chargement statut Premium:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTogglePremium = async (value) => {
    setIsPremium(value);
    
    if (value) {
      await premiumService.enablePremium();
      console.log('🌕 Mode Patron activé');
    } else {
      await premiumService.disablePremium();
      console.log('🌙 Mode Gratuit activé');
    }
    
    refreshGlowStates(); // 🔄 Actualiser le glow global
  };

  const handleThemeChange = async (themeId) => {
    await changeTheme(themeId);
    console.log('🎨 Thème appliqué:', themeId);
  };

  const loadFingerprintCount = async () => {
    try {
      const stored = await AsyncStorage.getItem(FINGERPRINTS_KEY);
      if (stored) {
        // Support multiple formats : array, object map ou valeur simple
        let count = 0;
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            count = parsed.length;
          } else if (parsed && typeof parsed === 'object') {
            count = Object.keys(parsed).length;
          } else {
            // parsed is primitive (string/number), count as 1
            count = 1;
          }
        } catch (e) {
          // stored wasn't JSON (fallback)
          count = 1;
        }
        setFingerprintCount(count);
      } else {
        setFingerprintCount(0);
      }
    } catch (error) {
      console.error('❌ Erreur chargement empreintes:', error);
      setFingerprintCount(0);
    }
  };

  const handleRestartOnboarding = async () => {
    try {
      await AsyncStorage.removeItem(ONBOARDING_COMPLETED_KEY);
      console.log('✅ Flag onboarding supprimé');
      navigation.navigate('OnboardingWelcome');
    } catch (error) {
      console.error('❌ Erreur redémarrage onboarding:', error);
    }
  };

  // 🧪 RESET NEW USER (pour tester le parcours)
  const handleResetNewUser = async () => {
    try {
      await AsyncStorage.multiRemove([
        ONBOARDING_COMPLETED_KEY,
        MENU_HINT_KEY,
        FINGERPRINTS_KEY,
      ]);
      showAlert({
        type: 'success',
        title: 'Reset effectué !',
        message: 'Vous pouvez maintenant tester comme un nouveau utilisateur. Relancez l\'app.',
        confirmText: 'OK'
      });
      console.log('🧪 Reset new user effectué');
    } catch (error) {
      console.error('❌ Erreur reset:', error);
    }
  };

  // 🧪 CLEAR CONVERSATIONS CACHE (pour tester badges)
  const handleClearConversationsCache = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const conversationKeys = keys.filter(key => key.startsWith('@noctaliae_conversation_'));
      if (conversationKeys.length > 0) {
        await AsyncStorage.multiRemove(conversationKeys);
        console.log(`✅ ${conversationKeys.length} conversations supprimées`);
        alert(`Cache nettoyé : ${conversationKeys.length} conversations supprimées`);
      } else {
        console.log('ℹ️ Aucune conversation en cache');
        alert('Aucune conversation en cache');
      }
    } catch (error) {
      console.error('❌ Erreur clear cache conversations:', error);
      alert('Erreur lors du nettoyage');
    }
  };

  const handleKofi = (amount) => {
    const url = amount === 1.99
      ? 'https://ko-fi.com/tm_ai0?amount=1.99'
      : 'https://ko-fi.com/tm_ai0?amount=3.39';
    
    Linking.openURL(url).catch(err => 
      console.error('❌ Erreur ouverture Ko-fi:', err)
    );
  };

  const handleSupport = () => {
    setShowDeepDreamModal(false);
    handleKofi(1.99); // Ouvre Ko-fi
  };

  // 🗑️ Supprimer TOUS les rêves
  const handleDeleteAllDreams = async () => {
    try {
      const allDreams = await getAllDreams();
      for (const dream of allDreams) {
        await deleteDream(dream.id);
      }
      showAlert({
        type: 'success',
        title: 'Terminé',
        message: 'Tous vos rêves ont été supprimés.',
        confirmText: 'OK'
      });
      console.log(`🗑️ ${allDreams.length} rêves supprimés`);
    } catch (error) {
      console.error('❌ Erreur suppression totale:', error);
      showAlert({
        type: 'error',
        title: 'Erreur',
        message: 'Impossible de supprimer les rêves',
        confirmText: 'OK'
      });
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <DebugScreenLabel screenName="⚙️ Paramètres" fileName="SettingsScreen.js" />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: Math.max(insets.top, 15) + 15 }
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header avec icône */}
        <View style={styles.header}>
          <MaterialIcons name="settings" size={32} color={theme.colors.primary} />
          <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
            Paramètres
          </Text>
        </View>
        {/* ❌ BADGE VIOLET SUPPRIMÉ - Design plus épuré */}
        {/* === SECTION 1 : PERSONA === */}
        <View style={[styles.section, { 
          backgroundColor: theme.colors.cardBackground,
          borderColor: theme.colors.cardBorder,
          ...theme.shadow.md 
        }]}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionTitleRow}>
              <MaterialCommunityIcons name="dna" size={24} color={theme.colors.primary} />
              <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
                Persona
              </Text>
            </View>
            {fingerprintCount > 0 && (
              <View style={[styles.badge, { backgroundColor: theme.colors.primary }]}>
                <Text style={[styles.badgeText, { color: theme.colors.background }]}>
                  {fingerprintCount}
                </Text>
              </View>
            )}
          </View>

          <Text style={[styles.sectionSubtitle, { color: theme.colors.textSecondary }]}>
            Pour des analyses sur-mesure et rien qu'a vous.
          </Text>

          <TouchableOpacity 
            style={[styles.personaButton, { 
              backgroundColor: theme.colors.primaryGlow,
              borderColor: theme.colors.primary
            }]}
            onPress={() => navigation.navigate('Persona')}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons 
              name="fingerprint" 
              size={24} 
              color={theme.colors.primary} 
            />
            <View style={styles.personaButtonContent}>
              <Text style={[styles.personaButtonTitle, { color: theme.colors.text }]}>
                Gérer mes empreintes
              </Text>
              <Text style={[styles.personaButtonSubtitle, { color: theme.colors.textSecondary }]}>
                {fingerprintCount === 0 
                  ? 'Aucune empreinte' 
                  : `${fingerprintCount} empreinte${fingerprintCount > 1 ? 's' : ''}`
                }
              </Text>
            </View>
            <MaterialIcons 
              name="chevron-right" 
              size={24} 
              color={theme.colors.textSecondary} 
            />
          </TouchableOpacity>
        </View>

        {/* === SECTION 2 : MODÈLE D'ANALYSE === */}
        <View style={[styles.section, { 
          backgroundColor: theme.colors.cardBackground,
          borderColor: theme.colors.cardBorder,
          ...theme.shadow.md 
        }]}>
         <View style={[styles.sectionTitleRow, { marginBottom: 12 }]}>
            <MaterialCommunityIcons name="brain" size={24} color={theme.colors.primary} />
            <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
              Modèle d'Analyse 
            </Text>
          </View>
          
          {/* 💎 BOUTON MOTEUR ACTIF (Toggle) */}
          <View style={[styles.engineToggleContainer, {
            backgroundColor: isPremium ? 'rgba(79, 141, 255, 0.08)' : 'rgba(57, 255, 136, 0.08)',
            borderColor: isPremium ? 'rgba(79, 141, 255, 0.3)' : 'rgba(57, 255, 136, 0.3)'
          }]}>
            <View style={styles.optionInfo}>
              <View style={styles.optionTitleRow}>
                <MaterialIcons 
                  name={isPremium ? "auto-awesome" : "flash-on"} 
                  size={22} 
                  color={isPremium ? '#4F8DFF' : '#39FF88'} 
                />
                <Text style={[styles.optionTitle, { color: theme.colors.textPrimary }]}>
                  {isPremium ? 'DeepDream Engine' : 'QuickDream'}
                </Text>
              </View>
              <Text style={[styles.optionDescription, { color: theme.colors.textSecondary }]}>
                {isPremium 
                  ? "Claude Sonnet 4.5 - Qualité d'analyses optimales et approfondies."
                  : 'Llama 3.3 70B - Gratuit et illimité pour des analyses rapides et efficaces.'
                }
              </Text>
            </View>
            
            <Switch
              value={isPremium}
              onValueChange={handleTogglePremium}
              disabled={isLoading}
              trackColor={{ false: '#39FF88', true: '#4F8DFF' }}
              thumbColor={'#FFFFFF'}
              ios_backgroundColor={theme.colors.backgroundElevated}
            />
          </View>

          {/* 🔓 INFO DEEPDREAM */}
          <TouchableOpacity
            style={[styles.engineInfoButton, { borderColor: theme.colors.cardBorder }]}
            onPress={() => setShowDeepDreamModal(true)}
            activeOpacity={0.7}
          >
            <MaterialIcons name="info-outline" size={20} color={theme.colors.primary} />
            <Text style={[styles.engineInfoText, { color: theme.colors.primary }]}>
              En savoir plus sur DeepDream Engine
            </Text>
            <MaterialIcons name="chevron-right" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Badge Premium */}
        {isPremium && (
          <View style={[styles.premiumBadge, { 
            backgroundColor: theme.colors.deepAnalysisSubtle,
            borderColor: theme.colors.deepAnalysis
          }]}>
            <Text style={[styles.premiumBadgeText, { color: theme.colors.textPrimary }]}>
            Vous testez actuellement DeepDream Engine
            </Text>
            <Text style={[styles.premiumBadgeSubtext, { color: theme.colors.textSecondary }]}>
              Accessible aujourdh'ui grace à votre soutien
            </Text>
          </View>
        )}

        {/* === SECTION 3 : CONFIDENTIALITÉ === */}
        <View style={[styles.section, { 
          backgroundColor: theme.colors.cardBackground,
          borderColor: theme.colors.cardBorder,
          ...theme.shadow.md 
        }]}>
          <View style={[styles.sectionTitleRow, { marginBottom: 12 }]}>
            <MaterialCommunityIcons name="key-variant" size={24} color={theme.colors.primary} />
            <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
              Confidentialité
            </Text>
          </View>
          
          <Text style={[styles.journalIntimeText, { color: theme.colors.textSecondary }]}>
            Noctaliæ fonctionne comme un journal intime. Vos données restent sur votre appareil.
          </Text>

          {/* 🔐 Bouton Rêves secrets */}
          <TouchableOpacity 
            style={[styles.privacyActionButton, { 
              backgroundColor: 'rgba(139, 92, 246, 0.1)',
              borderColor: 'rgba(139, 92, 246, 0.3)'
            }]}
            onPress={async () => {
              const authenticated = await BiometricService.authenticateForSecrets();
              if (authenticated) {
                navigation.navigate('Analyses', { showOnlySecrets: true });
              }
            }}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="lock" size={24} color="#8B5CF6" />
            <View style={styles.privacyActionContent}>
              <Text style={[styles.privacyActionTitle, { color: theme.colors.textPrimary }]}>
                Rêves protégés
              </Text>
              <Text style={[styles.privacyActionSubtitle, { color: theme.colors.textSecondary }]}>
                Vos rêves les plus personnels
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={theme.colors.textSecondary} />
          </TouchableOpacity>

          {/* 📋 Bouton Gérer mes rêves */}
          <TouchableOpacity 
            style={[styles.privacyActionButton, { 
              backgroundColor: 'rgba(57, 255, 136, 0.1)',
              borderColor: 'rgba(57, 255, 136, 0.3)'
            }]}
            onPress={() => navigation.navigate('Analyses', { startInSelectionMode: true })}
            activeOpacity={0.7}
          >
            <MaterialIcons name="checklist" size={24} color="#39FF88" />
            <View style={styles.privacyActionContent}>
              <Text style={[styles.privacyActionTitle, { color: theme.colors.textPrimary }]}>
                Gérer mes rêves
              </Text>
              <Text style={[styles.privacyActionSubtitle, { color: theme.colors.textSecondary }]}>
                Sélectionner, supprimer ou archiver
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={theme.colors.textSecondary} />
          </TouchableOpacity>

          {/* 📱 Mention stockage */}
          <View style={styles.storageNote}>
            <MaterialIcons name="smartphone" size={16} color={theme.colors.textSecondary} />
            <Text style={[styles.storageNoteText, { color: theme.colors.textSecondary }]}>
              Stocké seulement sur votre appareil.
            </Text>
          </View>
        </View>

        {/* === SECTION 4 : RECHERCHE === */}
        <View style={[styles.section, { 
          backgroundColor: theme.colors.cardBackground,
          borderColor: theme.colors.cardBorder,
          ...theme.shadow.md 
        }]}>
          <View style={[styles.sectionTitleRow, { marginBottom: 12 }]}>
            <MaterialIcons name="science" size={24} color={theme.colors.primary} />
            <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
              Recherche
            </Text>
          </View>
          
          {/* Composant Recherche VIP */}
          <ResearchOptInVIP />
        </View>

        {/* === SECTION SOUTENIR (KO-FI) 💚 === */}
        <View style={[styles.section, { 
          backgroundColor: theme.colors.cardBackground,
          borderColor: theme.colors.cardBorder,
          ...theme.shadow.md 
        }]}>
          <View style={[styles.sectionTitleRow, { marginBottom: 12 }]}>
            <MaterialIcons name="favorite" size={20} color="#ff004cff" />
            <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>
              Soutenir Noctaliæ
            </Text>
          </View>

          <Text style={[styles.sectionSubtitle, { color: theme.colors.textSecondary }]}>  
            Noctaliæ est gratuit et le restera. Votre soutien permet d'en financer le développement et de participer à son évolution.
          </Text>

          {/* Bouton En savoir plus */}
          <TouchableOpacity
            style={[styles.learnMoreButton, { 
              backgroundColor: theme.colors.primaryGlow,
              borderColor: theme.colors.primary
            }]}
            onPress={() => Linking.openURL('https://noctaliae-app.notion.site/Soutient-et-mon-tisation-Noctali-29b976346b3681b596a3e0fdc0584cdf')}
            activeOpacity={0.7}
          >
            <MaterialIcons name="info-outline" size={20} color={theme.colors.primary} />
            <Text style={[styles.learnMoreText, { color: theme.colors.primary }]}>
              En savoir plus sur la philosophie Noctaliæ
            </Text>
            <MaterialIcons name="open-in-new" size={18} color={theme.colors.primary} />
          </TouchableOpacity>

          {/* 💚 Bouton Café - Neon (🔧 FIX: Styles fixes pour cohérence) */}
          <TouchableOpacity
            style={styles.kofiButton}
            onPress={() => handleKofi(1.99)}
            activeOpacity={0.8}
          >
            <View style={styles.kofiContent}>
              <View style={styles.kofiLeft}>
                <MaterialIcons name="local-cafe" size={28} color="#39FF88" />
                <View style={styles.kofiTextContainer}>
                  <Text style={[styles.kofiTitle, { color: theme.colors.textPrimary }]}>Un café</Text>
                  <Text style={[styles.kofiSubtitle, { color: theme.colors.textSecondary }]}>~13 analyses DeepDream</Text>
                </View>
              </View>
              <Text style={styles.kofiPrice}>1,99€</Text>
            </View>
          </TouchableOpacity>

          {/* 💚 Bouton P'tit Déj - Neon (🔧 FIX: Styles fixes pour cohérence) */}
          <TouchableOpacity
            style={[styles.kofiButton, { marginBottom: 0 }]}
            onPress={() => handleKofi(3.39)}
            activeOpacity={0.8}
          >
            <View style={styles.kofiContent}>
              <View style={styles.kofiLeft}>
                <MaterialIcons name="restaurant" size={28} color="#39FF88" />
                <View style={styles.kofiTextContainer}>
                  <Text style={[styles.kofiTitle, { color: theme.colors.textPrimary }]}>Un p'tit déj</Text>
                  <Text style={[styles.kofiSubtitle, { color: theme.colors.textSecondary }]}>~23 analyses DeepDream</Text>
                </View>
              </View>
              <Text style={styles.kofiPrice}>3,39€</Text>
            </View>
          </TouchableOpacity>
        </View>


        {/* === SECTION AIDE === */}
        <View style={[styles.section, { 
          backgroundColor: theme.colors.cardBackground,
          borderColor: theme.colors.cardBorder,
          ...theme.shadow.md 
        }]}>
          <View style={styles.sectionTitleRow}>
            <MaterialIcons name="help-outline" size={24} color={theme.colors.primary} />
            <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
              Aide
            </Text>
          </View>
          
          <TouchableOpacity 
            style={[styles.helpButton, { borderBottomColor: theme.colors.cardBorder }]}
            onPress={handleRestartOnboarding}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons 
              name="restart" 
              size={24} 
              color={theme.colors.primary} 
            />
            <View style={styles.helpButtonContent}>
              <Text style={[styles.helpButtonTitle, { color: theme.colors.text }]}>
                Refaire l'onboarding
              </Text>
              <Text style={[styles.helpButtonSubtitle, { color: theme.colors.textSecondary }]}>
                Recommencer la configuration initiale
              </Text>
            </View>
            <MaterialIcons 
              name="chevron-right" 
              size={24} 
              color={theme.colors.textSecondary} 
            />
          </TouchableOpacity>

          {/* 🧪 Bouton Reset New User */}
          <TouchableOpacity 
            style={[styles.helpButton, { borderBottomColor: theme.colors.cardBorder, borderBottomWidth: 0 }]}
            onPress={handleResetNewUser}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons 
              name="test-tube" 
              size={24} 
              color="#F59E0B" 
            />
            <View style={styles.helpButtonContent}>
              <Text style={[styles.helpButtonTitle, { color: theme.colors.text }]}>
                🧪 Reset New User
              </Text>
              <Text style={[styles.helpButtonSubtitle, { color: theme.colors.textSecondary }]}>
                Tester le parcours nouveau utilisateur
              </Text>
            </View>
            <MaterialIcons 
              name="chevron-right" 
              size={24} 
              color={theme.colors.textSecondary} 
            />
          </TouchableOpacity>
        </View>

        {/* === INFOS === */}
        <View style={[styles.infoSection, { borderTopColor: theme.colors.dividerStrong }]}>
          <View style={styles.sectionTitleRow}>
            <MaterialIcons name="info-outline" size={24} color={theme.colors.textSecondary} />
            <Text style={[styles.infoTitle, { color: theme.colors.textPrimary }]}>
              À propos
            </Text>
          </View>
          <Text style={[styles.infoTextBottom, { color: theme.colors.textSecondary }]}>
            Noctaliæ - Analyse scientifique des rêves{'\n'}
            Version: Beta 0.9.13
          </Text>
          
          {/* 📜 Lien Privacy Policy */}
          <TouchableOpacity 
            onPress={() => Linking.openURL('https://nocty.thomasmaury.fr/privacy.html')}
            activeOpacity={0.7}
            style={[styles.privacyLink, { borderBottomColor: theme.colors.cardBorder }]}
          >
            <MaterialIcons name="privacy-tip" size={18} color={theme.colors.primary} />
            <Text style={[styles.privacyLinkText, { color: theme.colors.primary }]}>
              Politique de confidentialité
            </Text>
            <MaterialIcons name="open-in-new" size={14} color={theme.colors.primary} />
          </TouchableOpacity>

          {/* 👤 Lien créateur */}
          <TouchableOpacity 
            onPress={() => Linking.openURL('https://linktr.ee/thomasmaury')}
            activeOpacity={0.7}
            style={styles.creatorLink}
          >
            <Text style={[styles.creatorText, { color: theme.colors.textSecondary }]}>
              Conçu par{' '}
            </Text>
            <Text style={[styles.creatorName, { color: theme.colors.primary }]}>
              Thomas Maury
            </Text>
            <MaterialIcons name="open-in-new" size={14} color={theme.colors.primary} style={{ marginLeft: 4 }} />
          </TouchableOpacity>
        </View>
        
        {/* Padding en bas pour voir "À propos" correctement */}
        <View style={{ height: 200 }} />
      </ScrollView>

      {/* 🎯 MODAL DEEPDREAM INFO */}
      <DeepDreamInfoModal 
        visible={showDeepDreamModal}
        onClose={() => setShowDeepDreamModal(false)}
        onSupport={handleSupport}
      />
      
      {/* 🌙 Alert custom Noctaliaæ */}
      <AlertComponent />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
  },
  
  // === SECTIONS ===
  section: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: 12,
  },
  kofiIntroText: {
    fontSize: 50,
    lineHeight: 22,
    marginBottom: 16,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '700',
  },

  // 💎 ENGINE TOGGLE CONTAINER (nouveau)
  engineToggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  engineInfoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    gap: 8,
  },
  engineInfoText: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },

  // === PERSONA BUTTON ===
  personaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  personaButtonContent: {
    flex: 1,
  },
  personaButtonTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  personaButtonSubtitle: {
    fontSize: 13,
  },

  // === HELP BUTTON ===
  helpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 12,
    borderBottomWidth: 1,
  },
  helpButtonContent: {
    flex: 1,
  },
  helpButtonTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  helpButtonSubtitle: {
    fontSize: 13,
  },
  
  // === PREMIUM ===
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionInfo: {
    flex: 1,
    marginRight: 15,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 5,
  },
  optionDescription: {
    fontSize: 14,
  },
  premiumBadge: {
  borderRadius: 16,
  padding: 16,
  marginBottom: 16,
  alignItems: 'center',
  borderWidth: 1.5,
  overflow: 'hidden',  // 🔧 FIX GLOW CORNERS
},
  premiumBadgeText: {
    fontSize: 14, // 🔧 FIX: Réduit de 16 à 14 pour éviter retour ligne
    fontWeight: '700',
    textAlign: 'center',
  },
  premiumBadgeSubtext: {
    fontSize: 11, // 🔧 FIX: Réduit de 12 à 11
    marginTop: 4,
    textAlign: 'center',
  },
  
  // === THÈMES (AVEC TOGGLE) ===
  themeGroupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 20,
    marginBottom: 12,
  },
  themeGroupTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  themeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 8,
  },
  themeInfo: {
    flex: 1,
    marginRight: 15,
  },
  themeOptionName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  themeOptionDescription: {
    fontSize: 13,
  },
  
  // === INFOS ===
  infoSection: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
  },
  infoTextBottom: {
    fontSize: 14,
    lineHeight: 20,
  },
  
  // Styles manquants
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  optionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 5,
  },
  
  // === KO-FI BUTTONS (🔧 FIX: Styles fixes pour cohérence entre devices) ===
  kofiButton: {
    backgroundColor: '#39ff8826',
    borderWidth: 1.5,
    borderColor: '#39FF88',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  kofiContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  kofiLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1, // 🔧 FIX: Prend l'espace restant
  },
  kofiTextContainer: {
    flex: 1, // 🔧 FIX: Évite débordement texte
    marginRight: 8,
  },
  kofiTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  kofiSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  kofiPrice: {
    fontSize: 22,
    fontWeight: '700',
    color: '#39FF88',
    minWidth: 60, // 🔧 FIX: Largeur min pour alignement
    textAlign: 'right',
  },
  
  // === LEARN MORE BUTTON ===
  learnMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    gap: 8,
  },
  learnMoreText: {
    fontSize: 14,
    fontWeight: '600',
  },
  
  // === PRIVACY SECTION STYLES ===
  journalIntimeText: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'left',
    marginBottom: 20,
  },
  privacyActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    gap: 12,
  },
  privacyActionContent: {
    flex: 1,
  },
  privacyActionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  privacyActionSubtitle: {
    fontSize: 13,
  },
  storageNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  storageNoteText: {
    fontSize: 13,
  },
  
  // === PRIVACY LINK ===
  privacyLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  privacyLinkText: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  
  // === CREATOR LINK ===
  creatorLink: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  creatorText: {
    fontSize: 14,
  },
  creatorName: {
    fontSize: 14,
    fontWeight: '600',
  },
});
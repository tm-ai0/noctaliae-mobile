import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Switch, 
  ScrollView, 
  TouchableOpacity,
  Platform
} from 'react-native';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { premiumService } from '../services/premiumService';
import { useTheme } from '../config/ThemeContext';
import DebugScreenLabel from '../components/DebugScreenLabel';

const FINGERPRINTS_KEY = '@noctaliae_user_fingerprints';
const ONBOARDING_COMPLETED_KEY = '@noctaliae_onboarding_completed';

export default function SettingsScreen({ navigation }) {
  const { theme, currentThemeId, changeTheme, availableThemes } = useTheme();
  const insets = useSafeAreaInsets();
  
  const [isPremium, setIsPremium] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [appearanceExpanded, setAppearanceExpanded] = useState(false);
  const [fingerprintCount, setFingerprintCount] = useState(0);

  useEffect(() => {
    loadPremiumStatus();
    loadFingerprintCount();
  }, []);

  // Focus listener pour rafraîchir le compteur
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadFingerprintCount();
    });
    return unsubscribe;
  }, [navigation]);

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
  };

  const handleThemeChange = async (themeId) => {
    await changeTheme(themeId);
    console.log('🎨 Thème appliqué:', themeId);
  };

  const loadFingerprintCount = async () => {
    try {
      const stored = await AsyncStorage.getItem(FINGERPRINTS_KEY);
      if (stored) {
        const fingerprints = JSON.parse(stored);
        setFingerprintCount(fingerprints.length);
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
        {/* Header */}
        <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
          Paramètres
        </Text>
        
        {/* === SECTION 1 : PERSONA === */}
        <View style={[styles.section, { 
          backgroundColor: theme.colors.cardBackground,
          borderColor: theme.colors.cardBorder,
          ...theme.shadow.md 
        }]}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
              🎭 Persona
            </Text>
            {fingerprintCount > 0 && (
              <View style={[styles.badge, { backgroundColor: theme.colors.primary }]}>
                <Text style={[styles.badgeText, { color: theme.colors.background }]}>
                  {fingerprintCount}
                </Text>
              </View>
            )}
          </View>
          
          <Text style={[styles.sectionSubtitle, { color: theme.colors.textSecondary }]}>
            Tes empreintes personnelles pour des analyses sur-mesure
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

        {/* === SECTION 2 : INTELLIGENCE (ex-Premium) === */}
        <View style={[styles.section, { 
          backgroundColor: theme.colors.cardBackground,
          borderColor: theme.colors.cardBorder,
          ...theme.shadow.md 
        }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
            ⭐ Intelligence
          </Text>
          
          <View style={styles.optionRow}>
            <View style={styles.optionInfo}>
              <Text style={[styles.optionTitle, { color: theme.colors.textPrimary }]}>
                {isPremium ? '🌕 DeepDream' : '🌙 QuickDream'}
              </Text>
              <Text style={[styles.optionDescription, { color: theme.colors.textSecondary }]}>
                {isPremium 
                  ? 'Claude Sonnet 4.5 - Qualité maximale'
                  : 'Llama 3.3 70B - Gratuit et illimité'
                }
              </Text>
            </View>
            
            <Switch
              value={isPremium}
              onValueChange={handleTogglePremium}
              disabled={isLoading}
              trackColor={{ false: theme.colors.textMuted, true: theme.colors.primary }}
              thumbColor={theme.colors.textPrimary}
              ios_backgroundColor={theme.colors.backgroundElevated}
            />
          </View>
        </View>

        {/* Badge Premium */}
        {isPremium && (
          <View style={[styles.premiumBadge, { 
            backgroundColor: theme.colors.deepAnalysisSubtle,
            borderColor: theme.colors.deepAnalysis
          }]}>
            <Text style={[styles.premiumBadgeText, { color: theme.colors.textPrimary }]}>
              🌕 Vous testez actuellement DeepDream
            </Text>
            <Text style={[styles.premiumBadgeSubtext, { color: theme.colors.textSecondary }]}>
              Accessible avec votre soutien
            </Text>
          </View>
        )}

        {/* === SECTION 3 : APPARENCE (AVEC TOGGLE) === */}
        <View style={[styles.section, { 
          backgroundColor: theme.colors.cardBackground,
          borderColor: theme.colors.cardBorder,
          ...theme.shadow.md 
        }]}>
          {/* 🆕 HEADER DÉPLOYABLE */}
          <TouchableOpacity 
            style={styles.sectionHeader}
            onPress={() => setAppearanceExpanded(!appearanceExpanded)}
            activeOpacity={0.7}
          >
            <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
              🎨 Apparence
            </Text>
            <MaterialIcons 
              name={appearanceExpanded ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
              size={24} 
              color={theme.colors.textSecondary} 
            />
          </TouchableOpacity>
          
          {/* 🆕 CONTENU DÉPLOYABLE */}
          {appearanceExpanded && (
            <>
              <Text style={[styles.sectionSubtitle, { color: theme.colors.textSecondary }]}>  
                Choisissez un thème pour personnaliser l'app
              </Text>

              {/* 🆓 Thèmes Gratuits */}
              <Text style={[styles.themeGroupTitle, { color: theme.colors.textPrimary }]}>
                🆓 Gratuits
              </Text>
              {availableThemes.filter(t => !t.isPremium).map((themeOption) => (
                <View key={themeOption.id} style={styles.themeRow}>
                  <View style={styles.themeInfo}>
                    <Text style={[styles.themeOptionName, { color: theme.colors.textPrimary }]}>
                      {themeOption.name}
                    </Text>
                    <Text style={[styles.themeOptionDescription, { color: theme.colors.textSecondary }]}>
                      {themeOption.description}
                    </Text>
                  </View>
                  
                  <Switch
                    value={currentThemeId === themeOption.id}
                    onValueChange={() => handleThemeChange(themeOption.id)}
                    trackColor={{ false: theme.colors.textMuted, true: theme.colors.primary }}
                    thumbColor={theme.colors.textPrimary}
                    ios_backgroundColor={theme.colors.backgroundElevated}
                  />
                </View>
              ))}

              {/* ⭐ Thèmes Premium */}
              <Text style={[styles.themeGroupTitle, { color: theme.colors.textPrimary, marginTop: 20 }]}>
                ⭐ Premium
              </Text>
              {availableThemes.filter(t => t.isPremium).map((themeOption) => (
                <View key={themeOption.id} style={styles.themeRow}>
                  <View style={styles.themeInfo}>
                    <Text style={[styles.themeOptionName, { color: theme.colors.textPrimary }]}>
                      {themeOption.name}
                    </Text>
                    <Text style={[styles.themeOptionDescription, { color: theme.colors.textSecondary }]}>
                      {themeOption.description}
                    </Text>
                  </View>
                  
                  <Switch
                    value={currentThemeId === themeOption.id}
                    onValueChange={() => handleThemeChange(themeOption.id)}
                    trackColor={{ false: theme.colors.textMuted, true: theme.colors.primary }}
                    thumbColor={theme.colors.textPrimary}
                    ios_backgroundColor={theme.colors.backgroundElevated}
                    disabled={!isPremium}
                  />
                </View>
              ))}
            </>
          )}
        </View>

        {/* === SECTION AIDE === */}
        <View style={[styles.section, { 
          backgroundColor: theme.colors.cardBackground,
          borderColor: theme.colors.cardBorder,
          ...theme.shadow.md 
        }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
            ❓ Aide
          </Text>
          
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
        </View>

        {/* === INFOS === */}
        <View style={[styles.infoSection, { borderTopColor: theme.colors.dividerStrong }]}>
          <Text style={[styles.infoTitle, { color: theme.colors.textPrimary }]}>
            ℹ️ À propos
          </Text>
          <Text style={[styles.infoTextBottom, { color: theme.colors.textSecondary }]}>
            Noctaliæ - Analyse scientifique des rêves{'\n'}
            Version: MVP 1.0 (Phase 1.7)
          </Text>
        </View>
        
        {/* Padding en bas pour voir "À propos" correctement */}
        <View style={{ height: 200 }} />
      </ScrollView>
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
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 30,
  },
  
  // === SECTIONS ===
  section: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: 20,
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
    padding: 15,
    marginBottom: 20,
    alignItems: 'center',
    borderWidth: 1.5,
  },
  premiumBadgeText: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  premiumBadgeSubtext: {
    fontSize: 12,
    marginTop: 5,
    textAlign: 'center',
  },
  
  // === THÈMES (AVEC TOGGLE) ===
  themeGroupTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
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
});

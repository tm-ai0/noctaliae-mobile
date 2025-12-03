import React, { useState, useEffect } from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { THEME } from '../config/theme';
import { ResearchOptInModal } from './ResearchOptInModal';

const RESEARCH_OPT_IN_KEY = '@noctaliae_research_opt_in';

export function ResearchOptIn() {
  const [isOptedIn, setIsOptedIn] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadOptInStatus();
  }, []);

  const loadOptInStatus = async () => {
    try {
      const status = await AsyncStorage.getItem(RESEARCH_OPT_IN_KEY);
      setIsOptedIn(status === 'true');
    } catch (error) {
      console.error('❌ Erreur chargement opt-in:', error);
    }
  };

  const handleToggle = async (value) => {
    if (value) {
      setShowModal(true);
    } else {
      await AsyncStorage.setItem(RESEARCH_OPT_IN_KEY, 'false');
      setIsOptedIn(false);
      console.log('🔬 Opt-in recherche désactivé');
    }
  };

  const handleAccept = async () => {
    await AsyncStorage.setItem(RESEARCH_OPT_IN_KEY, 'true');
    setIsOptedIn(true);
    setShowModal(false);
    console.log('🔬 Opt-in recherche activé');
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <>
      <View style={styles.container}>
        <View style={styles.row}>
          <View style={styles.iconContainer}>
            <View style={[styles.iconCircle, { backgroundColor: 'rgba(79, 141, 255, 0.15)' }]}>
              <MaterialCommunityIcons name="flask" size={20} color="#4F8DFF" />
            </View>
          </View>

          <View style={styles.textContainer}>
            <Text style={[styles.title, { color: THEME.colors.textPrimary }]}>
              Contribuer à la recherche
            </Text>
            <Text style={[styles.subtitle, { color: THEME.colors.textSecondary }]}>
              Partager les analyses de mes rêves avec des chercheurs
            </Text>
          </View>

          <Switch
            value={isOptedIn}
            onValueChange={handleToggle}
            trackColor={{ 
              false: THEME.colors.dividerStrong, 
              true: 'rgba(79, 141, 255, 0.4)'
            }}
            thumbColor={isOptedIn ? '#4F8DFF' : THEME.colors.textSecondary}
            ios_backgroundColor={THEME.colors.dividerStrong}
          />
        </View>
        
        {isOptedIn && (
          <View style={[styles.infoBox, { 
            backgroundColor: 'rgba(79, 141, 255, 0.08)',
            borderLeftColor: '#4F8DFF'
          }]}>
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="check-circle" size={16} color="#4F8DFF" />
              <Text style={[styles.infoText, { color: THEME.colors.textPrimary }]}>
                Vos rêves sont anonymisés puis chiffrés avant partage
              </Text>
            </View>
            
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="flask" size={16} color="#4F8DFF" />
              <Text style={[styles.infoText, { color: THEME.colors.textPrimary }]}>
                Ils aident des chercheurs comme Isabelle Arnulf
              </Text>
            </View>
            
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="moon-waning-crescent" size={16} color="#4F8DFF" />
              <Text style={[styles.infoText, { color: THEME.colors.textPrimary }]}>
                Merci de faire avancer la science des rêves !
              </Text>
            </View>
          </View>
        )}
      </View>

      <ResearchOptInModal
        visible={showModal}
        onClose={handleCloseModal}
        onAccept={handleAccept}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: THEME.colors.cardBackground,
    borderRadius: THEME.borderRadius.lg,
    padding: THEME.spacing.md,
    marginBottom: THEME.spacing.md,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: THEME.fontSize.base,
    fontWeight: THEME.fontWeight.semibold,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: THEME.fontSize.sm,
    lineHeight: 18,
  },
  infoBox: {
    marginTop: 12,
    padding: 12,
    borderRadius: THEME.borderRadius.md,
    borderLeftWidth: 3,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    flex: 1,
    fontSize: THEME.fontSize.xs,
    lineHeight: 16,
    marginLeft: 8,
  },
});
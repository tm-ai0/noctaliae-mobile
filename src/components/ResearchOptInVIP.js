import React, { useState, useEffect } from 'react';
import { View, Text, Switch, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { THEME } from '../config/theme';
import { ContributeResearchModal } from './ContributeResearchModal';
import { useGlow } from '../contexts/GlowContext';

const RESEARCH_OPT_IN_KEY = '@noctaliae_research_opt_in';

export function ResearchOptInVIP() {
  const [isOptedIn, setIsOptedIn] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [glowAnim] = useState(new Animated.Value(0));
  const { refreshGlowStates } = useGlow();

  useEffect(() => {
    loadOptInStatus();
  }, []);

  useEffect(() => {
    if (isOptedIn) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
          Animated.timing(glowAnim, { toValue: 0, duration: 2000, useNativeDriver: true }),
        ])
      ).start();
    }
  }, [isOptedIn]);

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
      refreshGlowStates(); // 🔄 Actualiser le glow global
    }
  };

  const handleAccept = async () => {
    await AsyncStorage.setItem(RESEARCH_OPT_IN_KEY, 'true');
    setIsOptedIn(true);
    setShowModal(false);
    refreshGlowStates(); // 🔄 Actualiser le glow global
  };

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });

  return (
    <>
      <View style={[
        styles.container,
        isOptedIn && styles.containerActive
      ]}>
        {/* Glow effect when active */}
        {isOptedIn && (
          <Animated.View style={[styles.glowEffect, { opacity: glowOpacity }]} />
        )}

        <View style={styles.row}>
          <View style={[styles.iconCircle, isOptedIn && styles.iconCircleActive]}>
            <MaterialCommunityIcons 
              name={isOptedIn ? "flask-outline" : "flask"} 
              size={24} 
              color={isOptedIn ? "#00FFB0" : "#666"} 
            />
          </View>

          <View style={styles.textContainer}>
            <Text style={[styles.title, isOptedIn && styles.titleActive]}>
              Contribuer à la recherche
            </Text>
            <Text style={[styles.subtitle, isOptedIn && styles.subtitleActive]}>
              {isOptedIn 
                ? "Vous participez à faire avancer la science des rêves !" 
                : "Partager vos analyses pour aider la recherche sur les rêves."}
            </Text>
            {!isOptedIn && (
              <TouchableOpacity 
                onPress={() => setShowModal(true)}
                style={styles.learnMoreButton}
              >
                <Text style={styles.learnMoreText}>
                  En savoir plus →
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <Switch
            value={isOptedIn}
            onValueChange={handleToggle}
            trackColor={{ false: '#333', true: '#4F8DFF80' }}
            thumbColor={isOptedIn ? '#4F8DFF' : '#666'}
          />
        </View>
        
        {isOptedIn && (
          <View style={styles.contributorBadge}>
            <View style={styles.badgeContent}>
              <MaterialCommunityIcons name="brain" size={16} color="#6B5CFF" />
              <Text style={styles.badgeText}>
                Le résultats de vos analyses rêves aident la DreamTeam (ICM Paris).
              </Text>
            </View>
          </View>
        )}
      </View>

      <ContributeResearchModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        onActivate={handleAccept}
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
    position: 'relative',
    overflow: 'hidden',
  },
  containerActive: {
    borderColor: 'rgba(79, 141, 255, 0.5)',
    backgroundColor: 'rgba(79, 141, 255, 0.05)',
  },
  glowEffect: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(79, 141, 255, 0.1)',
    borderRadius: THEME.borderRadius.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: 'rgba(100, 100, 100, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconCircleActive: {
    backgroundColor: 'rgba(79, 141, 255, 0.2)',
  },
  textContainer: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
    marginBottom: 4,
  },
  titleActive: {
    color: '#DDE2EA',
  },
  subtitle: {
    fontSize: 13,
    color: THEME.colors.textSecondary,
    lineHeight: 18,
  },
  subtitleActive: {
    color: '#00FFB0',
    fontWeight: '600',
  },
  learnMoreButton: {
    marginTop: 6,
  },
  learnMoreText: {
    fontSize: 13,
    color: '#4F8DFF',
    fontWeight: '600',
  },
  contributorBadge: {
    marginTop: 12,
    padding: 12,
    backgroundColor: 'rgba(79, 141, 255, 0.1)',
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#4F8DFF',
  },
  badgeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badgeText: {
    flex: 1,
    fontSize: 13,
    color: '#DDE2EA',
    fontWeight: '600',
    lineHeight: 18,
  },
});

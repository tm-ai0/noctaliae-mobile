import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { THEME } from '../config/theme';
import { ContributeResearchModal } from './ContributeResearchModal';

const VOTE_KEY = '@noctaliae_vote_research';

// 📊 Google Form pour voter (remplace par ton lien)
const VOTE_FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSe9TVWMzCk761X4jLwoGBR53WNyfPirQD_EjdWhxRvvOlhaNg/viewform';

export function ResearchOptInVIP() {
  const [showModal, setShowModal] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(VOTE_KEY).then(v => {
      if (v === 'true') setHasVoted(true);
    });
  }, []);

  const handleVote = async () => {
    setHasVoted(true);
    setShowModal(false);
    await AsyncStorage.setItem(VOTE_KEY, 'true');
    Linking.openURL(VOTE_FORM_URL);
  };

  const openKofi = () => {
    Linking.openURL('https://ko-fi.com/tm_ai0');
  };

  return (
    <>
      <View style={styles.container}>
        <View style={styles.row}>
          <View style={styles.iconCircle}>
            <MaterialCommunityIcons 
              name="flask" 
              size={24} 
              color={hasVoted ? "#00FFB0" : "#666"} 
            />
          </View>

          <View style={styles.textContainer}>
            <Text style={styles.title}>
              Contribuer à la recherche
            </Text>
            <Text style={styles.subtitle}>
              {hasVoted
                ? "Merci pour votre intérêt ! On vous tiendra informé."
                : "Bientôt : partagez vos analyses anonymement pour la science."}
            </Text>
          </View>
        </View>

        {/* Info card */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="brain" size={16} color="#4F8DFF" />
            <Text style={styles.infoText}>
              Vos analyses pourront être partagées anonymement avec des labos vérifiés (DreamTeam ICM Paris, Walker Lab UC Berkeley...).
            </Text>
          </View>
          <View style={styles.betaWarning}>
            <MaterialCommunityIcons name="flask-outline" size={14} color="#F59E0B" />
            <Text style={styles.betaWarningText}>
              Bientôt disponible — aucun envoi actif
            </Text>
          </View>
        </View>

        {/* CTA Buttons */}
        <View style={styles.ctaContainer}>
          {!hasVoted ? (
            <TouchableOpacity 
              style={styles.voteButton}
              onPress={() => setShowModal(true)}
              activeOpacity={0.8}
            >
              <MaterialIcons name="thumb-up" size={18} color="#0c0e27" />
              <Text style={styles.voteButtonText}>Ça m'intéresse !</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.votedBadge}>
              <MaterialIcons name="check-circle" size={18} color="#00FFB0" />
              <Text style={styles.votedText}>Vote enregistré</Text>
            </View>
          )}

          <TouchableOpacity 
            style={styles.kofiButton}
            onPress={openKofi}
            activeOpacity={0.8}
          >
            <Text style={styles.kofiEmoji}>☕</Text>
            <Text style={styles.kofiButtonText}>Soutenir</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ContributeResearchModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        onActivate={handleVote}
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
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: 'rgba(100, 100, 100, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: THEME.colors.textSecondary,
    lineHeight: 18,
  },
  infoCard: {
    marginTop: 12,
    padding: 12,
    backgroundColor: 'rgba(79, 141, 255, 0.08)',
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#4F8DFF',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: THEME.colors.textSecondary,
    lineHeight: 18,
  },
  betaWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(245, 158, 11, 0.2)',
    gap: 6,
  },
  betaWarningText: {
    fontSize: 12,
    color: '#F59E0B',
    fontWeight: '600',
  },
  ctaContainer: {
    flexDirection: 'row',
    marginTop: 14,
    gap: 10,
  },
  voteButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4F8DFF',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  voteButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0c0e27',
  },
  votedBadge: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 255, 176, 0.1)',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 176, 0.3)',
  },
  votedText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#00FFB0',
  },
  kofiButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(57, 255, 136, 0.1)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(57, 255, 136, 0.3)',
  },
  kofiEmoji: {
    fontSize: 16,
  },
  kofiButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#39FF88',
  },
});

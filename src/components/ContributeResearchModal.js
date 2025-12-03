import React from 'react';
import { View, Text, StyleSheet, Modal, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { THEME } from '../config/theme';

export function ContributeResearchModal({ visible, onClose, onActivate }) {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.modal, { backgroundColor: THEME.colors.backgroundElevated }]}>
          {/* Header */}
<View style={styles.header}>
  <Text style={[styles.headerTitle, { color: THEME.colors.success }]}>
    Faire avancer la recherche
  </Text>
  <TouchableOpacity style={styles.closeButton} onPress={onClose}>
    <MaterialIcons name="highlight-off" size={28} color={THEME.colors.text} />
  </TouchableOpacity>
</View>

<ScrollView
  style={styles.content}
  contentContainerStyle={styles.contentContainer}
  showsVerticalScrollIndicator={false}
  bounces={false}
>
  {/* Titre avec icône */}
  <View style={styles.titleRow}>
    <MaterialCommunityIcons name="flask" size={32} color={THEME.colors.primary} />
    <Text style={[styles.title, { color: THEME.colors.textPrimary }]}>
      Partager l’analyse de mes rêves pour faire avancer la science ✨
    </Text>
  </View>

  {/* Description */}
  <Text style={[styles.paragraph, { color: THEME.colors.textPrimary }]}>
    Vous pouvez choisir de transmettre vos analyses <Text style={{ fontWeight: '700' }}>de façon totalement anonyme</Text>. 
    Chaque partage contribue à enrichir la recherche sur le sommeil et les rêves.
  </Text>

  {/* Section Chercheurs */}
  <Text style={[styles.sectionTitle, { color: THEME.colors.primary }]}>
    🧬 Collaborations possibles :
  </Text>

  <Text style={[styles.bulletPoint, { color: THEME.colors.textPrimary }]}>
    • <Text style={{ fontWeight: '600' }}>Dr. Isabelle Arnulf</Text> (Institut du Cerveau, Paris)
  </Text>
  <Text style={[styles.bulletPoint, { color: THEME.colors.textPrimary }]}>
    • <Text style={{ fontWeight: '600' }}>Dr. Erik Hoel</Text> (Tufts University)
  </Text>
  <Text style={[styles.bulletPoint, { color: THEME.colors.textPrimary }]}>
    • Autres chercheurs en neurosciences du sommeil
  </Text>

  {/* Section Sécurité */}
  <Text style={[styles.sectionTitle, { color: THEME.colors.primary }]}>
    🔐 Vos données, protégées
  </Text>

  <Text style={[styles.bulletPoint, { color: THEME.colors.textPrimary }]}>
    • Chiffrement AES-256 de bout en bout
  </Text>
  <Text style={[styles.bulletPoint, { color: THEME.colors.textPrimary }]}>
    • Stockage sécurisé avec SecureStore
  </Text>
  <Text style={[styles.bulletPoint, { color: THEME.colors.textPrimary }]}>
    • Anonymisation totale avant tout partage
  </Text>
  <Text style={[styles.bulletPoint, { color: THEME.colors.textPrimary }]}>
    • Possibilité de désactiver à tout moment
  </Text>

  {/* Section Recherche */}
  <Text style={[styles.sectionTitle, { color: THEME.colors.primary }]}>
    🧬 Impact scientifique
  </Text>

  <Text style={[styles.paragraph, { color: THEME.colors.textPrimary }]}>
    Vos contributions anonymes nourrissent les travaux de chercheurs comme :
  </Text>

  <Text style={[styles.bulletPoint, { color: THEME.colors.textPrimary }]}>
    • Isabelle Arnulf (DreamTeam – Institut du Cerveau, Paris)
  </Text>
  <Text style={[styles.bulletPoint, { color: THEME.colors.textPrimary }]}>
    • Erik Hoel (Tufts University)
  </Text>
  <Text style={[styles.bulletPoint, { color: THEME.colors.textPrimary }]}>
    • Matthew Walker (UC Berkeley)
  </Text>

  {/* Section Contribution */}
  <Text style={[styles.sectionTitle, { color: THEME.colors.primary }]}>
    ✨ Note importante
  </Text>

  <Text style={[styles.paragraph, { color: THEME.colors.textPrimary, fontStyle: 'italic' }]}>
    Fonctionnalité bientôt disponible, toujours activée uniquement avec votre consentement explicite.
  </Text>
</ScrollView>

{/* Footer */}
<View style={[styles.footer, { borderTopColor: THEME.colors.dividerStrong }]}>
  <TouchableOpacity
    style={[styles.footerButton, { backgroundColor: THEME.colors.cardBackground }]}
    onPress={onClose}
  >
    <Text style={[styles.footerButtonText, { color: THEME.colors.textPrimary }]}>
      Non merci
    </Text>
  </TouchableOpacity>

  <TouchableOpacity
    style={[styles.footerButtonPrimary, { backgroundColor: THEME.colors.primary }]}
    onPress={onActivate}
  >
    <Text style={[styles.footerButtonTextPrimary, { color: THEME.colors.background }]}>
      Activer la contribution
    </Text>
  </TouchableOpacity>
</View>

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    width: '100%',
    maxWidth: 500,
    height: '85%',
    borderRadius: 20,
    overflow: 'hidden',
    ...THEME.shadow.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 15,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  closeButton: {
    padding: 5,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingTop: 0,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 28,
    flex: 1,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginTop: 20,
    marginBottom: 10,
    lineHeight: 24,
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 12,
  },
  bulletPoint: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
  },
  footerButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  footerButtonPrimary: {
    flex: 1.5,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  footerButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  footerButtonTextPrimary: {
    fontSize: 15,
    fontWeight: '700',
  },
});

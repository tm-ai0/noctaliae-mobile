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

  {/* Section Destination */}
  <Text style={[styles.sectionTitle, { color: THEME.colors.primary }]}>
    🧬 À qui profitent vos données ?
  </Text>

  <Text style={[styles.paragraph, { color: THEME.colors.textPrimary }]}>
    Vos analyses anonymisées pourront être transmises à des laboratoires de recherche reconnus en neurosciences du sommeil, comme par exemple :
  </Text>

  <Text style={[styles.bulletPoint, { color: THEME.colors.textPrimary }]}>
    • <Text style={{ fontWeight: '600' }}>DreamTeam</Text> – Institut du Cerveau (ICM), Paris
  </Text>
  <Text style={[styles.bulletPoint, { color: THEME.colors.textPrimary }]}>
    • <Text style={{ fontWeight: '600' }}>Walker Lab</Text> – UC Berkeley
  </Text>
  <Text style={[styles.bulletPoint, { color: THEME.colors.textPrimary }]}>
    • D'autres équipes universitaires vérifiées pourront s'ajouter au fil du temps
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

  {/* Note importante */}
  <Text style={[styles.sectionTitle, { color: THEME.colors.primary }]}>
    ✨ Note importante
  </Text>

  <Text style={[styles.paragraph, { color: THEME.colors.textPrimary, fontStyle: 'italic' }]}>
    Cette fonctionnalité n'est pas encore active. Seuls des laboratoires vérifiés et reconnus par la communauté scientifique seront éligibles. Votre consentement explicite sera toujours requis avant tout partage.
  </Text>
</ScrollView>

{/* Footer */}
<View style={[styles.footer, { borderTopColor: THEME.colors.dividerStrong }]}>
  <TouchableOpacity
    style={[styles.footerButton, { backgroundColor: THEME.colors.cardBackground }]}
    onPress={onClose}
  >
    <Text style={[styles.footerButtonText, { color: THEME.colors.textPrimary }]}>
      Fermer
    </Text>
  </TouchableOpacity>

  <TouchableOpacity
    style={[styles.footerButtonPrimary, { backgroundColor: '#4F8DFF' }]}
    onPress={onActivate}
  >
    <Text style={[styles.footerButtonTextPrimary, { color: '#0c0e27' }]}>
      👍 Ça m'intéresse !
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

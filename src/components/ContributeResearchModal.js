import React from 'react';
import { View, Text, StyleSheet, Modal, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { THEME } from '../config/theme';
import { useTranslation } from 'react-i18next';

export function ContributeResearchModal({ visible, onClose, onActivate }) {
  const { t } = useTranslation();
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
    {t('contributeResearch.title')}
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
      {t('contributeResearch.switchLabel')}
    </Text>
  </View>

  {/* Description */}
  <Text style={[styles.paragraph, { color: THEME.colors.textPrimary }]}>
    {t('contributeResearch.paragraph1')}
  </Text>

  {/* Section Destination */}
  <Text style={[styles.sectionTitle, { color: THEME.colors.primary }]}>
    {t('contributeResearch.section1')}
  </Text>

  <Text style={[styles.paragraph, { color: THEME.colors.textPrimary }]}>
    {t('contributeResearch.paragraph2')}
  </Text>

  <Text style={[styles.bulletPoint, { color: THEME.colors.textPrimary }]}>
    {t('contributeResearch.bullet_lab1')}
  </Text>
  <Text style={[styles.bulletPoint, { color: THEME.colors.textPrimary }]}>
    {t('contributeResearch.bullet_lab2')}
  </Text>
  <Text style={[styles.bulletPoint, { color: THEME.colors.textPrimary }]}>
    {t('contributeResearch.bullet_lab3')}
  </Text>

  {/* Section Sécurité */}
  <Text style={[styles.sectionTitle, { color: THEME.colors.primary }]}>
    {t('contributeResearch.section2')}
  </Text>

  <Text style={[styles.bulletPoint, { color: THEME.colors.textPrimary }]}>
    {t('contributeResearch.bullet_sec1')}
  </Text>
  <Text style={[styles.bulletPoint, { color: THEME.colors.textPrimary }]}>
    {t('contributeResearch.bullet_sec2')}
  </Text>
  <Text style={[styles.bulletPoint, { color: THEME.colors.textPrimary }]}>
    {t('contributeResearch.bullet_sec3')}
  </Text>
  <Text style={[styles.bulletPoint, { color: THEME.colors.textPrimary }]}>
    {t('contributeResearch.bullet_sec4')}
  </Text>

  {/* Note importante */}
  <Text style={[styles.sectionTitle, { color: THEME.colors.primary }]}>
    {t('contributeResearch.section3')}
  </Text>

  <Text style={[styles.paragraph, { color: THEME.colors.textPrimary, fontStyle: 'italic' }]}>
    {t('contributeResearch.noteText')}
  </Text>
</ScrollView>

{/* Footer */}
<View style={[styles.footer, { borderTopColor: THEME.colors.dividerStrong }]}>
  <TouchableOpacity
    style={[styles.footerButton, { backgroundColor: THEME.colors.cardBackground }]}
    onPress={onClose}
  >
    <Text style={[styles.footerButtonText, { color: THEME.colors.textPrimary }]}>
      {t('contributeResearch.close')}
    </Text>
  </TouchableOpacity>

  <TouchableOpacity
    style={[styles.footerButtonPrimary, { backgroundColor: '#4F8DFF' }]}
    onPress={onActivate}
  >
    <Text style={[styles.footerButtonTextPrimary, { color: '#0c0e27' }]}>
      {t('contributeResearch.ctaInterested')}
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

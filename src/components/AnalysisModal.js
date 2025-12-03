import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
} from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MarkdownText } from './MarkdownText';
import { THEME } from '../config/theme';

export default function AnalysisModal({ visible, onClose, analysis, title }) {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { paddingTop: Math.max(insets.top, 15) }]}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <MaterialCommunityIcons name="brain" size={24} color={THEME.colors.primary} />
            <Text style={styles.headerTitle}>Analyse complète</Text>
          </View>
          <TouchableOpacity 
            onPress={onClose}
            style={styles.closeButton}
          >
            <MaterialIcons name="close" size={24} color={THEME.colors.text} />
          </TouchableOpacity>
        </View>

        {/* Subtitle */}
        {title && (
          <View style={styles.subtitleContainer}>
            <Text style={styles.subtitle} numberOfLines={2}>
              {title}
            </Text>
          </View>
        )}

        {/* Content */}
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: Math.max(insets.bottom, 15) + 20 }
          ]}
          showsVerticalScrollIndicator={true}
        >
          <View style={styles.analysisHeader}>
            <Text style={styles.analysisIcon}>🌙</Text>
            <Text style={styles.analysisTitle}>Analyse de votre rêve</Text>
          </View>
          
          <MarkdownText style={styles.analysisText}>{analysis}</MarkdownText>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.cardBorder,
    backgroundColor: THEME.colors.cardBackground,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME.colors.text,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtitleContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: THEME.colors.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.cardBorder,
  },
  subtitle: {
    fontSize: 13,
    color: THEME.colors.textSecondary,
    lineHeight: 18,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  analysisHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.cardBorder,
  },
  analysisIcon: {
    fontSize: 24,
  },
  analysisTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: THEME.colors.text,
  },
  analysisText: {
    fontSize: 15,
    lineHeight: 24,
    color: THEME.colors.text,
  },
});

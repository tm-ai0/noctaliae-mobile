/**
 * 🔓 DecrypterScreen - Fiche scientifique "82% des rêves sont négatifs"
 * Première micro-leçon de l'Atlas Noctaliæ
 * 
 * Basée sur : Revonsuo (TST), Arnulf, Samson (Hadza/BaYaka)
 * Source : NotebookLM Thomas - 143 sources scientifiques
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../config/ThemeContext';

const { width } = Dimensions.get('window');

export default function DecrypterScreen({ navigation }) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  const Section = ({ icon, title, children, color }) => (
    <View style={[styles.section, { 
      backgroundColor: theme.colors.cardBackground,
      borderColor: theme.colors.cardBorder 
    }]}>
      <View style={styles.sectionHeader}>
        <View style={[styles.sectionIcon, { backgroundColor: (color || theme.colors.primary) + '20' }]}>
          <MaterialCommunityIcons name={icon} size={20} color={color || theme.colors.primary} />
        </View>
        <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>{title}</Text>
      </View>
      <View style={styles.sectionContent}>
        {children}
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity 
          style={[styles.backButton, { backgroundColor: theme.colors.cardBackground }]}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>Décrypter</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Card - Le chiffre choc */}
        <View style={[styles.heroCard, { backgroundColor: theme.colors.primary + '15' }]}>
          <Text style={[styles.heroNumber, { color: theme.colors.primary }]}>82%</Text>
          <Text style={[styles.heroText, { color: theme.colors.textPrimary }]}>
            de nos rêves contiennent des{'\n'}émotions négatives
          </Text>
          <View style={[styles.heroDivider, { backgroundColor: theme.colors.primary + '30' }]} />
          <Text style={[styles.heroSubtext, { color: theme.colors.textSecondary }]}>
            Et c'est probablement normal.
          </Text>
        </View>

        {/* Section 1 - La théorie */}
        <Section icon="dna" title="La théorie" color={theme.colors.primary}>
          <Text style={[styles.paragraph, { color: theme.colors.text }]}>
            Selon le neuroscientifique <Text style={styles.bold}>Antti Revonsuo</Text>, le cerveau 
            fonctionne comme un <Text style={styles.italic}>"simulateur de vol biologique"</Text>.
          </Text>
          <Text style={[styles.paragraph, { color: theme.colors.text }]}>
            Pendant le sommeil, il génère des scénarios menaçants dans un environnement 
            sécurisé pour nous entraîner à réagir face au danger.
          </Text>
          <Text style={[styles.paragraph, { color: theme.colors.text }]}>
            Cet entraînement nocturne vise à améliorer notre capacité à percevoir et 
            éviter les menaces réelles lorsque nous sommes éveillés.
          </Text>
        </Section>

        {/* Section 2 - Exemples */}
        <Section icon="format-list-bulleted" title="Exemples fréquents" color="#D2B14C">
          <View style={styles.examplesList}>
            {[
              { icon: 'run-fast', text: 'Être poursuivi par quelqu\'un ou quelque chose' },
              { icon: 'school-outline', text: 'Rater un examen ou arriver en retard' },
              { icon: 'tooth-outline', text: 'Perdre ses dents' },
              { icon: 'account-group-outline', text: 'Conflits avec des proches' },
              { icon: 'map-marker-off-outline', text: 'Se perdre, ne pas trouver son chemin' },
            ].map((item, index) => (
              <View key={index} style={styles.exampleItem}>
                <MaterialCommunityIcons name={item.icon} size={18} color="#D2B14C" />
                <Text style={[styles.exampleText, { color: theme.colors.text }]}>{item.text}</Text>
              </View>
            ))}
          </View>
        </Section>

        {/* Section 3 - Le saviez-vous */}
        <Section icon="lightbulb-on-outline" title="Le saviez-vous ?" color="#00FFB0">
          <View style={[styles.factCard, { backgroundColor: '#00FFB0' + '15' }]}>
            <Text style={[styles.factText, { color: theme.colors.text }]}>
              Les étudiants en médecine qui rêvent d'échouer à leurs examens obtiennent 
              souvent de <Text style={styles.bold}>meilleurs résultats</Text>.
            </Text>
            <Text style={[styles.factConclusion, { color: theme.colors.textSecondary }]}>
              Le cerveau les a "préparés" à l'épreuve.
            </Text>
          </View>
        </Section>

        {/* Section 4 - Nuance scientifique */}
        <Section icon="scale-balance" title="Nuance scientifique" color="#A0B4D4">
          <Text style={[styles.paragraph, { color: theme.colors.text }]}>
            Ce chiffre varie selon les études <Text style={styles.bold}>(36-82%)</Text> et les cultures.
          </Text>
          <Text style={[styles.paragraph, { color: theme.colors.text }]}>
            Chez les chasseurs-cueilleurs <Text style={styles.bold}>Hadza</Text> et <Text style={styles.bold}>BaYaka</Text>, 
            les rêves de menace se terminent souvent par du soutien social, 
            pas par la fuite.
          </Text>
          <View style={[styles.consensusCard, { backgroundColor: theme.colors.background, borderColor: theme.colors.cardBorder }]}>
            <MaterialCommunityIcons name="check-decagram" size={20} color={theme.colors.primary} />
            <Text style={[styles.consensusText, { color: theme.colors.text }]}>
              <Text style={styles.bold}>Consensus actuel :</Text> Le rêve remplit plusieurs fonctions 
              simultanément (simulation, régulation émotionnelle, consolidation mémoire).
            </Text>
          </View>
        </Section>

        {/* Sources */}
        <View style={[styles.sourcesCard, { backgroundColor: theme.colors.cardBackground, borderColor: theme.colors.cardBorder }]}>
          <MaterialCommunityIcons name="book-open-page-variant-outline" size={18} color={theme.colors.textSecondary} />
          <Text style={[styles.sourcesText, { color: theme.colors.textSecondary }]}>
            Sources : Revonsuo (2000), Arnulf, Samson (études Hadza/BaYaka), Hall & Van de Castle
          </Text>
        </View>

        {/* À retenir */}
        <View style={[styles.takeawayCard, { backgroundColor: theme.colors.primary + '20' }]}>
          <MaterialCommunityIcons name="brain" size={28} color={theme.colors.primary} />
          <View style={styles.takeawayContent}>
            <Text style={[styles.takeawayTitle, { color: theme.colors.primary }]}>À retenir</Text>
            <Text style={[styles.takeawayText, { color: theme.colors.text }]}>
              Vos cauchemars ne sont pas des dysfonctionnements. 
              C'est votre cerveau qui vous prépare à la vie.
            </Text>
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  // Hero Card
  heroCard: {
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    marginBottom: 20,
  },
  heroNumber: {
    fontSize: 72,
    fontWeight: '800',
    letterSpacing: -2,
  },
  heroText: {
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 26,
    marginTop: 5,
  },
  heroDivider: {
    width: 60,
    height: 2,
    borderRadius: 1,
    marginVertical: 20,
  },
  heroSubtext: {
    fontSize: 16,
    fontStyle: 'italic',
  },
  // Sections
  section: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    gap: 12,
  },
  sectionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  sectionContent: {},
  paragraph: {
    fontSize: 15,
    lineHeight: 23,
    marginBottom: 12,
  },
  bold: {
    fontWeight: '700',
  },
  italic: {
    fontStyle: 'italic',
  },
  // Examples
  examplesList: {
    gap: 12,
  },
  exampleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  exampleText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  // Fact Card
  factCard: {
    borderRadius: 12,
    padding: 16,
  },
  factText: {
    fontSize: 15,
    lineHeight: 23,
  },
  factConclusion: {
    fontSize: 14,
    fontStyle: 'italic',
    marginTop: 10,
  },
  // Consensus
  consensusCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 15,
  },
  consensusText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 21,
  },
  // Sources
  sourcesCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 15,
  },
  sourcesText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
  },
  // Takeaway
  takeawayCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
  },
  takeawayContent: {
    flex: 1,
  },
  takeawayTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 5,
  },
  takeawayText: {
    fontSize: 15,
    lineHeight: 22,
  },
});

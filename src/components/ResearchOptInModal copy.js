import React from 'react';
import { View, Text, StyleSheet, Modal, ScrollView, Pressable, Linking, Dimensions } from 'react-native';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';

const { height: WINDOW_HEIGHT } = Dimensions.get('window');

export function ResearchOptInModal({ visible, onClose, onAccept }) {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerIcon}>
              <MaterialCommunityIcons name="flask" size={24} color="#4F8DFF" />
            </View>
            <Pressable 
              style={({ pressed }) => [styles.closeButton, pressed && { opacity: 0.5 }]}
              onPress={onClose}
            >
              <MaterialIcons name="close" size={24} color="#999" />
            </Pressable>
          </View>

          {/* CONTENU SCROLLABLE */}
          <ScrollView 
            style={styles.content} 
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.title}>Contribuer à la recherche 🔬</Text>
            
            <Text style={styles.paragraph}>
              Vos rêves seront <Text style={styles.bold}>strictement anonymisés</Text> (zéro donnée personnelle) avant tout partage avec des laboratoires de recherche reconnus.
              {'\n\n'}
              Ces données anonymes aideront l'équipe{' '}
              <Text 
                style={styles.link}
                onPress={() => Linking.openURL('https://institutducerveau.org/equipes-recherche-linstitut-cerveau/dreamteam-sommeil-reves-et-cognition')}
              >
                DreamTeam - Sommeil, Rêves et Cognition
              </Text>
              {' '}dirigée par le Dr. Isabelle Arnulf à l'Institut du Cerveau (Paris), référence mondiale en neurosciences des rêves.
            </Text>

            <Text style={styles.sectionTitle}>✨ Cela aide à :</Text>
            
            <View style={styles.benefitItem}>
              <View style={styles.bulletPoint}>
                <MaterialCommunityIcons name="brain" size={18} color="#4F8DFF" />
              </View>
              <Text style={styles.benefitText}>Comprendre les mécanismes du sommeil</Text>
            </View>

            <View style={styles.benefitItem}>
              <View style={styles.bulletPoint}>
                <MaterialCommunityIcons name="check-decagram" size={18} color="#4F8DFF" />
              </View>
              <Text style={styles.benefitText}>Valider les théories scientifiques</Text>
            </View>

            <View style={styles.benefitItem}>
              <View style={styles.bulletPoint}>
                <MaterialCommunityIcons name="rocket-launch" size={18} color="#4F8DFF" />
              </View>
              <Text style={styles.benefitText}>Faire avancer la science des rêves</Text>
            </View>

            <View style={styles.protectionBox}>
              <MaterialCommunityIcons name="shield-check" size={20} color="#4F8DFF" />
              <Text style={styles.protectionText}>
                Vos rêves sont anonymisés puis chiffrés AES-256 avant partage. Vous pouvez désactiver ce partage à tout moment.
              </Text>
            </View>

            <Text style={styles.thankYou}>Merci de faire avancer la science avec nous ! 🌙</Text>
          </ScrollView>

          {/* FOOTER BOUTONS */}
          <View style={styles.footer}>
            <Pressable 
              android_ripple={{
                color: 'rgba(255, 255, 255, 0.15)',
                borderless: false,
                foreground: true,
                radius: 150,
              }}
              style={({ pressed }) => [styles.footerButton, pressed && styles.footerButtonPressed]}
              onPress={onClose}
            >
              <Text style={styles.footerButtonText}>Annuler</Text>
            </Pressable>

            <Pressable 
              android_ripple={{
                color: 'rgba(255, 255, 255, 0.3)',
                borderless: false,
                foreground: true,
                radius: 150,
              }}
              style={({ pressed }) => [styles.footerButtonPrimary, pressed && styles.footerButtonPrimaryPressed]}
              onPress={onAccept}
            >
              <MaterialCommunityIcons name="check-bold" size={20} color="#FFFFFF" />
              <Text style={styles.footerButtonTextPrimary}>J'accepte</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: '#1A1A2E',
    borderRadius: 20,
    width: '100%',
    maxWidth: 420,
    minHeight: 500,
    maxHeight: WINDOW_HEIGHT * 0.85,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 10,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(79, 141, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
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
    paddingBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
    lineHeight: 28,
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 22,
    color: '#E0E0E0',
    marginBottom: 16,
  },
  bold: {
    fontWeight: '700',
    color: '#FFFFFF',
  },
  link: {
    color: '#4F8DFF',
    textDecorationLine: 'underline',
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#4F8DFF',
    marginTop: 8,
    marginBottom: 12,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  bulletPoint: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(79, 141, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  benefitText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    color: '#E0E0E0',
    paddingTop: 5,
  },
  protectionBox: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(79, 141, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(79, 141, 255, 0.3)',
    marginTop: 8,
    marginBottom: 12,
  },
  protectionText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    color: '#E0E0E0',
    marginLeft: 10,
  },
  thankYou: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
    color: '#AAA',
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  footerButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#2A2A3E',
    marginRight: 8,
  },
  footerButtonPressed: {
    backgroundColor: '#1F1F2E',
    opacity: 0.8,
  },
  footerButtonPrimary: {
    flex: 1,
    flexDirection: 'row',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4F8DFF',
  },
  footerButtonPrimaryPressed: {
    backgroundColor: '#3A6FD9',
  },
  footerButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  footerButtonTextPrimary: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 8,
  },
});
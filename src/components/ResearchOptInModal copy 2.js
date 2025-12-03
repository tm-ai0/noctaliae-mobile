import React from 'react';
import { View, Text, StyleSheet, Modal, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';

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
          {/* Header avec close button */}
          <View style={styles.header}>
            <View style={styles.headerIcon}>
              <MaterialCommunityIcons 
                name="flask" 
                size={24} 
                color="#4F8DFF"
              />
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <MaterialIcons name="close" size={24} color="#999" />
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={styles.content} 
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
          >
            {/* Titre principal */}
            <Text style={styles.title}>
              Contribuer à la recherche 🔬
            </Text>
            
            <Text style={styles.paragraph}>
              Vos rêves seront <Text style={styles.bold}>anonymisés</Text> (zéro donnée personnelle) et partagés avec des chercheurs en neurosciences comme <Text style={styles.highlight}>Isabelle Arnulf</Text>.
            </Text>

            {/* Section Bénéfices */}
            <Text style={styles.sectionTitle}>
              ✨ Cela aide à :
            </Text>
            
            <View style={styles.benefitsList}>
              <View style={styles.benefitItem}>
                <View style={styles.bulletPoint}>
                  <MaterialCommunityIcons name="brain" size={18} color="#4F8DFF" />
                </View>
                <Text style={styles.benefitText}>
                  Comprendre les mécanismes du sommeil
                </Text>
              </View>

              <View style={styles.benefitItem}>
                <View style={styles.bulletPoint}>
                  <MaterialCommunityIcons name="check-decagram" size={18} color="#4F8DFF" />
                </View>
                <Text style={styles.benefitText}>
                  Valider les théories scientifiques
                </Text>
              </View>

              <View style={styles.benefitItem}>
                <View style={styles.bulletPoint}>
                  <MaterialCommunityIcons name="rocket-launch" size={18} color="#4F8DFF" />
                </View>
                <Text style={styles.benefitText}>
                  Faire avancer la science des rêves
                </Text>
              </View>
            </View>

            {/* Section Protection */}
            <View style={styles.protectionBox}>
              <MaterialCommunityIcons name="shield-check" size={20} color="#4F8DFF" />
              <Text style={styles.protectionText}>
                Vos rêves sont anonymisés puis chiffrés AES-256 avant partage. Vous pouvez désactiver ce partage à tout moment.
              </Text>
            </View>

            <Text style={styles.thankYou}>
              Merci de faire avancer la science avec nous ! 🌙
            </Text>
          </ScrollView>

          <Text style={styles.footerButtonText}>
                Annuler
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.footerButtonPrimary}
              onPress={onAccept} >
           
              <MaterialCommunityIcons name="check-bold" size={20} color="#FFFFFF" />
              <Text style={styles.footerButtonTextPrimary}>
                J'accepte
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}r  

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
    maxHeight: '80%',
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
  highlight: {
    fontWeight: '600',
    color: '#4F8DFF',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#4F8DFF',
    marginTop: 8,
    marginBottom: 12,
    lineHeight: 24,
  },
  benefitsList: {
    marginBottom: 16,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  bulletPoint: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(79, 141, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    flexShrink: 0,
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
  footerButtonPrimary: {
    flex: 1,
    flexDirection: 'row',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4F8DFF',
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
link: {
  fontWeight: '600',
  color: '#4F8DFF',
  textDecorationLine: 'underline',
},
});

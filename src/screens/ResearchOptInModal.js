import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Linking
} from 'react-native';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

export function ResearchOptInModal({ visible, onClose, onAccept }) {
  const { t } = useTranslation();
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
            <View style={styles.headerIconCircle}>
              <MaterialCommunityIcons name="flask" size={24} color="#4F8DFF" />
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialIcons name="close" size={24} color="#999" />
            </TouchableOpacity>
          </View>

          {/* Contenu scrollable */}
          <ScrollView 
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.content}>
              <Text style={styles.title}>{t('researchOptInModal.title')}</Text>

              <Text style={styles.paragraph}>
                {t('researchOptInModal.paragraph1_pre')}<Text style={styles.bold}>{t('researchOptInModal.paragraph1_bold')}</Text>{t('researchOptInModal.paragraph1_post')}
                {'\n\n'}
                {t('researchOptInModal.paragraph2_pre')}
                <Text
                  style={styles.link}
                  onPress={() => Linking.openURL('https://institutducerveau.org/equipes-recherche-linstitut-cerveau/dreamteam-sommeil-reves-et-cognition')}
                >
                  {t('researchOptInModal.paragraph2_link')}
                </Text>
                {t('researchOptInModal.paragraph2_post')}
              </Text>

              <Text style={styles.sectionTitle}>{t('researchOptInModal.sectionTitle')}</Text>

              <View style={styles.benefitItem}>
                <View style={styles.iconCircle}>
                  <MaterialCommunityIcons name="brain" size={18} color="#4F8DFF" />
                </View>
                <Text style={styles.benefitText}>{t('researchOptInModal.benefit1')}</Text>
              </View>

              <View style={styles.benefitItem}>
                <View style={styles.iconCircle}>
                  <MaterialCommunityIcons name="check-decagram" size={18} color="#4F8DFF" />
                </View>
                <Text style={styles.benefitText}>{t('researchOptInModal.benefit2')}</Text>
              </View>

              <View style={styles.benefitItem}>
                <View style={styles.iconCircle}>
                  <MaterialCommunityIcons name="rocket-launch" size={18} color="#4F8DFF" />
                </View>
                <Text style={styles.benefitText}>{t('researchOptInModal.benefit3')}</Text>
              </View>

              <View style={styles.protectionBox}>
                <MaterialCommunityIcons name="shield-check" size={20} color="#4F8DFF" />
                <Text style={styles.protectionText}>
                  {t('researchOptInModal.protectionText')}
                </Text>
              </View>

              <Text style={styles.thankYou}>{t('researchOptInModal.thankYou')}</Text>
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.buttonCancel} onPress={onClose} activeOpacity={0.8}>
              <Text style={styles.buttonCancelText}>{t('common.cancel')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.buttonAccept} onPress={onAccept} activeOpacity={0.8}>
              <MaterialCommunityIcons name="check-bold" size={20} color="#FFFFFF" />
              <Text style={styles.buttonAcceptText}>{t('researchOptInModal.accept')}</Text>
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
    maxHeight: '85%',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerIconCircle: {
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
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
    lineHeight: 28,
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 22,
    color: '#B0B0C0',
    marginBottom: 20,
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
    marginBottom: 16,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(79, 141, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  benefitText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 20,
    color: '#E0E0E0',
  },
  protectionBox: {
    flexDirection: 'row',
    padding: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(79, 141, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(79, 141, 255, 0.3)',
    marginTop: 12,
    marginBottom: 16,
  },
  protectionText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    color: '#B0B0C0',
    marginLeft: 10,
  },
  thankYou: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 20,
    color: '#888',
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#333',
    backgroundColor: '#1A1A2E',
  },
  buttonCancel: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#2A2A3E',
    marginRight: 8,
  },
  buttonCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  buttonAccept: {
    flex: 1,
    flexDirection: 'row',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4F8DFF',
  },
  buttonAcceptText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 8,
  },
});

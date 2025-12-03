import React from 'react';
import { View, Text, StyleSheet, Modal, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { THEME } from '../config/theme';

export function DeepDreamInfoModal({ visible, onClose, onSupport }) {
  const handleWhatsApp = () => {
    Linking.openURL('https://wa.me/33645003566?text=Salut%20Thomas%20!%20%F0%9F%8C%99');
  };

  const handleNarcolepsyLearnMore = () => {
    // TODO: Navigation vers LearnScreen section Narcolepsie
    // Pour l'instant on peut juste afficher une alerte
    console.log('📚 Navigation vers LearnScreen > Narcolepsie');
  };

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
  <Text style={[styles.headerTitle, { color: '#4F8DFF', flex: 1, textAlign: 'center' }]}>
    DeepDream Engine, c'est quoi ?
  </Text>
  <TouchableOpacity style={styles.closeButton} onPress={onClose}>
    <MaterialIcons name="highlight-off" size={24} color={THEME.colors.text} />
  </TouchableOpacity>
</View>


          <ScrollView 
            style={styles.content} 
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {/* Titre avec icône centrée */}
            <View style={styles.titleContainer}>
              <MaterialCommunityIcons 
                name="electron-framework" 
                size={48} 
                color="#39FF88"
                style={styles.titleIcon}
              />
              <Text style={[styles.title, { color: THEME.colors.textPrimary }]}>
                <Text style={{ color: '#ffffffff' }}>Un outil innovant</Text>
                {' basée sur les neurosciences et dédié à l\'analyse des rêves.'}
                <Text style={{ color: '#39FF88' }}>C\'est lui qui est cœur de Noctaliæ.</Text>
              </Text>
              <View style={styles.moonIcon}>
                <Text style={{ fontSize: 32 }}>🌙</Text>
              </View>
            </View>

            {/* Section Claude Sonnet */}
<Text style={[styles.paragraph, { color: THEME.colors.textPrimary }]}>
  DeepDream Engine est un moteur d’analyse des rêves optimisé par Claude Sonnet 4.5, 
  conçu pour explorer les nuances émotionnelles et narratives en s’appuyant sur les grands 
  modèles neuroscientifiques et les recherches récentes.{"\n\n"}

  Son approche s’inscrit dans la continuité des grands modèles neurobiologiques du rêve : 
  la théorie de l’activation-synthèse proposée par J. Allan Hobson et Robert McCarley, 
  la perspective de la continuité développée par G. William Domhoff, 
  ou encore l’approche neurocognitive défendue par Mark Solms.{"\n\n"}

  Les travaux d’Antti Revonsuo sur les rêves comme simulations de menaces, 
  ceux de Matthew Walker sur la mémoire et l’émotion, 
  ainsi que les recherches de Perrine Ruby et de son équipe à Lyon enrichissent ce champ.{"\n\n"}

  Enfin, le modèle de rapport d’analyse neurocognitive du rêve proposé par Isabelle Arnulf 
  et ses collaborateurs illustre la manière dont la recherche contemporaine articule 
  consensus et controverses.{"\n\n"}

  👉 DeepDream Engine n’est pas seulement un outil technique, il s’ancre dans un corpus scientifique reconnu, en dialogue avec les débats 
  actuels des neurosciences du rêve et en constante évolution, grace à vous.
</Text>

<Text style={[styles.bulletPoint, { color: THEME.colors.textPrimary }]}>
  🌙 Toutes les sources, prompts et grilles et rapports d'analyses seront bientot mis à disposition dans Noctaliæ, patience!
</Text>
            {/* Section Limites */}
            <Text style={[styles.sectionTitle, { color: '#39FF88' }]}>
              ⚡ Pourquoi limité à 10 analyses par jour ?
            </Text>

            <Text style={[styles.paragraph, { color: THEME.colors.textPrimary }]}>
              Les IA sont des outils fascinants dont nous commençons à peine à explorer le potentiel. À bien des égards, elles rappellent les rêves. Mais une différence essentielle demeure : rêver ne requiert que quelques calories pour activer pensée et imagination, tandis que les IA s’appuient sur des infrastructures massivement énergivores pour accomplir des tâches pourtant simples.
            </Text>

            <Text style={[styles.paragraph, { color: THEME.colors.textPrimary }]}>
              Chaque analyse DeepDream Engine = 2 recherches Google.
            </Text>

            <Text style={[styles.paragraph, { color: THEME.colors.textPrimary }]}>
              Ça semble peu, c'est vrai. Mais avec 10 utilisateurs faisant 3-4 requêtes/jour, ça représente l'énergie pour charger 20 téléphones, ou un trajet de 15 min en voiture.
            </Text>

            <Text style={[styles.paragraph, { color: THEME.colors.textPrimary }]}>
              En imaginant que la plupart des gens font ~5 rêves/nuit, et 0-1 mémorable. 10/jour est largement raisonnable... sauf si vous êtes{' '}
              <Text 
                style={{ fontWeight: '700', color: '#39FF88', textDecorationLine: 'underline' }}
                onPress={handleNarcolepsyLearnMore}
              >
                narcoleptique
              </Text>,{' '}
              <Text style={{ fontWeight: '700', color: '#4F8DFF' }}>rêveur lucide</Text>, ou{' '}
              <Text style={{ fontWeight: '700', color: '#4F8DFF' }}>passionné par les rêves !</Text>
            </Text>

            {/* Section Contact */}
            <Text style={[styles.sectionTitle, { color: '#39FF88' }]}>
              Expériences à partager, questions randoms, idées ou bugs à signaler sur Noctaliæ ou simplement envie d'en savoir plus ?
            </Text>
            <Text style={[styles.paragraph, { color: THEME.colors.textPrimary }]}>
              N'hesitez pas à me contacter ! 💬
</Text>
      

            {/*<Text style={[styles.paragraph, { color: THEME.colors.textPrimary }]}>
              La communauté est encore mini, mais c'est comme ça qu'elle grandit !
            </Text>*/}

            

            {/* Section Soutien */}
            <Text style={[styles.sectionTitle, { color: '#39FF88' }]}>
              ✨ Votre soutien m'aide à :
            </Text>

            <Text style={[styles.bulletPoint, { color: THEME.colors.textPrimary }]}>
              • Amortir les coûts d'API (~2€/jour pour 100 analyses)
            </Text>

            <Text style={[styles.bulletPoint, { color: THEME.colors.textPrimary }]}>
              • Améliorer la qualité des analyses
            </Text>

            <Text style={[styles.bulletPoint, { color: THEME.colors.textPrimary }]}>
              • Enrichir notre Learning center bientot disponible !
            </Text>

            <Text style={[styles.bulletPoint, { color: THEME.colors.textPrimary }]}>
              • Rester motivé pour innover !
            </Text>

            <Text style={[styles.paragraph, { color: THEME.colors.textPrimary, marginTop: 12 }]}>
              Votre soutien, c'est bien plus qu'une aide financière. C'est la preuve que Noctaliæ vous est utile. Et ça, c'est ce qui me motive à continuer d'innover et d'améliorer l'app chaque jour et avec passion ! 🌙
            </Text>
          </ScrollView>

          {/* Footer */}
          <View style={[styles.footer, { borderTopColor: THEME.colors.dividerStrong }]}>
            

            <TouchableOpacity
  style={[
    styles.footerButtonWhatsApp,
    {
      backgroundColor: '#25D366',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 14,
      paddingHorizontal: 20,
      borderRadius: 50, // bord arrondi type pill
      width: '100%',    // pleine largeur
      maxWidth: 400,    // limite sur grands écrans si besoin
      alignSelf: 'center', // centré dans le footer
    },
  ]}
  onPress={handleWhatsApp}
>
  <MaterialCommunityIcons
    name="whatsapp"
    size={24}
    color="white"
    style={{ marginRight: 12 }}
  />
  <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
    Contacter sur WhatsApp
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
    height: '90%',
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
    fontSize: 22,
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
  titleContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  titleIcon: {
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 26,
    textAlign: 'center',
    marginBottom: 8,
  },
  moonIcon: {
    marginTop: 8,
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
  footerButtonWhatsApp: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

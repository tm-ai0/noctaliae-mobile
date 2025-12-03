import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TextInput,
  TouchableOpacity,
  Switch,
  Alert,
  Animated,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PLAYGROUND_ENGINE_KEY = '@noctaliae_playground_engine';
const PLAYGROUND_RESEARCH_KEY = '@noctaliae_playground_research';

// ════════════════════════════════════════════════════════════
// 🎨 PLAYGROUND - Modèle d'Analyse Toggle
// ════════════════════════════════════════════════════════════

export default function PlaygroundScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  
  // 🎛️ ÉTAT DU TOGGLE
  const [isPremium, setIsPremium] = useState(false);
  
  // 🎛️ PROPS MODIFIABLES
  const [freeBgColor, setFreeBgColor] = useState('rgba(57, 255, 136, 0.08)');
  const [freeBorderColor, setFreeBorderColor] = useState('rgba(57, 255, 136, 0.3)');
  const [freeIconColor, setFreeIconColor] = useState('#39FF88');
  
  const [premiumBgColor, setPremiumBgColor] = useState('rgba(79, 141, 255, 0.08)');
  const [premiumBorderColor, setPremiumBorderColor] = useState('rgba(79, 141, 255, 0.3)');
  const [premiumIconColor, setPremiumIconColor] = useState('#4F8DFF');
  
  const [borderRadius, setBorderRadius] = useState('12');
  const [padding, setPadding] = useState('16');
  const [titleSize, setTitleSize] = useState('18');
  const [descSize, setDescSize] = useState('14');

  // 🧪 RESEARCH BLOCK STATES
  const [researchOptedIn, setResearchOptedIn] = useState(false);
  const [researchBgColor, setResearchBgColor] = useState('rgba(79, 141, 255, 0.05)');
  const [researchBorderColor, setResearchBorderColor] = useState('rgba(79, 141, 255, 0.5)');
  const [researchAccentColor, setResearchAccentColor] = useState('#4F8DFF');
  const [researchBorderRadius, setResearchBorderRadius] = useState('16');
  const [researchPadding, setResearchPadding] = useState('16');

  // 🔄 Charger les valeurs sauvegardées
  useEffect(() => {
    loadSavedStyles();
  }, []);

  const loadSavedStyles = async () => {
    try {
      const stored = await AsyncStorage.getItem(PLAYGROUND_ENGINE_KEY);
      if (stored) {
        const v = JSON.parse(stored);
        setFreeBgColor(v.freeBgColor || 'rgba(57, 255, 136, 0.08)');
        setFreeBorderColor(v.freeBorderColor || 'rgba(57, 255, 136, 0.3)');
        setFreeIconColor(v.freeIconColor || '#39FF88');
        setPremiumBgColor(v.premiumBgColor || 'rgba(79, 141, 255, 0.08)');
        setPremiumBorderColor(v.premiumBorderColor || 'rgba(79, 141, 255, 0.3)');
        setPremiumIconColor(v.premiumIconColor || '#4F8DFF');
        setBorderRadius(String(v.borderRadius || 12));
        setPadding(String(v.padding || 16));
        setTitleSize(String(v.titleSize || 18));
        setDescSize(String(v.descSize || 14));
      }
    } catch (error) {
      console.error('❌ Erreur chargement:', error);
    }
  };

  const currentBg = isPremium ? premiumBgColor : freeBgColor;
  const currentBorder = isPremium ? premiumBorderColor : freeBorderColor;
  const currentIcon = isPremium ? premiumIconColor : freeIconColor;

  const generatedCode = `backgroundColor: isPremium ? '${premiumBgColor}' : '${freeBgColor}'
borderColor: isPremium ? '${premiumBorderColor}' : '${freeBorderColor}'
borderRadius: ${borderRadius}
padding: ${padding}
iconColor: isPremium ? '${premiumIconColor}' : '${freeIconColor}'
titleSize: ${titleSize}
descSize: ${descSize}`;

  const handleCopy = async () => {
    await Clipboard.setStringAsync(generatedCode);
    Alert.alert('✅ Copié !');
  };

  const handleApply = async () => {
    const values = {
      freeBgColor, freeBorderColor, freeIconColor,
      premiumBgColor, premiumBorderColor, premiumIconColor,
      borderRadius: parseInt(borderRadius) || 12,
      padding: parseInt(padding) || 16,
      titleSize: parseInt(titleSize) || 18,
      descSize: parseInt(descSize) || 14,
    };
    await AsyncStorage.setItem(PLAYGROUND_ENGINE_KEY, JSON.stringify(values));
    Alert.alert('✅ Appliqué !');
  };

  return (
    <ScrollView 
      style={[styles.container, { paddingTop: insets.top + 20 }]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.header}>🎨 Playground</Text>
      <Text style={styles.subtitle}>Modèle d'Analyse - Toggle Engine</Text>

      {/* PREVIEW */}
      <View style={styles.previewSection}>
        <Text style={styles.previewLabel}>PREVIEW LIVE</Text>
        
        <View style={[styles.engineToggle, {
          backgroundColor: currentBg,
          borderColor: currentBorder,
          borderRadius: parseInt(borderRadius) || 12,
          padding: parseInt(padding) || 16,
        }]}>
          <View style={styles.optionInfo}>
            <View style={styles.optionTitleRow}>
              <MaterialIcons 
                name={isPremium ? "auto-awesome" : "flash-on"} 
                size={22} 
                color={currentIcon} 
              />
              <Text style={[styles.optionTitle, { fontSize: parseInt(titleSize) || 18 }]}>
                {isPremium ? 'DeepDream Engine' : 'QuickDream'}
              </Text>
            </View>
            <Text style={[styles.optionDesc, { fontSize: parseInt(descSize) || 14 }]}>
              {isPremium 
                ? "Claude Sonnet 4.5 - Analyses approfondies."
                : 'Llama 3.3 70B - Gratuit et illimité.'
              }
            </Text>
          </View>
          
          <Switch
            value={isPremium}
            onValueChange={setIsPremium}
            trackColor={{ false: freeIconColor, true: premiumIconColor }}
            thumbColor={'#FFFFFF'}
          />
        </View>
        <Text style={styles.hint}>👆 Toggle pour voir les deux états</Text>
      </View>

      {/* CONTRÔLES */}
      <View style={styles.controls}>
        <Text style={styles.controlsTitle}>🎛️ CONTRÔLES</Text>
        
        <Text style={styles.groupLabel}>📐 Dimensions</Text>
        <ControlRow label="Border Radius" value={borderRadius} onChange={setBorderRadius} />
        <ControlRow label="Padding" value={padding} onChange={setPadding} />
        <ControlRow label="Title Size" value={titleSize} onChange={setTitleSize} />
        <ControlRow label="Desc Size" value={descSize} onChange={setDescSize} />

        <Text style={styles.groupLabel}>💚 QuickDream (Free)</Text>
        <ControlRow label="Background" value={freeBgColor} onChange={setFreeBgColor} wide />
        <ControlRow label="Border" value={freeBorderColor} onChange={setFreeBorderColor} wide />
        <ControlRow label="Icon" value={freeIconColor} onChange={setFreeIconColor} wide />

        <Text style={styles.groupLabel}>💙 DeepDream (Premium)</Text>
        <ControlRow label="Background" value={premiumBgColor} onChange={setPremiumBgColor} wide />
        <ControlRow label="Border" value={premiumBorderColor} onChange={setPremiumBorderColor} wide />
        <ControlRow label="Icon" value={premiumIconColor} onChange={setPremiumIconColor} wide />
      </View>

      {/* CODE */}
      <View style={styles.codeSection}>
        <Text style={styles.codeTitle}>📋 VALEURS</Text>
        <View style={styles.codeBlock}>
          <Text style={styles.codeText}>{generatedCode}</Text>
        </View>
        
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.copyBtn} onPress={handleCopy}>
            <MaterialIcons name="content-copy" size={20} color="#0D0D1A" />
            <Text style={styles.btnText}>Copier</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.applyBtn} onPress={handleApply}>
            <MaterialIcons name="check" size={20} color="#0D0D1A" />
            <Text style={styles.btnText}>Appliquer</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ════════════════════════════════════════════════════════════ */}
      {/* 🧪 SECTION 2 : CONTRIBUER À LA SCIENCE */}
      {/* ════════════════════════════════════════════════════════════ */}
      
      <View style={styles.divider} />
      <Text style={styles.subtitle}>🧪 Contribuer à la science</Text>

      {/* PREVIEW RESEARCH */}
      <View style={styles.previewSection}>
        <Text style={styles.previewLabel}>PREVIEW LIVE</Text>
        
        <View style={[
          styles.researchContainer,
          {
            backgroundColor: researchOptedIn ? researchBgColor : 'rgba(30, 30, 50, 0.5)',
            borderColor: researchOptedIn ? researchBorderColor : 'rgba(100, 100, 100, 0.3)',
            borderRadius: parseInt(researchBorderRadius) || 16,
            padding: parseInt(researchPadding) || 16,
          }
        ]}>
          <View style={styles.researchRow}>
            <View style={[
              styles.researchIconCircle,
              { backgroundColor: researchOptedIn ? `${researchAccentColor}33` : 'rgba(100, 100, 100, 0.15)' }
            ]}>
              <MaterialCommunityIcons 
                name={researchOptedIn ? "flask-outline" : "flask"} 
                size={24} 
                color={researchOptedIn ? researchAccentColor : "#666"} 
              />
            </View>

            <View style={styles.researchTextContainer}>
              <Text style={[
                styles.researchTitle,
                { color: researchOptedIn ? researchAccentColor : '#FFF' }
              ]}>
                Contribuer à la science (optionnel)
              </Text>
              <Text style={[
                styles.researchSubtitle,
                { color: researchOptedIn ? researchAccentColor : '#888' }
              ]}>
                {researchOptedIn 
                  ? "✅ Vous contribuez à la science !" 
                  : "Partager anonymement vos analyses"}
              </Text>
            </View>

            <Switch
              value={researchOptedIn}
              onValueChange={setResearchOptedIn}
              trackColor={{ false: '#333', true: `${researchAccentColor}80` }}
              thumbColor={researchOptedIn ? researchAccentColor : '#666'}
            />
          </View>
          
          {researchOptedIn && (
            <View style={[
              styles.researchBadge,
              { 
                backgroundColor: `${researchAccentColor}1A`,
                borderLeftColor: researchAccentColor 
              }
            ]}>
              <MaterialCommunityIcons name="flask" size={16} color={researchAccentColor} />
              <Text style={[styles.researchBadgeText, { color: researchAccentColor }]}>
                Vos rêves aident la DreamTeam (ICM Paris) 🔬
              </Text>
            </View>
          )}
        </View>
        <Text style={styles.hint}>👆 Toggle pour voir les deux états</Text>
      </View>

      {/* CONTRÔLES RESEARCH */}
      <View style={styles.controls}>
        <Text style={styles.controlsTitle}>🏛️ CONTRÔLES RESEARCH</Text>
        
        <Text style={styles.groupLabel}>📐 Dimensions</Text>
        <ControlRow label="Border Radius" value={researchBorderRadius} onChange={setResearchBorderRadius} />
        <ControlRow label="Padding" value={researchPadding} onChange={setResearchPadding} />

        <Text style={styles.groupLabel}>💙 Couleurs (actif)</Text>
        <ControlRow label="Background" value={researchBgColor} onChange={setResearchBgColor} wide />
        <ControlRow label="Border" value={researchBorderColor} onChange={setResearchBorderColor} wide />
        <ControlRow label="Accent" value={researchAccentColor} onChange={setResearchAccentColor} wide />
      </View>

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

// Composant helper
const ControlRow = ({ label, value, onChange, wide }) => (
  <View style={styles.controlRow}>
    <Text style={styles.controlLabel}>{label}</Text>
    <TextInput
      style={[styles.controlInput, wide && styles.wideInput]}
      value={value}
      onChangeText={onChange}
      keyboardType={wide ? 'default' : 'numeric'}
      placeholderTextColor="#666"
    />
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0D1A', paddingHorizontal: 20 },
  header: { fontSize: 28, fontWeight: '700', color: '#FFF', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#888', marginBottom: 24 },
  
  previewSection: { marginBottom: 24 },
  previewLabel: { fontSize: 12, fontWeight: '600', color: '#D2B14C', marginBottom: 12, letterSpacing: 1 },
  hint: { fontSize: 12, color: '#666', textAlign: 'center', marginTop: 8 },
  
  engineToggle: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1 },
  optionInfo: { flex: 1, marginRight: 15 },
  optionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 5 },
  optionTitle: { fontWeight: '700', color: '#FFF' },
  optionDesc: { color: '#888' },
  
  controls: { marginBottom: 24 },
  controlsTitle: { fontSize: 16, fontWeight: '700', color: '#FFF', marginBottom: 16 },
  groupLabel: { fontSize: 14, fontWeight: '600', color: '#D2B14C', marginTop: 16, marginBottom: 12 },
  controlRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  controlLabel: { fontSize: 14, color: '#FFF', flex: 1 },
  controlInput: { backgroundColor: '#1a1a2e', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, color: '#39FF88', fontSize: 14, width: 80, textAlign: 'center', borderWidth: 1, borderColor: 'rgba(210, 177, 76, 0.3)' },
  wideInput: { width: 180, textAlign: 'left' },
  
  codeSection: { marginBottom: 24 },
  codeTitle: { fontSize: 14, fontWeight: '600', color: '#D2B14C', marginBottom: 12 },
  codeBlock: { backgroundColor: '#1a1a2e', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: 'rgba(210, 177, 76, 0.3)' },
  codeText: { fontFamily: 'monospace', fontSize: 11, color: '#39FF88', lineHeight: 18 },
  
  buttonRow: { flexDirection: 'row', gap: 12, marginTop: 16 },
  copyBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#D2B14C', borderRadius: 12, padding: 14, gap: 8 },
  applyBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#39FF88', borderRadius: 12, padding: 14, gap: 8 },
  btnText: { color: '#0D0D1A', fontWeight: '700', fontSize: 16 },
  
  // 🧪 RESEARCH STYLES
  divider: { height: 1, backgroundColor: 'rgba(210, 177, 76, 0.3)', marginVertical: 32 },
  researchContainer: { borderWidth: 1, position: 'relative', overflow: 'hidden' },
  researchRow: { flexDirection: 'row', alignItems: 'center' },
  researchIconCircle: { width: 50, height: 50, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  researchTextContainer: { flex: 1, marginRight: 12 },
  researchTitle: { fontSize: 17, fontWeight: '700', marginBottom: 4 },
  researchSubtitle: { fontSize: 13, lineHeight: 18 },
  researchBadge: { marginTop: 12, padding: 12, borderRadius: 12, borderLeftWidth: 3, flexDirection: 'row', alignItems: 'center', gap: 8 },
  researchBadgeText: { flex: 1, fontSize: 13, fontWeight: '600', lineHeight: 18 },
});

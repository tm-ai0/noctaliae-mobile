# Refonte UX : PostRecordingScreen + OnboardingDeepDream

## Philosophie
Principe top 0.1% : "après un moment intime, zéro décision". Show, don't tell. Decide for them, don't ask.

---

## 1. PostRecordingScreen.js — Simplification radicale

### Ce qui DISPARAÎT de l'UI (supprimer le JSX + styles associés) :
- **Tooltip/bandeau guidance** ("Enregistrement terminé !") → `showGuidanceTooltip`, `tooltipAnim`, `GUIDANCE_TOOLTIP_KEY`, `dismissGuidanceTooltip()`, tout le bloc `{showGuidanceTooltip && (...)}` et ses styles (`guidanceTooltip`, `guidanceContent`, `guidanceIconContainer`, `guidanceTextContainer`, `guidanceTitle`, `guidanceText`, `guidanceDismissButton`, `guidanceDismissText`)
- **Onglets Analyse/Transcript** → `activeTab`, `setActiveTab`, tout le bloc `tabsWrapper`/`tabsContainer`, les styles `tabsWrapper`, `tabsContainer`, `tab`, `tabActive`, `tabText`, `tabTextActive`. L'écran n'a plus d'onglets, tout est sur une seule vue.
- **Barre info durée** → tout le bloc `infoBar` avec ses styles (`infoBar`, `infoItem`, `infoText`, `infoTextHint`, `infoDivider`)
- **Section métadonnées dépliable** → `showMetadata`, `dreamMetadata`, `EMOTIONS_LIST`, `THEMES_LIST`, `toggleMeta`, `hasMetadata`, tout le bloc `metaToggle` + `metaPanel` et TOUS leurs styles (`metaToggle`, `metaToggleLeft`, `metaToggleText`, `metaPanel`, `metaLabel`, `metaRating`, `metaRatingLabel`, `metaDot*`, `metaChip*`, `metaHint`). NOTE : ne pas supprimer `metaPayload` dans `handleAnalyze()` — le mettre simplement à `null` (on réintroduira les métadonnées ailleurs plus tard).
- **Bandeau moteur visible** → le bloc `engineIndicator` et ses styles. On garde la LOGIQUE d'auto-sélection dans `handleAnalyze()`, on supprime juste l'UI visible.

### Ce qui RESTE :
- Header avec bouton retour + titre "Analyse du rêve"
- Transcription éditable (le TextInput), directement visible sans onglet
- Le tooltip d'aide au-dessus du TextInput (celui avec l'ampoule, adapté selon `source`)
- Bouton flottant "Analyser mon rêve"
- Toute la logique `handleAnalyze()` (auto-sélection moteur, appels API, navigation, error handling)
- `ActivateDeepDreamModal` (reste disponible si nécessaire)
- `AlertComponent`

### Nouveau layout (de haut en bas) :
```
[← Retour]     Analyse du rêve     [espace]

[💡 Tooltip contextuel selon source]
  - source='record' : "La transcription peut contenir des erreurs. Modifiez si nécessaire."
  - source='write' : "Relisez votre rêve avant l'analyse."
  - source='photo-*' : "Vérifiez la transcription de votre image."

[==== TRANSCRIPTION ÉDITABLE (TextInput) ====]
  (plein écran, flex: 1, même style que l'actuel transcriptBox/transcriptInput)

[Petit indicateur moteur — UNE LIGNE, pas un bloc]
  Juste un texte 12px discret sous le TextInput :
  - Premium → "✨ DeepDream"  couleur #4F8DFF
  - 1ère analyse gratuite → "✨ 1ère analyse DeepDream offerte"  couleur #4F8DFF
  - Sinon → "⚡ QuickDream"  couleur #00FFB0
  Pas de background, pas de border, pas de bloc — juste du texte aligné à gauche.

[====== CTA FLOTTANT ======]
  🧠 Analyser mon rêve
  (identique à l'actuel floatingAnalyzeButton, toujours visible)
```

### Détails d'implémentation :
- Supprimer `activeTab` et le state associé. Plus de condition `activeTab === 'choice'` vs `'transcript'`.
- Le contenu du ScrollView est directement : tooltip + TextInput + indicateur moteur.
- Le TextInput prend tout l'espace disponible (flex: 1 dans le ScrollView, minHeight: 300).
- Le bouton "Valider et choisir l'analyse" qui était dans l'onglet transcript disparaît aussi.
- Dans `handleAnalyze()`, mettre `metaPayload` à `null` (on ne collecte plus de metadata ici).
- Le `floatingAnalyzeContainer` n'est plus conditionné par `activeTab === 'choice'` — il est toujours visible.

---

## 2. OnboardingDeepDream.js — Show don't tell

### Ce qui DISPARAÎT :
- **La feature list entière** → le composant `Feature`, `featureList`, `featureRow`, `featureIconWrap`, `featureText` et tous les `<Feature icon="..." text="..." />`.
- **Le tagline** "Analyse neuroscientifique avec les 6 frameworks de référence."
- **Le teaser unlock** → `unlockTeaser`, `unlockTeaserText` et le bloc JSX associé.
- **Le state `isActivating`** et la fonction `handleActivate` (on ne propose plus d'activer DeepDream depuis l'onboarding — la 1ère analyse le fait automatiquement).

### Ce qui RESTE :
- Tout le background (glows, phosphènes)
- Le moon badge + headline "Vous êtes prêt."
- Le subtitle (légèrement modifié, voir ci-dessous)
- La card QuickDream "Actif"
- Le séparateur "Ce qui vous attend"  → changer le texte en "Votre première analyse"
- Le footer avec le CTA "Commencer mon premier rêve" (qui appelle `handleSkip` → `goHome`)

### Nouveau contenu de la card DeepDream (remplace feature list) :

La card garde la même structure visuelle (deepCard, deepAccentBar, deepHeader avec icône + titre "DeepDream Engine"). Mais le contenu change :

```jsx
{/* Avant/Après — Contraste visuel */}
<View style={styles.comparisonContainer}>
  {/* QUICK — aperçu atténué */}
  <View style={styles.comparisonQuick}>
    <Text style={styles.comparisonLabel}>⚡ QuickDream</Text>
    <Text style={styles.comparisonPreview}>
      "Votre rêve contient des thèmes de peur et de changement. Cela peut refléter une période de transition."
    </Text>
  </View>

  {/* Séparateur VS */}
  <View style={styles.comparisonDivider}>
    <Text style={styles.comparisonVS}>vs</Text>
  </View>

  {/* DEEP — aperçu lumineux */}
  <View style={styles.comparisonDeep}>
    <Text style={styles.comparisonLabel}>✨ DeepDream</Text>
    <Text style={styles.comparisonPreviewDeep}>
      "Le corridor sombre de votre rêve évoque ce que Revonsuo appelle une simulation de menace — votre cerveau répète un scénario anxiogène pour mieux vous y préparer..."
    </Text>
    <View style={styles.comparisonExtras}>
      <View style={styles.comparisonExtraItem}>
        <Text style={styles.comparisonExtraIcon}>🎨</Text>
        <Text style={styles.comparisonExtraText}>Image IA unique</Text>
      </View>
      <View style={styles.comparisonExtraItem}>
        <Text style={styles.comparisonExtraIcon}>💬</Text>
        <Text style={styles.comparisonExtraText}>Conversation</Text>
      </View>
    </View>
  </View>
</View>

{/* Ligne unique sous la card */}
<Text style={styles.freeTrialLine}>
  Votre première analyse DeepDream est offerte.
</Text>
```

### Nouveaux styles à créer :
```javascript
comparisonContainer: {
  gap: 0,
  marginTop: 12,
},
comparisonQuick: {
  backgroundColor: 'rgba(255,255,255,0.03)',
  borderRadius: 10,
  padding: 14,
  marginBottom: 2,
},
comparisonDeep: {
  backgroundColor: 'rgba(79, 141, 255, 0.06)',
  borderRadius: 10,
  padding: 14,
  borderWidth: 1,
  borderColor: 'rgba(79, 141, 255, 0.2)',
},
comparisonLabel: {
  fontSize: 12,
  fontFamily: 'AtkinsonHyperlegibleNext-Bold',
  color: OB.textSub,  // pour Quick
  marginBottom: 6,
},
comparisonPreview: {
  fontSize: 13,
  fontFamily: 'AtkinsonHyperlegibleNext-Regular',
  color: OB.textMuted,  // Gris très atténué
  lineHeight: 19,
  fontStyle: 'italic',
},
comparisonPreviewDeep: {
  fontSize: 13,
  fontFamily: 'AtkinsonHyperlegibleNext-Regular',
  color: OB.text,  // Blanc lisible — contraste fort vs le Quick
  lineHeight: 19,
  fontStyle: 'italic',
},
comparisonDivider: {
  alignItems: 'center',
  paddingVertical: 6,
},
comparisonVS: {
  fontSize: 11,
  fontFamily: 'AtkinsonHyperlegibleNext-Bold',
  color: OB.textMuted,
  letterSpacing: 1,
},
comparisonExtras: {
  flexDirection: 'row',
  gap: 16,
  marginTop: 10,
},
comparisonExtraItem: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 4,
},
comparisonExtraIcon: {
  fontSize: 14,
},
comparisonExtraText: {
  fontSize: 11,
  fontFamily: 'AtkinsonHyperlegibleNext-Bold',
  color: OB.blue,
},
freeTrialLine: {
  fontSize: 13,
  fontFamily: 'AtkinsonHyperlegibleNext-Regular',
  color: OB.blue,
  textAlign: 'center',
  marginTop: 14,
  opacity: 0.8,
},
```

### Modifier le subtitle :
Changer :
```
Votre journal de rêves vous attend. Commencez dès maintenant — gratuit, sans limite.
```
En :
```
Votre journal de rêves est prêt. La première analyse est offerte avec notre moteur le plus avancé.
```

### Modifier le texte du séparateur :
Changer "Ce qui vous attend" → "Voyez la différence"

---

## Résumé des fichiers modifiés :
1. `src/screens/PostRecordingScreen.js` — Simplification majeure (suppression ~200 lignes de JSX + styles)
2. `src/screens/onboarding/OnboardingDeepDream.js` — Remplacement feature list par avant/après visuel

## Fichiers NON modifiés :
- `handleAnalyze()` logique interne → INTACTE (auto-select moteur, API calls, navigation)
- `premiumService.js` → INTACT
- `freeTierService.js` → INTACT
- `ActivateDeepDreamModal.js` → INTACT (reste importé, utilisé si besoin)
- `App.js` → INTACT
- `ConversationScreen.js` → INTACT

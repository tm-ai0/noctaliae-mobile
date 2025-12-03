# 🎨 GUIDE DE STYLE - Palette Scientifique Noctaliae

## 🌈 Palette de Couleurs Complète

### 1️⃣ Couleurs Principales

```javascript
// FOND PRINCIPAL - Bleu-Mauve Foncé
background: '#0c0e27'          // Fond principal de l'app
backgroundDeep: '#08091c'       // Fond encore plus profond
backgroundElevated: '#0f1130'   // Fond pour éléments surélevés

// ACCENT PRINCIPAL - Vert-Bleu Néon (CRITIQUE)
primary: '#00FFB0'              // ✨ CTA, boutons, éléments interactifs
primaryDark: '#00D994'          // Variante plus foncée
primaryLight: '#33FFBD'         // Variante plus claire
primaryGlow: 'rgba(0, 255, 176, 0.15)'   // Fond subtil
primaryStrong: 'rgba(0, 255, 176, 0.25)' // Fond plus prononcé
```
### 🔥 Couleurs variantes 1 à essayer ! important mise à jour le 22/11/25
**Réflexion sur les nuances de vert et les contrastes**

Je me demande si je devrais définir l'accent vert comme "Neon Green (Primary) #39FF14" ou opter pour un vert légèrement bleuâtre, comme "Lime Neon #39FF88", plus premium. Je dois aussi m'assurer que les contrastes avec le fond sombre (#0B0F14) sont conformes aux critères d'accessibilité. Je vais proposer une palette avec des nuances de vert et des accents frais comme le cyan arctique et le bleu électrique. Chaque couleur doit être vérifiée pour garantir qu'elle reste cohérente et premium. Bon, allons-y.
### Checklist for identifying the best premium palette
- **Audit context:** Confirm dark UI baseline, privacy/pro-science tone, and neon green as the signature energy.
- **Set luminance rails:** Define contrast-safe neutrals, then pick accents with equal “cool freshness” and differing roles.
- **Test harmony:** Check each accent against neon green for temperature, luminance, and perceived quality (not just hue).
- **Stress accessibility:** Ensure WCAG contrast for text/icons on dark backgrounds; reserve saturated tones for highlights.
- **Prototype quickly:** Apply to CTAs, mic states, badges, and navigation to validate rhythm and hierarchy.

---

### Design constraints and intent for Noctaliæ
Noctaliæ’s interface signals scientific rigor, personalization (empreintes), privacy-on-device, and an AI analysis engine. The neon green conveys clarity and vitality; to feel premium, surrounding accents must stay cool, precise, and slightly restrained, with metal-like neutrals and ultraviolet/cyan edges. Saturation appears only where meaning is strong (CTA, active states, analysis engine), while most surfaces remain calm.

---

### Final palette for a premium, fresh dark UI

#### Core neutrals (foundation and typography)
- **Onyx 900:** ` #0A0D10`  
  - Role: App background on OLED/AMOLED; maximizes contrast and battery feel.
- **Carbon 800:** ` #11161D`  
  - Role: Cards, sheets, secondary surfaces; reduces starkness against Onyx.
- **Graphite 700:** ` #1A212B`  
  - Role: Elevated containers, modals, focused inputs.
- **Steel 500:** ` #2A3442`  
  - Role: Dividers, borders, disabled controls; cool and precise.
- **Mist 200:** ` #B8C3CF`  
  - Role: Secondary text; scientific clarity without glare.
- **Snow 50:** ` #F5F7FA`  
  - Role: Primary text on dark; crisp but gentle.

#### Primary identity (neon green)
- **Noctaliæ Neon 500:** ` #39FF88`  
  - Role: Primary CTA, active mic, success/ready states, signature highlights.
- **Noctaliæ Neon 300:** ` #7AFFB5`  
  - Role: Hover/focus rings, subtle pulses.
- **Noctaliæ Neon 700:** ` #12D66A`  
  - Role: Pressed states, dark-theme emphasis.

#### Accent set (all verified for freshness and high-end coherence with neon green)
- **Arctic Cyan 500:** ` #3CF0FF`  
  - Role: Secondary CTA, info/tooltips, analysis “live” indicators; cool, clean, lab-grade.
- **Electric Blue 500:** ` #4F8DFF`  
  - Role: Links, progress, deep-dive analysis; modern without gaming glare.
- **Ultraviolet 500:** ` #6B5CFF`  
  - Role: Advanced features (DeepDream badges), premium tiers; cool-violet adds depth.
- **Cyber Magenta 500:** ` #FF3FD1`  
  - Role: Rare highlights, discovery moments; skewed cool (blue-biased) to keep it fresh, not sugary.
- **Chrome 200 (metallic highlight):** ` #DDE2EA`  
  - Role: Icon strokes, thin separators, premium microdetails; evokes scientific instruments.

> Harmony check: All accents sit on the cool spectrum (cyan → blue → violet → cool magenta). Their hue distance from neon green avoids clash while keeping a shared “cold luminosity.” Luminance levels ensure crisp contrast on Onyx/Carbon; none drift into warm or muddy tones that would cheapen the feel.

---

### Usage mapping and component tokens

#### Calls-to-action and navigation
- **Primary CTA:** Noctaliæ Neon 500 on Carbon 800; text Snow 50; focus ring Neon 300; pressed Neon 700.
- **Secondary CTA:** Arctic Cyan 500; hover 400 (` #70F6FF`); pressed 600 (` #15D7E6`).
- **Links and micro-interactions:** Electric Blue 500; visited 600 (` #2C6EEA`); focus ring Chrome 200.

#### System states
- **Success:** Noctaliæ Neon 500 + a thin Chrome 200 underline (scientific, not celebratory).
- **Info/Live:** Arctic Cyan 500 pulsing to 300 for subtle animations.
- **Warning (cool discipline):** **Amber-cool 500** ` #FFC85A` used sparingly on Graphite 700; keep minimal to avoid warmth creep.
- **Error (clinical):** **Crimson-cool 500** ` #FF4D6D` with Electric Blue 500 outlines for precision.

#### Badges and tiers (DeepDream, advanced version)
- **Ultraviolet 500** text/stroke + Chrome 200 microline + Neon 500 dot accent → reads premium and technical.
- **Cyber Magenta 500** for “experimental” flags; pair with Graphite 700 to prevent candy tone.

---

### Harmony verification with neon green (freshness + premium)

- **Arctic Cyan 500 (` #3CF0FF`)**  
  - Freshness: Shared cool luminance; feels “sterile-clean.”  
  - Premium: Metallic with Chrome; pairs in gradients without nightclub vibes.

- **Electric Blue 500 (`#4F8DFF`)**  
  - Freshness: Cool mid-sat; precise edges for text/icons.  
  - Premium: Corporate-scientific, non-gamer; excellent for data density.

- **Ultraviolet 500 (` #6B5CFF`)**  
  - Freshness: Cold-violet avoids warmth; adds depth and mystery.  
  - Premium: Signals advanced features; balances the neon with gravitas.

- **Cyber Magenta 500 (` #FF3FD1`)**  
  - Freshness: Blue-biased magenta keeps it icy, not sweet.  
  - Premium: Use sparingly; luxe when constrained to highlights.

- **Chrome 200 (` #DDE2EA`)**  
  - Freshness: Clean reflections; reads as scientific hardware.  
  - Premium: Elevates micro-details and typography cadence.

All accents maintain cool temperature, high clarity, and avoid warm contamination. With Onyx/Carbon bases, each stays contrast-safe for icons and small UI elements.

---

### Gradient and motion recipes (premium without noise)
- **Signature beam:** Noctaliæ Neon 500 → Arctic Cyan 500 (linear 30°); stop bias 40/60; gentle 6% blur.
- **Deep analysis:** Electric Blue 500 → Ultraviolet 500 (radial); center 30%; opacity 85%; shadow in Graphite 700.
- **Discovery pulse:** Cyber Magenta 500 ring 1px, glow to Ultraviolet 500 at 30% opacity; duration 900ms, cubic-bezier eased, no bloom.

---

### Accessibility notes (keep it clinical)
- **Text on Onyx/Carbon:** Snow 50 and Mist 200 stay above contrast thresholds for body and secondary text.  
- **Accents on dark:** Use accents for icons, strokes, and small badges; reserve body text for neutrals.  
- **Saturation discipline:** Avoid large fields of saturated accents; prefer thin lines, dots, and controlled glows.

---

### What a top 0.1% UX/UI + color theory person would think and do
- **Perceptual uniformity:** Tune hues in HSLuv/OKLCH to maintain equal perceived saturation across cyan/blue/violet; adjust chroma so accents feel equally “bright” next to neon green.
- **Cross-device realism:** Test on OLED (true black), LCD (raised black), and Windows/Android gamma profiles; correct for dark crush and banding in gradients.
- **Gamut and contrast:** Ensure WCAG AA for critical text; treat accents as affordances, not text fills; verify contrast in real sizes, not mock ratios.
- **Brand emotion control:** Keep warmth out; when warnings are needed, use cool-amber with small footprint; prioritize scientific trust over spectacle.
- **Micro-detail craft:** Use Chrome 200 for 1px rules, icon inner strokes, and selection indicators; refine focus rings with Neon 300 so accessibility feels elegant, not loud.
- **Systematic tokens:** Define semantic roles (primary, info, analysis, advanced, experimental) and lock tones to those roles to avoid palette drift over time.

If you want, I can translate these into design tokens (CSS/React Native), apply them to your current screens (CTA, mic, DeepDream badge), and sanity-check contrast in situ.

### 🔥 Couleurs variantes 2 à essayer ! important mise à jour le 22/11/25
Parfait, Thomas. Voici une **autre déclinaison** de la palette premium, pensée pour ton rôle de designer technique et pour l’interface Noctaliæ, sans image — juste du **sémantique, du code, et du sens**.

---



## 🎨 Déclinaison en tokens React Native (ou CSS variables)

### 🌑 Neutres (fondations et typographie)
```js
--color-bg-primary: #0A0D10;       // Onyx 900
--color-bg-secondary: #11161D;     // Carbon 800
--color-surface: #1A212B;          // Graphite 700
--color-border: #2A3442;           // Steel 500
--color-text-primary: #F5F7FA;     // Snow 50
--color-text-secondary: #B8C3CF;   // Mist 200
```

### 💚 Couleur signature Noctaliæ (neon green)
```js
--color-accent-primary: #00FFB0;   // Neon 500
--color-accent-hover: #7AFFB5;     // Neon 300
--color-accent-pressed: #12D66A;   // Neon 700
```

### 🧊 Accents premium
```js
--color-accent-cyan: #3CF0FF;      // Arctic Cyan 500
--color-accent-blue: #4F8DFF;      // Electric Blue 500
--color-accent-violet: #6B5CFF;    // Ultraviolet 500
--color-accent-magenta: #FF3FD1;   // Cyber Magenta 500
--color-accent-chrome: #DDE2EA;    // Chrome 200
```

### ⚠️ États système
```js
--color-success: #39FF88;          // Neon green
--color-info: #3CF0FF;             // Cyan
--color-warning: #FFC85A;          // Amber-cool 500
--color-error: #FF4D6D;            // Crimson-cool 500
```

---

## 🧠 Déclinaison par rôle sémantique (UX/UI)

| Rôle                     | Couleur principale      | Usage typique                                 |
|--------------------------|-------------------------|------------------------------------------------|
| CTA principal            | `#39FF88` (Neon)        | Bouton “Commencer”, micro actif               |
| CTA secondaire           | `#3CF0FF` (Cyan)        | Bouton “En savoir plus”, focus                |
| Lien / navigation        | `#4F8DFF` (Blue)        | Liens, navigation, états actifs               |
| Badge DeepDream          | `#6B5CFF` (Violet)      | Version avancée, moteur activé                |
| Découverte / expérimental| `#FF3FD1` (Magenta)     | Nouveautés, exploration, “testez”             |
| Microdétails premium     | `#DDE2EA` (Chrome)      | Icônes, séparateurs, focus rings              |

---

## 🧪 Déclinaison typographique

- **Titres** : `#F5F7FA` sur fond `#0A0D10` → contraste AA+
- **Sous-titres / légendes** : `#B8C3CF` → lisibilité douce, scientifique
- **Badges / labels** : `#6B5CFF` ou `#FF3FD1` selon le niveau d’expérimentation
- **Focus ring** : `#7AFFB5` ou `#DDE2EA` selon le contexte (CTA vs input)

---

## 🧬 Déclinaison motion / animation

- **Pulse mic actif** : `#39FF88` → `#7AFFB5` → `#12D66A` (durée 800ms, ease-in-out)
- **Badge DeepDream** : halo `#6B5CFF` + micro-glow `#DDE2EA` (opacity 0.2)
- **Focus input** : ring `#3CF0FF` + inner stroke `#DDE2EA`

---

### 2️⃣ Cards & Profondeur

```javascript
// CARDS - Vert Foncé
cardBackground: '#0C2552'       // 🟦 Fond des cards
cardBackgroundHover: '#0F2E66'  // Hover state
cardBorder: 'rgba(0, 255, 176, 0.08)' // Bordure subtile
```

### 3️⃣ Chaleur & Accents Secondaires

```javascript
// OR DÉSATURÉ - Badges "Light"
warmGold: '#ffc31fff'             // 🟡 Couleur or
warmGoldDark: '#B89A3E'         // Variante foncée
warmGoldSubtle: 'rgba(210, 177, 76, 0.12)' // Fond subtil

// BRUN DÉSATURÉ - Éléments chaleureux
warmBrown: '#88735C'            // 🟤 Couleur brune
warmBrownSubtle: 'rgba(136, 115, 92, 0.12)' // Fond subtil
```

### 4️⃣ Textes (IMPORTANT pour la lisibilité)

```javascript
// HIÉRARCHIE DES TEXTES
textPrimary: '#FFFFFF'          // ⚪ Texte principal (blanc pur)
textSecondary: '#A0B4D4'        // 🔵 Texte secondaire (gris-vert clair LISIBLE)
textTertiary: '#7B8DAA'         // Texte tertiaire
textMuted: '#5A6B89'            // Texte très discret
```

### 5️⃣ Badges & États

```javascript
// ANALYSE DEEP (Mode Premium)
deepAnalysis: '#8A2BE2'         // 🟣 Violet
deepAnalysisSubtle: 'rgba(138, 43, 226, 0.15)' // Fond subtil

// ANALYSE LIGHT (Mode Gratuit)
lightAnalysis: '#ffc31fff'        // 🟡 Or (même que warmGold)
lightAnalysisSubtle: 'rgba(210, 177, 76, 0.15)' // Fond subtil

// ÉTATS SYSTÈME
success: '#00FFB0'              // ✅ Vert néon (même que primary)
successSubtle: 'rgba(0, 255, 176, 0.12)'
warning: '#D2B14C'              // ⚠️ Or
warningSubtle: 'rgba(210, 177, 76, 0.12)'
error: '#FF5757'                // ❌ Rouge
errorSubtle: 'rgba(255, 87, 87, 0.12)'
```

---

## 📏 Tailles & Espacements

### Tailles de Texte

```javascript
fontSize: {
  xs: 11,      // Très petit (badges, labels)
  sm: 12,      // Petit (descriptions courtes)
  md: 14,      // Moyen (textes secondaires)
  base: 16,    // Base (texte principal)
  lg: 18,      // Large (titres de cards)
  xl: 20,      // Très large (sous-titres)
  xxl: 24,     // Énorme (titres de sections)
  xxxl: 28,    // Gigantesque (titres principaux)
  huge: 32,    // Colossal (titres de pages)
}
```

### Poids de Fonte

```javascript
fontWeight: {
  regular: '400',    // Normal
  medium: '500',     // Moyen
  semibold: '600',   // Semi-gras
  bold: '700',       // Gras
  extrabold: '800',  // Extra-gras
}
```

### Espacements

```javascript
spacing: {
  xs: 4,     // Très serré
  sm: 8,     // Serré
  md: 16,    // Normal
  lg: 24,    // Large
  xl: 32,    // Très large
  xxl: 48,   // Énorme
}
```

### Bordures Arrondies

```javascript
borderRadius: {
  xs: 4,     // Très léger arrondi
  sm: 8,     // Léger arrondi
  md: 12,    // Arrondi moyen
  lg: 16,    // Arrondi large
  xl: 20,    // Très arrondi
  xxl: 24,   // Énorme arrondi
  round: 999, // Complètement rond (boutons, etc.)
}
```

---

## 💫 Ombres (Shadows)

```javascript
// OMBRES STANDARDS
shadow.sm   // Cartes subtiles
shadow.md   // Cartes standards
shadow.lg   // Éléments importants

// OMBRES NÉON (pour CTA)
shadow.neon       // Effet glow vert modéré
shadow.neonStrong // Effet glow vert intense
```

**Exemple d'utilisation :**
```javascript
const styles = StyleSheet.create({
  ctaButton: {
    backgroundColor: THEME.colors.primary,
    ...THEME.shadow.neon,  // ✨ Effet néon !
  }
});
```

---

## 🎯 Règles d'Utilisation STRICTES

### ✅ TOUJOURS Faire

1. **Utiliser THEME.colors.*** pour TOUTES les couleurs
2. **Utiliser THEME.fontSize.*** pour toutes les tailles de texte
3. **Utiliser THEME.fontWeight.*** pour tous les poids de fonte
4. **Utiliser THEME.borderRadius.*** pour tous les arrondis
5. **Utiliser THEME.shadow.*** pour toutes les ombres
6. **Utiliser THEME.spacing.*** pour tous les espacements

### ❌ JAMAIS Faire

1. **JAMAIS** écrire de couleurs en dur (ex: `color: '#FFFFFF'` ❌)
2. **JAMAIS** écrire de tailles en dur (ex: `fontSize: 16` ❌)
3. **JAMAIS** mélanger les styles de shadow Platform.select

### 🎨 Exemples Corrects

```javascript
// ✅ CORRECT
const styles = StyleSheet.create({
  card: {
    backgroundColor: THEME.colors.cardBackground,
    borderRadius: THEME.borderRadius.lg,
    padding: THEME.spacing.md,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
    ...THEME.shadow.md,
  },
  title: {
    fontSize: THEME.fontSize.xl,
    fontWeight: THEME.fontWeight.bold,
    color: THEME.colors.textPrimary,
  },
  subtitle: {
    fontSize: THEME.fontSize.md,
    color: THEME.colors.textSecondary,
  }
});
```

```javascript
// ❌ INCORRECT
const styles = StyleSheet.create({
  card: {
    backgroundColor: '#0C2552',  // ❌ Couleur en dur
    borderRadius: 16,            // ❌ Taille en dur
    padding: 16,                 // ❌ Espacement en dur
  },
  title: {
    fontSize: 20,                // ❌ Taille en dur
    fontWeight: '700',           // ❌ Poids en dur
    color: '#FFFFFF',            // ❌ Couleur en dur
  }
});
```

---

## 🎨 Composition de Couleurs par Contexte

### Boutons CTA (Call-to-Action)

```javascript
ctaButton: {
  backgroundColor: THEME.colors.primary,     // Vert néon
  ...THEME.shadow.neon,                      // Effet glow
}
ctaButtonText: {
  color: THEME.colors.background,           // Texte sombre sur fond clair
  fontWeight: THEME.fontWeight.bold,
}
```

### Cards Standard

```javascript
card: {
  backgroundColor: THEME.colors.cardBackground, // #0C2552
  borderRadius: THEME.borderRadius.lg,
  borderWidth: 1,
  borderColor: THEME.colors.cardBorder,        // Bordure subtile
  ...THEME.shadow.md,
}
```

### Badges Premium/Deep

```javascript
badgePremium: {
  backgroundColor: THEME.colors.deepAnalysisSubtle,
  borderWidth: 1.5,
  borderColor: THEME.colors.deepAnalysis,
}
badgePremiumText: {
  color: THEME.colors.textPrimary,  // Blanc
  fontSize: THEME.fontSize.xs,
}
```

### Badges Light

```javascript
badgeLight: {
  backgroundColor: THEME.colors.warmGoldSubtle,
  borderWidth: 1.5,
  borderColor: THEME.colors.warmGold,
}
badgeLightText: {
  color: THEME.colors.textPrimary,  // Blanc
  fontSize: THEME.fontSize.xs,
}
```

---

## 🔍 Vérification Rapide

Avant de committer du code, vérifie :

- [ ] Aucune couleur en dur (#XXXXXX)
- [ ] Aucune taille en dur pour fontSize
- [ ] Aucun poids en dur pour fontWeight
- [ ] Tous les borderRadius utilisent THEME.borderRadius.*
- [ ] Tous les espacements utilisent THEME.spacing.*
- [ ] Les ombres utilisent THEME.shadow.* (pas de Platform.select manuel)

---

## 🎯 Raccourcis pour Dev

```javascript
import { THEME } from './src/config/theme';

// Raccourcis fréquents
const C = THEME.colors;
const S = THEME.spacing;
const F = THEME.fontSize;
const W = THEME.fontWeight;
const R = THEME.borderRadius;

// Utilisation
const styles = StyleSheet.create({
  container: {
    backgroundColor: C.background,
    padding: S.md,
  },
  title: {
    fontSize: F.xl,
    fontWeight: W.bold,
    color: C.textPrimary,
  }
});
```

---

*Guide créé le 08/11/2025 pour Noctaliae*
*Palette scientifique stricte - Pas de compromis !*

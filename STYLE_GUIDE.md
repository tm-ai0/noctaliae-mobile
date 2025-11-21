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
warmGold: '#D2B14C'             // 🟡 Couleur or
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
lightAnalysis: '#D2B14C'        // 🟡 Or (même que warmGold)
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

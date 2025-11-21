# 🧪 GUIDE DE TESTS NOCTALIÆ

Ce guide explique comment écrire et lancer les tests pour Noctaliæ.

---

## 📋 TABLE DES MATIÈRES

1. [Configuration](#configuration)
2. [Types de tests](#types-de-tests)
3. [Écrire des tests](#écrire-des-tests)
4. [Lancer les tests](#lancer-les-tests)
5. [Coverage](#coverage)
6. [Best practices](#best-practices)
7. [Exemples](#exemples)

---

## ⚙️ CONFIGURATION

### Fichiers de configuration

- `jest.config.js` : Configuration Jest
- `jest.setup.js` : Mocks globaux
- `package.json` : Scripts de test

### Dépendances requises

```bash
npm install --save-dev \
  jest \
  @testing-library/react-native \
  @testing-library/jest-native \
  @testing-library/react-hooks
```

Déjà configurées dans le projet ✅

---

## 🎯 TYPES DE TESTS

### 1. Tests unitaires

**Quoi tester** : Fonctions pures, utilitaires, helpers

**Exemple** : Formater une date, parser une analyse IA

```typescript
// src/utils/__tests__/dateUtils.test.ts
describe('formatDate', () => {
  it('should format timestamp to readable date', () => {
    const result = formatDate(1700000000000);
    expect(result).toBe('15 novembre 2023');
  });
});
```

### 2. Tests de stores (Zustand)

**Quoi tester** : Actions, state updates, persistence

**Exemple** : Ajouter/supprimer un rêve

```typescript
// src/stores/__tests__/dreamStore.test.ts
describe('dreamStore', () => {
  it('should add a dream', () => {
    const { result } = renderHook(() => useDreamStore());
    
    act(() => {
      result.current.addDream(mockDream);
    });
    
    expect(result.current.dreams).toHaveLength(1);
  });
});
```

### 3. Tests de hooks

**Quoi tester** : Logique métier, effets, async operations

**Exemple** : Hook d'enregistrement audio

```typescript
// src/hooks/__tests__/useRecording.test.ts
describe('useRecording', () => {
  it('should start recording', async () => {
    const { result } = renderHook(() => useRecording());
    
    await act(async () => {
      await result.current.startRecording();
    });
    
    expect(result.current.isRecording).toBe(true);
  });
});
```

### 4. Tests de services

**Quoi tester** : Appels API, transformations de données

**Exemple** : Service d'API

```typescript
// src/services/__tests__/apiService.test.ts
describe('apiService', () => {
  it('should transcribe audio', async () => {
    const result = await apiService.transcribe('path/to/audio.mp3');
    
    expect(result.transcript).toBeDefined();
    expect(result.duration).toBeGreaterThan(0);
  });
});
```

### 5. Tests de composants

**Quoi tester** : Rendu, interactions, props

**Exemple** : DreamCard

```typescript
// src/components/__tests__/DreamCard.test.tsx
describe('DreamCard', () => {
  it('should render dream info', () => {
    const { getByText } = render(<DreamCard dream={mockDream} />);
    
    expect(getByText(mockDream.title)).toBeDefined();
    expect(getByText(mockDream.emoji)).toBeDefined();
  });
});
```

---

## ✍️ ÉCRIRE DES TESTS

### Structure d'un test

```typescript
import { renderHook, act } from '@testing-library/react-hooks';
import { useMyHook } from '../useMyHook';

describe('useMyHook', () => {
  // Setup avant chaque test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Test 1
  it('should do something', async () => {
    // Arrange (préparer)
    const input = 'test';
    
    // Act (agir)
    const { result } = renderHook(() => useMyHook());
    await act(async () => {
      await result.current.doSomething(input);
    });
    
    // Assert (vérifier)
    expect(result.current.output).toBe('expected');
  });

  // Test 2
  it('should handle errors', async () => {
    // ...
  });
});
```

### Patterns AAA

**Arrange** → Préparer les données
**Act** → Exécuter l'action
**Assert** → Vérifier le résultat

### Mocking

#### Mock d'une fonction

```typescript
const mockFunction = jest.fn();
mockFunction.mockReturnValue('result');
mockFunction.mockResolvedValue('async result');
```

#### Mock d'un module

```typescript
jest.mock('@/services/apiService', () => ({
  transcribe: jest.fn().mockResolvedValue({ transcript: 'test' }),
  analyze: jest.fn().mockResolvedValue({ analysis: 'test analysis' }),
}));
```

#### Mock d'AsyncStorage

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

AsyncStorage.setItem = jest.fn();
AsyncStorage.getItem = jest.fn().mockResolvedValue(JSON.stringify(data));
```

---

## 🚀 LANCER LES TESTS

### Commandes de base

```bash
# Tous les tests
npm test

# Mode watch (relance auto)
npm test -- --watch

# Test spécifique
npm test dreamStore.test.ts

# Avec coverage
npm test -- --coverage

# Mode verbose (détails)
npm test -- --verbose
```

### Scripts package.json

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:ci": "jest --ci --coverage --maxWorkers=2"
  }
}
```

---

## 📊 COVERAGE

### Générer le coverage

```bash
npm test -- --coverage
```

### Rapport HTML

```bash
npm test -- --coverage
# Ouvre: coverage/lcov-report/index.html
```

### Objectifs de coverage

```javascript
// jest.config.js
coverageThresholds: {
  global: {
    branches: 50,    // 50% des branches testées
    functions: 50,   // 50% des fonctions testées
    lines: 50,       // 50% des lignes testées
    statements: 50,  // 50% des statements testés
  },
}
```

### Ce qu'il faut couvrir en priorité

1. **Stores Zustand** (critiques) → 80%+
2. **Services API** (critiques) → 70%+
3. **Hooks customs** → 70%+
4. **Utilitaires** → 60%+
5. **Composants** → 50%+

---

## 💡 BEST PRACTICES

### 1. Un test = Une responsabilité

❌ **Mauvais** : Tester plusieurs choses
```typescript
it('should do A and B and C', () => {
  // Trop de choses testées
});
```

✅ **Bon** : Un test par comportement
```typescript
it('should do A', () => { /* ... */ });
it('should do B', () => { /* ... */ });
it('should do C', () => { /* ... */ });
```

### 2. Noms de tests descriptifs

❌ **Mauvais**
```typescript
it('works', () => { /* ... */ });
```

✅ **Bon**
```typescript
it('should add dream to store and persist to AsyncStorage', () => { /* ... */ });
```

### 3. Tester les cas limites

```typescript
describe('analyzeDream', () => {
  it('should handle empty transcript', async () => { /* ... */ });
  it('should handle very long transcript', async () => { /* ... */ });
  it('should handle special characters', async () => { /* ... */ });
  it('should handle API timeout', async () => { /* ... */ });
  it('should handle network error', async () => { /* ... */ });
});
```

### 4. Utiliser des données de test cohérentes

```typescript
// src/utils/testData.ts
export const mockDream = {
  id: '1',
  userId: 'user123',
  timestamp: 1700000000000,
  transcript: 'Je rêvais que je volais',
  analysis: 'Le vol symbolise...',
  // ...
};

export const mockUser = {
  id: 'user123',
  email: 'test@example.com',
  // ...
};
```

### 5. Cleanup après chaque test

```typescript
beforeEach(() => {
  jest.clearAllMocks();
  AsyncStorage.clear();
});

afterEach(() => {
  cleanup(); // Pour @testing-library/react-native
});
```

---

## 📚 EXEMPLES COMPLETS

### Exemple 1 : Test d'un store Zustand

```typescript
// src/stores/__tests__/dreamStore.test.ts
import { renderHook, act } from '@testing-library/react-hooks';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDreamStore } from '../dreamStore';

describe('dreamStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    AsyncStorage.clear();
  });

  it('should add a dream', async () => {
    const { result } = renderHook(() => useDreamStore());
    
    const newDream = {
      id: '1',
      transcript: 'Test dream',
      analysis: 'Test analysis',
    };

    await act(async () => {
      result.current.addDream(newDream);
    });

    expect(result.current.dreams).toHaveLength(1);
    expect(result.current.dreams[0]).toEqual(newDream);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      'dreams',
      expect.any(String)
    );
  });

  it('should update a dream', async () => {
    const { result } = renderHook(() => useDreamStore());
    
    const dream = { id: '1', title: 'Old title' };
    const updates = { title: 'New title' };

    await act(async () => {
      result.current.addDream(dream);
      result.current.updateDream('1', updates);
    });

    expect(result.current.dreams[0].title).toBe('New title');
  });

  it('should delete a dream', async () => {
    const { result } = renderHook(() => useDreamStore());
    
    const dream = { id: '1', title: 'Test' };

    await act(async () => {
      result.current.addDream(dream);
      result.current.deleteDream('1');
    });

    expect(result.current.dreams).toHaveLength(0);
  });

  it('should handle loading error', async () => {
    const { result } = renderHook(() => useDreamStore());
    
    const errorMessage = 'Storage error';
    AsyncStorage.getItem.mockRejectedValue(new Error(errorMessage));

    await act(async () => {
      await result.current.loadDreams();
    });

    expect(result.current.error).toBe(errorMessage);
    expect(result.current.dreams).toHaveLength(0);
  });
});
```

### Exemple 2 : Test d'un hook custom

```typescript
// src/hooks/__tests__/useDreamAnalysis.test.ts
import { renderHook, act } from '@testing-library/react-hooks';
import { useDreamAnalysis } from '../useDreamAnalysis';
import * as apiService from '@/services/apiService';

jest.mock('@/services/apiService');

describe('useDreamAnalysis', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should analyze a dream', async () => {
    const mockResult = {
      analysis: 'Test analysis',
      suggestedQuestions: ['Q1?', 'Q2?'],
      model: 'claude-sonnet-4',
    };

    apiService.analyze.mockResolvedValue(mockResult);

    const { result } = renderHook(() => useDreamAnalysis());

    await act(async () => {
      await result.current.analyze('Test transcript');
    });

    expect(result.current.isAnalyzing).toBe(false);
    expect(result.current.result).toEqual(mockResult);
    expect(result.current.error).toBeNull();
  });

  it('should handle analysis error', async () => {
    const errorMessage = 'API error';
    apiService.analyze.mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useDreamAnalysis());

    await act(async () => {
      await result.current.analyze('Test transcript');
    });

    expect(result.current.isAnalyzing).toBe(false);
    expect(result.current.error).toBeDefined();
    expect(result.current.result).toBeNull();
  });

  it('should set isAnalyzing during analysis', async () => {
    apiService.analyze.mockImplementation(() => 
      new Promise(resolve => setTimeout(resolve, 100))
    );

    const { result } = renderHook(() => useDreamAnalysis());

    let isAnalyzingDuringCall = false;

    await act(async () => {
      const promise = result.current.analyze('Test');
      isAnalyzingDuringCall = result.current.isAnalyzing;
      await promise;
    });

    expect(isAnalyzingDuringCall).toBe(true);
    expect(result.current.isAnalyzing).toBe(false);
  });
});
```

### Exemple 3 : Test d'un composant

```typescript
// src/components/__tests__/DreamCard.test.tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { DreamCard } from '../DreamCard';

const mockDream = {
  id: '1',
  title: 'Rêve de vol',
  emoji: '🕊️',
  date: '2025-11-21',
  tags: ['lucide', 'liberté'],
  summary: 'Je volais au-dessus de la ville',
};

describe('DreamCard', () => {
  it('should render dream information', () => {
    const { getByText } = render(<DreamCard dream={mockDream} />);

    expect(getByText('Rêve de vol')).toBeDefined();
    expect(getByText('🕊️')).toBeDefined();
    expect(getByText('Je volais au-dessus de la ville')).toBeDefined();
  });

  it('should render tags', () => {
    const { getByText } = render(<DreamCard dream={mockDream} />);

    expect(getByText('lucide')).toBeDefined();
    expect(getByText('liberté')).toBeDefined();
  });

  it('should call onPress when tapped', () => {
    const onPress = jest.fn();
    const { getByTestId } = render(
      <DreamCard dream={mockDream} onPress={onPress} />
    );

    fireEvent.press(getByTestId('dream-card'));

    expect(onPress).toHaveBeenCalledWith(mockDream.id);
  });

  it('should show loading state', () => {
    const { getByTestId } = render(
      <DreamCard dream={{ ...mockDream, isAnalyzing: true }} />
    );

    expect(getByTestId('loading-indicator')).toBeDefined();
  });
});
```

---

## 🎓 RESSOURCES

### Documentation

- Jest : https://jestjs.io/docs/getting-started
- React Native Testing Library : https://callstack.github.io/react-native-testing-library/
- Testing Hooks : https://react-hooks-testing-library.com/

### Tips

- Teste le comportement, pas l'implémentation
- Mock les dépendances externes (API, AsyncStorage, etc.)
- Garde les tests simples et lisibles
- Utilise `describe` pour grouper les tests logiquement
- Utilise des `it.skip()` pour les tests en cours

---

**Dernière mise à jour : 21/11/2025**

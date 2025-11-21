// ============================================
// 🌙 NOCTALIÆ - SENTRY CONFIGURATION
// ============================================

import * as Sentry from '@sentry/react-native';
import Constants from 'expo-constants';

// ============================================
// CONFIGURATION
// ============================================

const SENTRY_DSN = process.env.SENTRY_DSN || '';

const SENTRY_CONFIG = {
  dsn: SENTRY_DSN,
  
  // Environment
  environment: __DEV__ ? 'development' : 'production',
  
  // Release tracking
  release: `noctaliae@${Constants.expoConfig?.version || '1.0.0'}`,
  dist: Constants.expoConfig?.android?.versionCode?.toString() || '1',
  
  // Debug
  debug: __DEV__,
  
  // Performance monitoring
  tracesSampleRate: __DEV__ ? 1.0 : 0.2, // 100% en dev, 20% en prod
  
  // Enable auto session tracking
  enableAutoSessionTracking: true,
  
  // Session timeout (30 minutes)
  sessionTrackingIntervalMillis: 30000,
  
  // Breadcrumbs
  maxBreadcrumbs: 50,
  
  // Before send hook (pour filtrer les erreurs)
  beforeSend(event, hint) {
    // Ne pas envoyer en développement local
    if (__DEV__ && !SENTRY_DSN) {
      console.log('🔍 Sentry event (dev mode):', event);
      return null;
    }
    
    // Filtrer les erreurs non critiques
    if (event.level === 'warning') {
      return null;
    }
    
    return event;
  },
  
  // Ignore certaines erreurs connues
  ignoreErrors: [
    // Erreurs réseau temporaires
    'Network request failed',
    'Network Error',
    'fetch failed',
    
    // Erreurs React Navigation
    'The action',
    'Navigation',
    
    // Erreurs de timeout non critiques
    'Timeout',
  ],
};

// ============================================
// INITIALIZATION
// ============================================

export function initSentry() {
  if (!SENTRY_DSN && !__DEV__) {
    console.warn('⚠️ Sentry DSN not configured. Crash reporting disabled.');
    return;
  }
  
  try {
    Sentry.init(SENTRY_CONFIG);
    console.log('✅ Sentry initialized');
  } catch (error) {
    console.error('❌ Sentry initialization failed:', error);
  }
}

// ============================================
// HELPERS
// ============================================

/**
 * Capture une erreur manuellement
 */
export function captureError(error: Error, context?: Record<string, any>) {
  if (__DEV__) {
    console.error('🔴 Error:', error, context);
  }
  
  Sentry.withScope((scope) => {
    if (context) {
      Object.keys(context).forEach((key) => {
        scope.setExtra(key, context[key]);
      });
    }
    Sentry.captureException(error);
  });
}

/**
 * Capture un message (non-error log)
 */
export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
  if (__DEV__) {
    console.log(`📝 [${level}] ${message}`);
  }
  
  Sentry.captureMessage(message, level);
}

/**
 * Ajoute un breadcrumb (fil d'Ariane)
 */
export function addBreadcrumb(message: string, category: string, data?: Record<string, any>) {
  Sentry.addBreadcrumb({
    message,
    category,
    data,
    level: 'info',
    timestamp: Date.now() / 1000,
  });
}

/**
 * Set user context
 */
export function setUser(userId: string, email?: string, username?: string) {
  Sentry.setUser({
    id: userId,
    email,
    username,
  });
}

/**
 * Clear user context (lors de la déconnexion)
 */
export function clearUser() {
  Sentry.setUser(null);
}

/**
 * Set custom context
 */
export function setContext(key: string, context: Record<string, any>) {
  Sentry.setContext(key, context);
}

/**
 * Set tag for filtering
 */
export function setTag(key: string, value: string) {
  Sentry.setTag(key, value);
}

// ============================================
// ERROR BOUNDARY
// ============================================

export const SentryErrorBoundary = Sentry.ErrorBoundary;

// ============================================
// USAGE EXAMPLES
// ============================================

/*
1. DANS App.js/App.tsx :

import { initSentry, SentryErrorBoundary } from './src/config/sentry.config';

export default function App() {
  useEffect(() => {
    initSentry();
  }, []);
  
  return (
    <SentryErrorBoundary fallback={<ErrorFallback />}>
      <YourApp />
    </SentryErrorBoundary>
  );
}

2. CAPTURER UNE ERREUR :

import { captureError, addBreadcrumb } from '@/config/sentry.config';

try {
  await analyzeTree();
} catch (error) {
  captureError(error, {
    context: 'dream_analysis',
    dreamId: dream.id,
    model: 'claude-sonnet-4'
  });
}

3. AJOUTER DES BREADCRUMBS :

addBreadcrumb('User started recording', 'user_action');
addBreadcrumb('Recording stopped', 'user_action', { duration: 30 });
addBreadcrumb('Analysis started', 'api_call', { model: 'claude' });

4. SET USER INFO :

import { setUser } from '@/config/sentry.config';

setUser('user123', 'user@example.com', 'JohnDoe');

5. CRÉER VOTRE COMPTE SENTRY :

a) Va sur https://sentry.io/signup/
b) Crée un compte gratuit
c) Crée un nouveau projet "Noctaliæ" (React Native)
d) Copie le DSN fourni
e) Ajoute-le dans ton .env :

SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx

f) Installe le package :

npm install @sentry/react-native
npx @sentry/wizard -i reactNative -p android

g) Redémarre l'app et teste en forçant une erreur :

throw new Error('Test Sentry');

h) Vérifie dans Sentry dashboard que l'erreur est bien reçue
*/

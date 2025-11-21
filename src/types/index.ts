// ============================================
// 🌙 NOCTALIÆ - TYPES CENTRALISÉS
// ============================================

// ============================================
// DREAM TYPES
// ============================================

export interface Dream {
  id: string;
  userId: string;
  timestamp: number;
  date: string; // ISO format
  
  // Audio
  audioUri?: string;
  audioDuration?: number;
  
  // Transcription
  transcript: string;
  transcriptionModel?: 'whisper-1';
  
  // Analysis
  analysis: string;
  analysisModel: 'claude-sonnet-4' | 'llama-3.3-70b';
  analysisType: 'deep' | 'quick';
  
  // Metadata extracted from analysis
  title?: string;
  emoji?: string;
  tags?: string[];
  summary?: string;
  
  // Suggestions
  suggestedQuestions?: string[];
  
  // Status
  isAnalyzing?: boolean;
  hasError?: boolean;
  errorMessage?: string;
}

export interface DreamMetadata {
  title: string;
  emoji: string;
  tags: string[];
  summary: string;
}

// ============================================
// API TYPES
// ============================================

export interface TranscriptionRequest {
  audioUri: string;
}

export interface TranscriptionResponse {
  transcript: string;
  duration: number;
  model: string;
}

export interface AnalysisRequest {
  transcript: string;
  model?: 'claude-sonnet-4' | 'llama-3.3-70b';
}

export interface AnalysisResponse {
  analysis: string;
  suggestedQuestions: string[];
  model: string;
  processingTime?: number;
}

export interface ChatRequest {
  message: string;
  conversationHistory: ChatMessage[];
  dreamContext?: {
    transcript: string;
    analysis: string;
  };
  model?: 'claude-sonnet-4' | 'llama-3.3-70b';
}

export interface ChatResponse {
  response: string;
  model: string;
  processingTime?: number;
}

export interface ApiError {
  error: string;
  details?: string;
  code?: string;
  statusCode?: number;
}

// ============================================
// CONVERSATION TYPES
// ============================================

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  model?: string;
  isLoading?: boolean;
  hasError?: boolean;
}

export interface Conversation {
  id: string;
  dreamId: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}

// ============================================
// THEME TYPES
// ============================================

export type ThemeName = 
  | 'midnight' 
  | 'aurora' 
  | 'sunset' 
  | 'ocean' 
  | 'forest' 
  | 'lavender';

export interface ThemeColors {
  // Base colors
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  
  // Text colors
  text: string;
  textSecondary: string;
  textMuted: string;
  
  // Accent colors (Noctaliæ brand - obligatoires)
  warmGold: string;    // #D2B14C
  softBrown: string;   // #88735C
  grayGreen: string;   // #A0B4D4
  
  // Status colors
  success: string;
  warning: string;
  error: string;
  info: string;
  
  // UI elements
  border: string;
  card: string;
  shadow: string;
  overlay: string;
  
  // Gradient
  gradientStart: string;
  gradientEnd: string;
}

export interface Theme {
  name: ThemeName;
  displayName: string;
  colors: ThemeColors;
  isDark: boolean;
}

// ============================================
// USER & SETTINGS TYPES
// ============================================

export interface UserSettings {
  // Display
  theme: ThemeName;
  language: 'fr' | 'en';
  
  // Analysis preferences
  defaultModel: 'claude-sonnet-4' | 'llama-3.3-70b';
  autoAnalyze: boolean;
  
  // Audio
  audioQuality: 'low' | 'medium' | 'high';
  autoDeleteAudio: boolean;
  
  // Notifications
  notificationsEnabled: boolean;
  reminderTime?: string; // HH:mm format
  
  // Privacy
  analyticsEnabled: boolean;
  crashReportingEnabled: boolean;
}

export interface UserProfile {
  id: string;
  email?: string;
  name?: string;
  isPremium: boolean;
  premiumExpiresAt?: number;
  createdAt: number;
  settings: UserSettings;
}

// ============================================
// NAVIGATION TYPES
// ============================================

export type RootStackParamList = {
  MainTabs: undefined;
  Analysis: { dreamId: string };
  Conversation: { dreamId: string };
  DeepChat: { dreamId: string };
  PostRecording: { audioUri: string; duration: number };
  Settings: undefined;
  Profile: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Archives: undefined;
  Insights: undefined;
  Trends: undefined;
  VoiceAssistant: undefined;
};

// ============================================
// STORE TYPES
// ============================================

export interface DreamStore {
  dreams: Dream[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  addDream: (dream: Dream) => void;
  updateDream: (id: string, updates: Partial<Dream>) => void;
  deleteDream: (id: string) => void;
  getDream: (id: string) => Dream | undefined;
  loadDreams: () => Promise<void>;
  clearError: () => void;
}

export interface UIStore {
  isRecording: boolean;
  isAnalyzing: boolean;
  selectedDreamId: string | null;
  showRateLimitBanner: boolean;
  
  // Actions
  setRecording: (isRecording: boolean) => void;
  setAnalyzing: (isAnalyzing: boolean) => void;
  setSelectedDream: (id: string | null) => void;
  setRateLimitBanner: (show: boolean) => void;
}

export interface SettingsStore {
  settings: UserSettings;
  
  // Actions
  updateSettings: (updates: Partial<UserSettings>) => void;
  resetSettings: () => void;
  loadSettings: () => Promise<void>;
}

// ============================================
// HOOKS TYPES
// ============================================

export interface UseRecordingReturn {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<{ uri: string; duration: number }>;
  pauseRecording: () => Promise<void>;
  resumeRecording: () => Promise<void>;
  error: Error | null;
}

export interface UseDreamAnalysisReturn {
  analyze: (transcript: string, model?: 'claude-sonnet-4' | 'llama-3.3-70b') => Promise<AnalysisResponse>;
  isAnalyzing: boolean;
  error: Error | null;
  result: AnalysisResponse | null;
}

// ============================================
// ANALYTICS TYPES
// ============================================

export type AnalyticsEvent = 
  | 'app_opened'
  | 'dream_recorded'
  | 'dream_analyzed'
  | 'chat_message_sent'
  | 'theme_changed'
  | 'premium_activated'
  | 'screen_viewed'
  | 'error_occurred';

export interface AnalyticsProperties {
  [key: string]: string | number | boolean | undefined;
}

// ============================================
// ERROR TYPES
// ============================================

export class NoctaliaeError extends Error {
  code: string;
  statusCode?: number;
  details?: string;

  constructor(message: string, code: string, statusCode?: number, details?: string) {
    super(message);
    this.name = 'NoctaliaeError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}

export type ErrorCode = 
  | 'NETWORK_ERROR'
  | 'API_ERROR'
  | 'TRANSCRIPTION_FAILED'
  | 'ANALYSIS_FAILED'
  | 'RECORDING_FAILED'
  | 'PERMISSION_DENIED'
  | 'STORAGE_ERROR'
  | 'RATE_LIMIT_EXCEEDED'
  | 'UNKNOWN_ERROR';

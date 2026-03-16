/**
 * NotificationService — Noctaliæ
 * Gère les notifications push : réveil, rappel, streak soir.
 * Action button → deep link direct vers RecordingScreen (friction zéro).
 */

import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const NOTIF_SETTINGS_KEY = '@noctaliae_notif_settings';
export const ACTION_RECORD_NOW = 'RECORD_NOW';
export const CATEGORY_DREAM = 'DREAM_CAPTURE';

export const DEFAULT_NOTIF_SETTINGS = {
  morningEnabled: false,
  morningHour: 7,
  morningMinute: 30,
  eveningEnabled: false,
  eveningHour: 21,
  eveningMinute: 0,
  permissionAsked: false,
};

// Messages matinaux rotatifs (7 = un par jour)
const MORNING_MESSAGES = [
  { title: 'Vos rêves s\'effacent…', body: 'La fenêtre se ferme. 30 secondes suffisent. 🌙' },
  { title: 'Un rêve à capturer ?', body: 'Votre mémoire onirique est à son pic ce matin. ✨' },
  { title: 'Avant que ça s\'efface', body: 'Les images de cette nuit existent encore. Pour l\'instant.' },
  { title: 'Ce matin, ce rêve', body: 'Quelque chose vous a traversé cette nuit. Noctaliæ l\'attend.' },
  { title: 'La nuit a parlé', body: 'Votre inconscient a travaillé. Il reste quelques minutes. 🌅' },
  { title: 'Rêve en fuite…', body: 'Chaque minute qui passe efface un fragment. Enregistrez maintenant.' },
  { title: 'Fenêtre hypnopompique', body: 'L\'état entre rêve et éveil — le meilleur moment pour capturer. 🧠' },
];

class NotificationService {
  /**
   * À appeler une fois au démarrage de l'app (App.js)
   */
  async initialize() {
    // Configure le comportement quand notif reçue en foreground
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
        priority: Notifications.AndroidNotificationPriority.DEFAULT,
      }),
    });

    // Crée le canal Android et l'action bouton
    await this._setupAndroid();
  }

  async _setupAndroid() {
    if (Platform.OS !== 'android') return;

    // Canal principal (réveil matin + action button)
    await Notifications.setNotificationChannelAsync('noctaliae', {
      name: 'Noctaliæ — Rappels',
      importance: Notifications.AndroidImportance.HIGH, // Son + bandeau heads-up
      vibrationPattern: [0, 200, 100, 200],
      lightColor: '#00FFB0',
      showBadge: false,
      sound: 'default',
    });

    // Canal discret pour rappels soir (streak)
    await Notifications.setNotificationChannelAsync('noctaliae_soft', {
      name: 'Noctaliæ — Série',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 150],
      lightColor: '#FF9966',
      showBadge: false,
    });

    // Catégorie avec bouton action (friction zéro)
    await Notifications.setNotificationCategoryAsync(CATEGORY_DREAM, [
      {
        identifier: ACTION_RECORD_NOW,
        buttonTitle: '🎙️ Enregistrer',
        options: { opensAppToForeground: true },
      },
    ]);
  }

  /**
   * Demande la permission — à appeler à la fin de l'onboarding
   * Retourne true si accordée
   */
  async requestPermissions() {
    const { status: existing } = await Notifications.getPermissionsAsync();
    if (existing === 'granted') return true;

    const { status } = await Notifications.requestPermissionsAsync();
    const granted = status === 'granted';

    // Marquer comme demandé dans les settings
    const settings = await this.getSettings();
    await this.saveSettings({ ...settings, permissionAsked: true });

    if (granted) {
      // Auto-schedule dès que permission accordée
      await this.scheduleAll();
    }

    return granted;
  }

  async hasPermission() {
    const { status } = await Notifications.getPermissionsAsync();
    return status === 'granted';
  }

  // ─── SETTINGS ─────────────────────────────────────────────────────────────

  async getSettings() {
    try {
      const stored = await AsyncStorage.getItem(NOTIF_SETTINGS_KEY);
      if (stored) return { ...DEFAULT_NOTIF_SETTINGS, ...JSON.parse(stored) };
    } catch { /* silent */ }
    return { ...DEFAULT_NOTIF_SETTINGS };
  }

  async saveSettings(settings) {
    try {
      await AsyncStorage.setItem(NOTIF_SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('❌ [Notif] Sauvegarde settings:', error);
    }
  }

  async updateSettings(partial) {
    const current = await this.getSettings();
    const updated = { ...current, ...partial };
    await this.saveSettings(updated);
    // Replanifie tout avec les nouveaux settings
    await this.scheduleAll(updated);
    return updated;
  }

  // ─── SCHEDULING ───────────────────────────────────────────────────────────

  /**
   * Planifie toutes les notifications selon les settings.
   * Annule tout avant de replanifier (évite les doublons).
   */
  async scheduleAll(settingsOverride = null) {
    const hasPerm = await this.hasPermission();
    if (!hasPerm) return;

    const settings = settingsOverride || await this.getSettings();

    // Tout annuler proprement
    await Notifications.cancelAllScheduledNotificationsAsync();

    if (settings.morningEnabled) {
      await this._scheduleMorning(settings);
    }
    if (settings.eveningEnabled) {
      await this._scheduleEvening(settings);
    }

    console.log('✅ [Notif] Notifications planifiées');
  }

  async _scheduleMorning(settings) {
    // Message du jour (rotation sur 7)
    const dayOfWeek = new Date().getDay();
    const msg = MORNING_MESSAGES[dayOfWeek];

    await Notifications.scheduleNotificationAsync({
      content: {
        title: msg.title,
        body: msg.body,
        categoryIdentifier: CATEGORY_DREAM,
        data: { type: 'morning', action: ACTION_RECORD_NOW },
        color: '#00FFB0',
        channelId: 'noctaliae',
        ...(Platform.OS === 'android' && { icon: 'notification_icon' }),
      },
      trigger: {
        hour: settings.morningHour,
        minute: settings.morningMinute,
        repeats: true,
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
      },
    });

    console.log(`🌙 [Notif] Réveil planifié → ${settings.morningHour}h${String(settings.morningMinute).padStart(2, '0')}`);
  }

  async _scheduleEvening(settings) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Ce soir, votre série…',
        body: 'Racontez un rêve avant minuit pour ne pas la briser. 🔥',
        data: { type: 'streak_evening' },
        color: '#FF9966',
        channelId: 'noctaliae',
        ...(Platform.OS === 'android' && { icon: 'notification_icon' }),
      },
      trigger: {
        hour: settings.eveningHour,
        minute: settings.eveningMinute,
        repeats: true,
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
      },
    });

    console.log(`🔥 [Notif] Rappel soir planifié → ${settings.eveningHour}h${String(settings.eveningMinute).padStart(2, '0')}`);
  }

  /**
   * Annule toutes les notifications planifiées
   */
  async cancelAll() {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('🗑️ [Notif] Toutes les notifications annulées');
  }

  /**
   * Retourne la liste des notifications actuellement planifiées (debug)
   */
  async getScheduled() {
    return await Notifications.getAllScheduledNotificationsAsync();
  }
}

export const notificationService = new NotificationService();

/**
 * StreakService — Noctaliæ
 * Calcule et maintient la série de rêves consécutifs.
 * Logique douce : une brisure ne punit pas, elle invite simplement à reprendre.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const STREAK_KEY = '@noctaliae_streak';

const DEFAULT_STREAK = {
  current: 0,   // Jours consécutifs actuels
  max: 0,       // Record personnel
  lastDreamDate: null, // Format YYYY-MM-DD
  totalDreams: 0,  // Compteur global
};

class StreakService {
  // ─── HELPERS DATE ─────────────────────────────────────────────────────────

  _toKey(date = new Date()) {
    return date.toISOString().split('T')[0]; // YYYY-MM-DD
  }

  _yesterday() {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return this._toKey(d);
  }

  _today() {
    return this._toKey();
  }

  // ─── CORE ─────────────────────────────────────────────────────────────────

  async getStreak() {
    try {
      const stored = await AsyncStorage.getItem(STREAK_KEY);
      if (stored) return { ...DEFAULT_STREAK, ...JSON.parse(stored) };
    } catch { /* silent */ }
    return { ...DEFAULT_STREAK };
  }

  /**
   * À appeler à chaque fois qu'un rêve est enregistré.
   * Retourne les nouvelles données de streak.
   */
  async onDreamRecorded() {
    const today = this._today();
    const streak = await this.getStreak();

    // Déjà enregistré aujourd'hui → on incrémente juste le total
    if (streak.lastDreamDate === today) {
      const updated = { ...streak, totalDreams: streak.totalDreams + 1 };
      await this._save(updated);
      return updated;
    }

    const yesterday = this._yesterday();
    const isConsecutive = streak.lastDreamDate === yesterday;

    const newCurrent = isConsecutive ? streak.current + 1 : 1;
    const newMax = Math.max(newCurrent, streak.max);

    const updated = {
      current: newCurrent,
      max: newMax,
      lastDreamDate: today,
      totalDreams: streak.totalDreams + 1,
    };

    await this._save(updated);

    console.log(`🔥 [Streak] ${newCurrent} jour${newCurrent > 1 ? 's' : ''} consécutif${newCurrent > 1 ? 's' : ''} (record: ${newMax})`);
    return updated;
  }

  /**
   * À appeler à l'ouverture de l'app pour vérifier l'intégrité du streak.
   * Si le dernier rêve date d'avant hier → streak remis à 0 (doucement).
   */
  async checkIntegrity() {
    const streak = await this.getStreak();
    if (!streak.lastDreamDate) return streak;

    const today = this._today();
    const yesterday = this._yesterday();

    // Si dernier rêve = aujourd'hui ou hier → streak intact
    if (streak.lastDreamDate === today || streak.lastDreamDate === yesterday) {
      return streak;
    }

    // Série brisée (mais on garde max et totalDreams)
    const updated = { ...streak, current: 0 };
    await this._save(updated);
    console.log('💤 [Streak] Série brisée — réinitialisée à 0');
    return updated;
  }

  /**
   * Retourne true si un rêve a déjà été enregistré aujourd'hui
   */
  async hasRecordedToday() {
    const streak = await this.getStreak();
    return streak.lastDreamDate === this._today();
  }

  // ─── PRIVATE ──────────────────────────────────────────────────────────────

  async _save(data) {
    try {
      await AsyncStorage.setItem(STREAK_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('❌ [Streak] Sauvegarde:', error);
    }
  }
}

export const streakService = new StreakService();

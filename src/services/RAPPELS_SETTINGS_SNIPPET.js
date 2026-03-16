/**
 * SECTION RAPPELS & HABITUDES — à insérer dans SettingsScreen.js
 * 
 * IMPORTS À AJOUTER en haut de SettingsScreen.js :
 * 
 *   import { notificationService, DEFAULT_NOTIF_SETTINGS } from '../services/notificationService';
 *   import { streakService } from '../services/streakService';
 * 
 * STATES À AJOUTER dans le composant SettingsScreen :
 * 
 *   const [notifSettings, setNotifSettings] = useState(DEFAULT_NOTIF_SETTINGS);
 *   const [streak, setStreak] = useState({ current: 0, max: 0, totalDreams: 0 });
 *   const [hasNotifPerm, setHasNotifPerm] = useState(false);
 * 
 * DANS useEffect principal, ajouter :
 * 
 *   loadNotifData();
 * 
 * DANS le focus listener, ajouter :
 * 
 *   loadNotifData();
 * 
 * FONCTION À AJOUTER dans le composant :
 * 
 *   const loadNotifData = async () => {
 *     const [settings, streakData, perm] = await Promise.all([
 *       notificationService.getSettings(),
 *       streakService.getStreak(),
 *       notificationService.hasPermission(),
 *     ]);
 *     setNotifSettings(settings);
 *     setStreak(streakData);
 *     setHasNotifPerm(perm);
 *   };
 * 
 *   const handleNotifToggle = async (key, value) => {
 *     if (!hasNotifPerm && value) {
 *       const granted = await notificationService.requestPermissions();
 *       if (!granted) return;
 *       setHasNotifPerm(true);
 *     }
 *     const updated = await notificationService.updateSettings({ [key]: value });
 *     setNotifSettings(updated);
 *   };
 * 
 *   const handleTimeChange = async (key, delta) => {
 *     // delta = +1 ou -1 (30 min par step)
 *     const field = key === 'morning' ? 'morningMinute' : 'eveningMinute';
 *     const hourField = key === 'morning' ? 'morningHour' : 'eveningHour';
 *     
 *     let totalMins = notifSettings[hourField] * 60 + notifSettings[field] + delta * 30;
 *     if (totalMins < 0) totalMins += 24 * 60;
 *     if (totalMins >= 24 * 60) totalMins -= 24 * 60;
 *     
 *     const newHour = Math.floor(totalMins / 60);
 *     const newMin = totalMins % 60;
 *     
 *     const updated = await notificationService.updateSettings({
 *       [hourField]: newHour,
 *       [field]: newMin,
 *     });
 *     setNotifSettings(updated);
 *   };
 * 
 *   const formatTime = (hour, minute) => {
 *     return `${String(hour).padStart(2, '0')}h${String(minute).padStart(2, '0')}`;
 *   };
 * 
 * ─────────────────────────────────────────────────────────────────────────────
 * JSX DE LA SECTION — à coller dans le <ScrollView> de SettingsScreen, 
 * après la section Persona :
 * ─────────────────────────────────────────────────────────────────────────────

{/* === SECTION RAPPELS & HABITUDES === */}
<View style={[styles.section, { 
  backgroundColor: theme.colors.cardBackground,
  borderColor: theme.colors.cardBorder,
  ...theme.shadow.md 
}]}>
  <View style={[styles.sectionTitleRow, { marginBottom: 4 }]}>
    <MaterialCommunityIcons name="bell-outline" size={24} color={theme.colors.primary} />
    <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>
      Rappels & Habitudes
    </Text>
  </View>

  <Text style={[styles.sectionSubtitle, { color: theme.colors.textSecondary, marginBottom: 16 }]}>
    Le rêve s'efface en moins de 10 minutes. Un rappel au réveil change tout.
  </Text>

  {/* 🔥 STREAK CARD */}
  <View style={[notifStyles.streakCard, {
    backgroundColor: streak.current > 0 
      ? 'rgba(255, 153, 102, 0.08)' 
      : 'rgba(255,255,255,0.03)',
    borderColor: streak.current > 0 
      ? 'rgba(255, 153, 102, 0.3)' 
      : theme.colors.cardBorder,
  }]}>
    <Text style={notifStyles.streakEmoji}>
      {streak.current > 0 ? '🔥' : '💤'}
    </Text>
    <View style={notifStyles.streakInfo}>
      <Text style={[notifStyles.streakValue, { color: theme.colors.textPrimary }]}>
        {streak.current > 0
          ? `${streak.current} jour${streak.current > 1 ? 's' : ''} de suite`
          : 'Aucune série en cours'}
      </Text>
      <Text style={[notifStyles.streakSub, { color: theme.colors.textSecondary }]}>
        {streak.max > 0
          ? `Record : ${streak.max} j. · ${streak.totalDreams} rêve${streak.totalDreams > 1 ? 's' : ''} au total`
          : 'Enregistrez votre premier rêve'}
      </Text>
    </View>
  </View>

  {/* ─── TOGGLE MATIN ─── */}
  <View style={notifStyles.toggleRow}>
    <View style={notifStyles.toggleLeft}>
      <MaterialCommunityIcons name="weather-sunset-up" size={20} color="#FFD580" />
      <View>
        <Text style={[notifStyles.toggleLabel, { color: theme.colors.textPrimary }]}>
          Rappel matinal
        </Text>
        <Text style={[notifStyles.toggleSub, { color: theme.colors.textSecondary }]}>
          Avant que le rêve s'efface
        </Text>
      </View>
    </View>
    <Switch
      value={notifSettings.morningEnabled}
      onValueChange={(v) => handleNotifToggle('morningEnabled', v)}
      trackColor={{ false: theme.colors.cardBorder, true: theme.colors.primary }}
      thumbColor="#FFFFFF"
    />
  </View>

  {/* Time picker matin */}
  {notifSettings.morningEnabled && (
    <View style={notifStyles.timePicker}>
      <TouchableOpacity
        onPress={() => handleTimeChange('morning', -1)}
        style={notifStyles.timeBtn}
        activeOpacity={0.7}
      >
        <MaterialIcons name="remove" size={18} color={theme.colors.primary} />
      </TouchableOpacity>
      <Text style={[notifStyles.timeDisplay, { color: theme.colors.primary }]}>
        {formatTime(notifSettings.morningHour, notifSettings.morningMinute)}
      </Text>
      <TouchableOpacity
        onPress={() => handleTimeChange('morning', +1)}
        style={notifStyles.timeBtn}
        activeOpacity={0.7}
      >
        <MaterialIcons name="add" size={18} color={theme.colors.primary} />
      </TouchableOpacity>
      <Text style={[notifStyles.timeHint, { color: theme.colors.textSecondary }]}>
        (pas de 30 min)
      </Text>
    </View>
  )}

  {/* ─── TOGGLE SOIR ─── */}
  <View style={[notifStyles.toggleRow, { marginTop: 8 }]}>
    <View style={notifStyles.toggleLeft}>
      <MaterialCommunityIcons name="weather-night" size={20} color="#A0B4D4" />
      <View>
        <Text style={[notifStyles.toggleLabel, { color: theme.colors.textPrimary }]}>
          Rappel du soir
        </Text>
        <Text style={[notifStyles.toggleSub, { color: theme.colors.textSecondary }]}>
          Pour ne pas briser votre série
        </Text>
      </View>
    </View>
    <Switch
      value={notifSettings.eveningEnabled}
      onValueChange={(v) => handleNotifToggle('eveningEnabled', v)}
      trackColor={{ false: theme.colors.cardBorder, true: '#FF9966' }}
      thumbColor="#FFFFFF"
    />
  </View>

  {/* Time picker soir */}
  {notifSettings.eveningEnabled && (
    <View style={notifStyles.timePicker}>
      <TouchableOpacity
        onPress={() => handleTimeChange('evening', -1)}
        style={notifStyles.timeBtn}
        activeOpacity={0.7}
      >
        <MaterialIcons name="remove" size={18} color="#FF9966" />
      </TouchableOpacity>
      <Text style={[notifStyles.timeDisplay, { color: '#FF9966' }]}>
        {formatTime(notifSettings.eveningHour, notifSettings.eveningMinute)}
      </Text>
      <TouchableOpacity
        onPress={() => handleTimeChange('evening', +1)}
        style={notifStyles.timeBtn}
        activeOpacity={0.7}
      >
        <MaterialIcons name="add" size={18} color="#FF9966" />
      </TouchableOpacity>
      <Text style={[notifStyles.timeHint, { color: theme.colors.textSecondary }]}>
        (pas de 30 min)
      </Text>
    </View>
  )}

  {/* Note permission si refusée */}
  {!hasNotifPerm && (notifSettings.morningEnabled || notifSettings.eveningEnabled) && (
    <TouchableOpacity
      style={notifStyles.permBanner}
      onPress={() => notificationService.requestPermissions().then(loadNotifData)}
      activeOpacity={0.8}
    >
      <MaterialIcons name="notifications-off" size={18} color="#FF9966" />
      <Text style={notifStyles.permBannerText}>
        Autoriser les notifications pour activer les rappels
      </Text>
    </TouchableOpacity>
  )}
</View>

 * ─────────────────────────────────────────────────────────────────────────────
 * STYLES À AJOUTER dans StyleSheet.create() de SettingsScreen.js :
 * ─────────────────────────────────────────────────────────────────────────────
 * 
 * (Ces styles sont dans notifStyles ci-dessous — utilise-les tels quels)
*/

// Styles séparés (à ajouter en dehors du StyleSheet principal, en bas du fichier) :
const notifStyles = {
  streakCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: 16,
    gap: 12,
  },
  streakEmoji: {
    fontSize: 32,
  },
  streakInfo: {
    flex: 1,
  },
  streakValue: {
    fontSize: 17,
    fontFamily: 'AtkinsonHyperlegibleNext-Bold',
    marginBottom: 2,
  },
  streakSub: {
    fontSize: 13,
    fontFamily: 'AtkinsonHyperlegibleNext-Regular',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  toggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  toggleLabel: {
    fontSize: 16,
    fontFamily: 'AtkinsonHyperlegibleNext-Bold',
  },
  toggleSub: {
    fontSize: 12,
    fontFamily: 'AtkinsonHyperlegibleNext-Regular',
    marginTop: 1,
  },
  timePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 10,
    marginBottom: 8,
    marginTop: 4,
  },
  timeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeDisplay: {
    fontSize: 22,
    fontFamily: 'AtkinsonHyperlegibleNext-Bold',
    minWidth: 70,
    textAlign: 'center',
  },
  timeHint: {
    fontSize: 11,
    fontFamily: 'AtkinsonHyperlegibleNext-Regular',
  },
  permBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    padding: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 153, 102, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 153, 102, 0.25)',
  },
  permBannerText: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'AtkinsonHyperlegibleNext-Regular',
    color: '#FF9966',
    lineHeight: 18,
  },
};

import { useRef, useCallback, useMemo } from 'react';
import { Share } from 'react-native';
import * as Sharing from 'expo-sharing';
import DreamShareTemplate from '../components/DreamShareTemplate';

/**
 * useDreamShare(dream)
 *
 * Hook centralisé pour le partage "Friendly" avec branding Noctaliæ.
 * Utilise DreamShareTemplate (ViewShot hors-écran) pour capturer une image PNG.
 *
 * Usage :
 *   const { ShareOverlay, handleShareFriendly } = useDreamShare(dream);
 *   // Rendre <ShareOverlay /> quelque part dans le JSX (peu importe où)
 *   // Appeler handleShareFriendly() au tap
 *
 * Compatible : DreamCard, ConversationScreen, DreamImageViewer (celui-ci gère
 * son propre ViewShot intégré — ce hook est pour les autres).
 */
export function useDreamShare(dream) {
  const captureRef = useRef(null);

  // ── One-liner pré-calculé ─────────────────────────────────────────────────
  const oneLiner = useMemo(() => {
    const rawAnalysis = typeof dream?.analysis === 'string'
      ? dream.analysis
      : (dream?.analysis?.shortSummary || dream?.analysis?.fullAnalysis || '');
    if (!rawAnalysis) return '';
    const match = rawAnalysis
      .replace(/[#*]/g, '')
      .replace(/[\n\r]+/g, ' ')
      .match(/[^.!?]+[.!?]/);
    const sentence = match ? match[0].trim() : '';
    return sentence.length > 120 ? sentence.slice(0, 117) + '…' : sentence;
  }, [dream?.analysis]);

  // ── Mini résumé du rêve (1ère phrase transcription) ───────────────────────
  const dreamSummary = useMemo(() => {
    const raw = dream?.transcription || dream?.transcript || '';
    if (!raw) return '';
    const cleaned = raw.replace(/[\n\r]+/g, ' ').trim();
    const match = cleaned.match(/[^.!?]+[.!?]/);
    const sentence = match ? match[0].trim() : cleaned.slice(0, 100);
    const prefix = 'Rêve ' + (sentence.charAt(0).toLowerCase() === 'j' ? '' : 'de ');
    const summary = sentence.length > 100 ? sentence.slice(0, 97) + '…' : sentence;
    return summary;
  }, [dream?.transcription, dream?.transcript]);

  // ── Texte de partage ──────────────────────────────────────────────────────
  const buildFallbackText = useCallback(() => {
    const title = getDreamTitle(dream);
    const tags  = Array.isArray(dream?.tags)
      ? dream.tags.slice(0, 3).map(t => `#${t}`).join(' ')
      : '';
    return [
      `🌙 ${title}`,
      dreamSummary ? `\n${dreamSummary}` : '',
      tags ? `\n${tags}` : '',
      `\n🌐 nocty.thomasmaury.fr`,
      `📱 https://play.google.com/store/apps/details?id=com.noctaliae.mobile`,
    ].filter(Boolean).join('\n');
  }, [dream, oneLiner, dreamSummary]);

  // ── Capture + partage ─────────────────────────────────────────────────────
  const handleShareFriendly = useCallback(async () => {
    try {
      // Délai pour que le composant soit bien rendu avant capture
      await new Promise(resolve => setTimeout(resolve, 100));

      if (!captureRef.current) throw new Error('captureRef null');
      const uri = await captureRef.current.capture();

      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(uri, {
          mimeType: 'image/png',
          dialogTitle: getDreamTitle(dream),
          UTI: 'public.png',
        });
      } else {
        await Share.share(
          { message: buildFallbackText(), url: uri },
          { dialogTitle: getDreamTitle(dream) }
        );
      }
    } catch (err) {
      console.error('❌ useDreamShare capture error:', err);
      // Fallback ultime : texte seul
      try {
        await Share.share(
          { message: buildFallbackText() },
          { dialogTitle: getDreamTitle(dream) }
        );
      } catch (e) {
        console.error('❌ useDreamShare fallback error:', e);
      }
    }
  }, [dream, buildFallbackText]);

  // ── Composant overlay (JSX à insérer dans le parent) ─────────────────────
  //   Rendu hors-écran par DreamShareTemplate lui-même (left: SCREEN_W * 2)
  const ShareOverlay = useCallback(
    () => (
      <DreamShareTemplate
        captureRef={captureRef}
        dream={dream}
        oneLiner={oneLiner}
      />
    ),
    [dream, oneLiner]
  );

  return { ShareOverlay, handleShareFriendly };
}

// ── Helper ────────────────────────────────────────────────────────────────────
function getDreamTitle(dream) {
  const t = dream?.dreamTitle || dream?.title;
  return t && t !== 'Mon rêve' && t !== 'Rêve sans titre' && t.length > 3
    ? t : 'Rêve sans titre';
}

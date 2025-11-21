export const translations = {
  fr: {
    title: '🎙️ Test Audio Noctaliæ',
    duration: 'Durée',
    paused: '⏸️ EN PAUSE',
    startButton: '▶️ Démarrer',
    stopButton: '⏹️ Arrêter',
    playbackTitle: 'Lecture',
    playButton: '🔊 Jouer',
    stopPlayButton: '⏹️ Stop',
    recordingStarted: 'Enregistrement démarré !',
    recordingSaved: 'Enregistrement sauvegardé !',
    playbackStopped: 'Lecture arrêtée',
    noRecording: 'Aucun enregistrement à jouer',
    error: 'Erreur',
    lastRecording: '📁 Dernier enregistrement',
    size: 'Taille',
    instructionsTitle: '📖 Comment tester :',
    instructions: 
      '1. Appuie sur "Démarrer" et parle\n' +
      '2. Appuie sur "Arrêter" quand tu as fini\n' +
      '3. Appuie sur "Jouer" pour écouter\n' +
      '4. Utilise "Stop" pour arrêter la lecture',
  },
  en: {
    title: '🎙️ Noctaliæ Audio Test',
    duration: 'Duration',
    paused: '⏸️ PAUSED',
    startButton: '▶️ Start',
    stopButton: '⏹️ Stop',
    playbackTitle: 'Playback',
    playButton: '🔊 Play',
    stopPlayButton: '⏹️ Stop',
    recordingStarted: 'Recording started!',
    recordingSaved: 'Recording saved!',
    playbackStopped: 'Playback stopped',
    noRecording: 'No recording to play',
    error: 'Error',
    lastRecording: '📁 Last recording',
    size: 'Size',
    instructionsTitle: '📖 How to test:',
    instructions:
      '1. Tap "Start" and speak\n' +
      '2. Tap "Stop" when finished\n' +
      '3. Tap "Play" to listen\n' +
      '4. Use "Stop" to stop playback',
  },
};

export const getTranslation = (locale) => {
  const langCode = locale.split('-')[0];
  return translations[langCode] || translations.en;
};
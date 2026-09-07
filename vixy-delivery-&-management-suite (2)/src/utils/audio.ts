/**
 * Audio Synthesizer for Vixy Platform - Real Web Audio Bell Chime (Campana)
 * No requiere archivos externos .mp3 que puedan fallar por 404 o red.
 */

let sharedAudioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!sharedAudioContext) {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioCtx) {
      sharedAudioContext = new AudioCtx();
    }
  }
  if (sharedAudioContext && sharedAudioContext.state === 'suspended') {
    sharedAudioContext.resume().catch(() => {});
  }
  return sharedAudioContext;
}

/**
 * Sonido de campana auténtico con armónicos metálicos y decaimiento suave
 */
export const playBellChimeSound = (variant: 'store' | 'driver' = 'driver') => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    if (variant === 'store') {
      // Doble repique de campana de comercio (Ding-Dong metálico brillante)
      // Primera campana (Ding - 1046.5 Hz / C6)
      playSingleBell(ctx, now, [1046.5, 2093, 3139.5], 0.35, 1.2);
      // Segunda campana (Dong - 880 Hz / A5)
      playSingleBell(ctx, now + 0.25, [880, 1760, 2640], 0.35, 1.4);
    } else {
      // Campana de alerta para motorizado (Repique nítido de solicitud urgente)
      playSingleBell(ctx, now, [1174.66, 2349.32, 3523.98], 0.4, 0.9);
      playSingleBell(ctx, now + 0.18, [1396.91, 2793.82, 4190.73], 0.35, 1.1);
    }
  } catch (err) {
    console.warn('[Vixy Audio] Error al reproducir campana:', err);
  }
};

function playSingleBell(
  ctx: AudioContext, 
  startTime: number, 
  harmonics: number[], 
  masterVolume: number, 
  duration: number
) {
  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(masterVolume, startTime);
  masterGain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
  masterGain.connect(ctx.destination);

  harmonics.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = idx === 0 ? 'sine' : 'triangle';
    osc.frequency.setValueAtTime(freq, startTime);

    // Amplitud proporcional de armónicos
    const harmonicWeight = 1 / (idx + 1);
    gain.gain.setValueAtTime(harmonicWeight, startTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(gain);
    gain.connect(masterGain);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.05);
  });
}

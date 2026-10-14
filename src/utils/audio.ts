// Web Audio API Sound Synthesizer (Zero External Assets)
export function playChime(freq = 880) {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  } catch (e) {
    // Audio context may be restricted before interaction
  }
}

export function playCelebrationArpeggio() {
  playChime(523.25); // C5
  setTimeout(() => playChime(659.25), 120); // E5
  setTimeout(() => playChime(783.99), 240); // G5
  setTimeout(() => playChime(1046.50), 380); // C6
}

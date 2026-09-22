/**
 * Generador de efectos de sonido sintetizados mediante Web Audio API.
 * No requiere descargar archivos de audio externos y ofrece latencia cero.
 */
export function playChime(type: "success" | "warning" | "error") {
  if (typeof window === "undefined") return;

  try {
    const AudioContextClass =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();

    if (type === "success") {
      // Acorde armónico ascendente agradable (C6 -> G6)
      const playTone = (freq: number, startTime: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, startTime);
        gain.gain.setValueAtTime(0.12, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + duration);
      };

      const now = ctx.currentTime;
      playTone(1046.5, now, 0.15); // C6
      playTone(1318.51, now + 0.08, 0.2); // E6
      playTone(1567.98, now + 0.16, 0.35); // G6
    } else if (type === "warning") {
      // Tono doble de advertencia
      const playWarning = (freq: number, startTime: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, startTime);
        gain.gain.setValueAtTime(0.15, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.12);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + 0.12);
      };

      const now = ctx.currentTime;
      playWarning(659.25, now); // E5
      playWarning(587.33, now + 0.15); // D5
    } else {
      // Tono grave de error
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.3);
    }
  } catch {
    // Si el navegador bloquea audio antes de interacción de usuario, ignorar defensivamente
  }
}

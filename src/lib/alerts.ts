// src/lib/alerts.ts

// Variável para armazenar o contexto de áudio e evitar recriá-lo
let audioContext: AudioContext | null = null;

// Função para inicializar o AudioContext de forma segura no client-side
const getAudioContext = (): AudioContext | null => {
  if (typeof window === 'undefined') return null;
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
};


/**
 * Toca um som de bipe simples usando a Web Audio API.
 * @param {number} frequency - A frequência do som em Hz.
 * @param {number} duration - A duração do som em milissegundos.
 * @param {number} volume - O volume do som (0 a 1).
 */
function playTone(frequency: number, duration: number, volume: number = 0.5) {
  const ctx = getAudioContext();
  if (!ctx) return;

  // Garante que o contexto de áudio seja retomado se estiver suspenso (necessário em alguns navegadores)
  if (ctx.state === 'suspended') {
    ctx.resume();
  }

  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.type = 'sine'; // Tipo de onda (sine, square, sawtooth, triangle)
  oscillator.frequency.value = frequency;
  gainNode.gain.setValueAtTime(volume, ctx.currentTime);

  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + duration / 1000);
}

// Funções específicas para sucesso e erro
export function playSuccessSound() {
  playTone(880, 150, 0.3); // Som mais agudo e curto para sucesso
}

export function playErrorSound() {
  playTone(330, 400, 0.5); // Som mais grave e longo para erro
}


/**
 * Faz o dispositivo vibrar com um padrão específico.
 * @param {VibratePattern} pattern - O padrão de vibração (ex: 200 ou [100, 50, 100]).
 */
function vibrate(pattern: VibratePattern) {
  if ('vibrate' in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch (error) {
      console.warn("A vibração não é suportada ou foi bloqueada.", error);
    }
  }
}

// Funções de vibração específicas
export function vibrateSuccess() {
  vibrate(150);
}

export function vibrateError() {
  vibrate([300, 100, 300]); // Padrão de erro: vibra, pausa, vibra
}

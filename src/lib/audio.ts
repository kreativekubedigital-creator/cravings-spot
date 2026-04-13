export const playNotificationSound = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    // Create a pleasant double-chime (classic "ding-ding" notification)
    const now = ctx.currentTime;
    
    // First chime
    osc.type = "sine";
    osc.frequency.setValueAtTime(659.25, now); // E5
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.5, now + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    
    // Second chime
    osc.frequency.setValueAtTime(880.00, now + 0.15); // A5
    gainNode.gain.setValueAtTime(0, now + 0.15);
    gainNode.gain.linearRampToValueAtTime(0.6, now + 0.2);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
    
    osc.start(now);
    osc.stop(now + 0.6);
  } catch (e) {
    console.error("Audio playback failed", e);
  }
};

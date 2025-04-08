// Sound effects utility for the timer app

// Global volume settings
let globalVolume = 0.8;
let isMuted = false;
// Countdown-specific settings
let countdownVolume = 0.8;
let countdownMuted = false;

const createSoundPool = (src, size = 3) => {
  const pool = Array(size).fill(null).map(() => {
    const audio = new Audio(src);
    audio.load();
    return audio;
  });
  let current = 0;
  
  return {
    play: (volume = 1, isCountdownSound = false) => {
      // Skip playing if globally muted
      if (isMuted) return;
      
      // Skip playing if this is a countdown sound and countdown sounds are muted
      if (isCountdownSound && countdownMuted) return;
      
      // Use the next sound in the pool
      const sound = pool[current];
      // Apply appropriate volume setting
      const effectiveVolume = isCountdownSound 
        ? volume * countdownVolume * globalVolume
        : volume * globalVolume;
      
      sound.volume = effectiveVolume;
      sound.currentTime = 0;
      sound.play().catch(err => console.error(`Error playing sound ${src}:`, err));
      
      // Move to the next sound in the pool
      current = (current + 1) % pool.length;
    }
  };
};

// Create sound pools for sounds that might play in rapid succession
const countdownBeepPool = createSoundPool('/sounds/countdown-beep.wav');
const countdownFinishedPool = createSoundPool('/sounds/countdown-finished-beep.wav');

// Regular sound files for other sounds
const soundFiles = {
  hoverLogo: new Audio('/sounds/hover-logo.wav'),
  playPause: new Audio('/sounds/play-pause.wav'),
  reset: new Audio('/sounds/reset-sound.wav'),
  settingsPlusQuickset: new Audio('/sounds/settings-plus-quickset-sound.wav'),
};

// Preload all regular sounds
Object.values(soundFiles).forEach(audio => {
  audio.load();
  // Log when sounds are loaded
  audio.addEventListener('canplaythrough', () => {
    console.log(`Sound loaded: ${audio.src}`);
  });
});

// Set initial volume levels
soundFiles.hoverLogo.volume = 0.5 * globalVolume;
soundFiles.playPause.volume = 0.6 * globalVolume;
soundFiles.reset.volume = 0.6 * globalVolume;
soundFiles.settingsPlusQuickset.volume = 0.5 * globalVolume;

// Helper function to play regular (non-pooled) sounds with volume control
const playSound = (sound, baseVolume = 0.8) => {
  if (isMuted) return;
  sound.currentTime = 0;
  sound.volume = baseVolume * globalVolume;
  sound.play().catch(err => console.error('Error playing sound:', err));
};

export const soundEffects = {
  // Volume control methods
  setVolume: (volume: number) => {
    globalVolume = Math.max(0, Math.min(1, volume)); // Ensure volume is between 0 and 1
    console.log(`Global sound volume set to: ${globalVolume}`);
    
    // Update volume for regular sound files
    Object.values(soundFiles).forEach(audio => {
      audio.volume = audio.volume / globalVolume * globalVolume; // Maintain relative volumes
    });
  },
  
  setMuted: (muted: boolean) => {
    isMuted = muted;
    console.log(`Sounds ${isMuted ? 'muted' : 'unmuted'}`);
  },
  
  getVolume: () => globalVolume,
  
  isMuted: () => isMuted,
  
  // Countdown-specific volume control methods
  setCountdownVolume: (volume: number) => {
    countdownVolume = Math.max(0, Math.min(1, volume)); // Ensure volume is between 0 and 1
    console.log(`Countdown sound volume set to: ${countdownVolume}`);
  },
  
  setCountdownMuted: (muted: boolean) => {
    countdownMuted = muted;
    console.log(`Countdown sounds ${countdownMuted ? 'muted' : 'unmuted'}`);
  },
  
  getCountdownVolume: () => countdownVolume,
  
  isCountdownMuted: () => countdownMuted,
  
  // Sound effect methods
  playCountdownBeep: () => {
    console.log('Playing countdown beep');
    countdownBeepPool.play(0.8, true);
  },
  
  playCountdownFinished: () => {
    console.log('Playing countdown finished beep');
    countdownFinishedPool.play(0.9, true);
  },
  
  playHoverLogo: () => {
    playSound(soundFiles.hoverLogo, 0.5);
  },
  
  playPlayPause: () => {
    playSound(soundFiles.playPause, 0.6);
  },
  
  playReset: () => {
    playSound(soundFiles.reset, 0.6);
  },
  
  playSettingsPlusQuickset: () => {
    playSound(soundFiles.settingsPlusQuickset, 0.5);
  },
  
  // Helper function to enable sounds on first user interaction
  // Some browsers require user interaction before playing sounds
  initSounds: () => {
    const initSound = () => {
      // Create a silent audio and play it to initialize audio context
      const silentAudio = new Audio();
      silentAudio.play().catch(() => {});
      
      // Remove event listeners after first interaction
      document.removeEventListener('click', initSound);
      document.removeEventListener('touchstart', initSound);
    };
    
    document.addEventListener('click', initSound);
    document.addEventListener('touchstart', initSound);
  }
};

export default soundEffects; 
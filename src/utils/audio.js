/**
 * GAMBIT'S GLITCH - Web Audio API Sound Synthesizer (Sound FX Disabled)
 */

class AudioSynthesizer {
  constructor() {
    this.ctx = null;
    this.enabled = false;
  }

  init() {}

  toggleSound() {
    this.enabled = false;
    return false;
  }

  playClick() {}
  playGlitch() {}
  playBeep() {}
}

export const soundFx = new AudioSynthesizer();


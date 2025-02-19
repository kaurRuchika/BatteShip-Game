const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playTone(freq, duration) {
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.type = 'square';
  osc.frequency.value = freq;
  osc.start();
  gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration / 1000);
  osc.stop(audioCtx.currentTime + duration / 1000);
}

function playSound(type) {
  const sounds = { hit: 600, miss: 300, start: 500, win: 800, lose: 200 };
  playTone(sounds[type], type === 'lose' ? 300 : 150);
}
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playSound(type) {
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }

    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    const now = audioCtx.currentTime;

    if (type === 'correct') {
        // Cheerful major arpeggio
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
        osc.frequency.setValueAtTime(783.99, now + 0.2); // G5
        osc.frequency.setValueAtTime(1046.50, now + 0.3); // C6

        gainNode.gain.setValueAtTime(0.3, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.6);

        osc.start(now);
        osc.stop(now + 0.6);

    } else if (type === 'wrong') {
        // Low buzzer
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.linearRampToValueAtTime(100, now + 0.3);

        gainNode.gain.setValueAtTime(0.3, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

        osc.start(now);
        osc.stop(now + 0.4);

    } else if (type === 'tick') {
        // Woodblock-like tick
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);

        gainNode.gain.setValueAtTime(0.5, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

        osc.start(now);
        osc.stop(now + 0.1);

    } else if (type === 'join') {
        // Gentle chime
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.1);

        gainNode.gain.setValueAtTime(0.1, now);
        gainNode.gain.linearRampToValueAtTime(0, now + 0.5);

        osc.start(now);
        osc.stop(now + 0.5);

    } else if (type === 'start') {
        // Game start fanfare (simple)
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.setValueAtTime(554, now + 0.2);
        osc.frequency.setValueAtTime(659, now + 0.4);

        gainNode.gain.setValueAtTime(0.2, now);
        gainNode.gain.setValueAtTime(0.2, now + 0.4);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 1.5);

        osc.start(now);
        osc.stop(now + 1.5);
    }
}

let musicOsc;
let musicGain;
let lfo;

function startMusic(index = 1) {
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    if (musicOsc) return; // Already playing

    const now = audioCtx.currentTime;

    // Generate unique parameters based on index to ensure "different" music
    // We use the index to seed the randomness slightly or just pick modes
    const modes = ['triangle', 'sawtooth', 'square'];
    const baseFreqs = [55, 65, 73, 82, 98, 110]; // Deep bass notes

    // Pseudo-random selection based on index (or just random)
    const mode = modes[index % modes.length];
    const baseFreq = baseFreqs[index % baseFreqs.length];
    const speed = 2 + (index % 5) * 0.5; // Speed varies from 2Hz to 4.5Hz

    // 1. The Drone (Low)
    musicOsc = audioCtx.createOscillator();
    musicOsc.type = mode; // Variation: Waveform
    musicOsc.frequency.setValueAtTime(baseFreq, now); // Variation: Pitch

    // 2. The LFO (Pulse) - Modulates volume/filter
    lfo = audioCtx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(speed, now); // Variation: Rhythm speed

    // 3. Gain/Volume
    musicGain = audioCtx.createGain();
    const lfoGain = audioCtx.createGain();

    lfoGain.gain.setValueAtTime(0.3, now);

    // Connect LFO to Main Gain
    lfo.connect(lfoGain);
    lfoGain.connect(musicGain.gain);

    // Initial Volume
    musicGain.gain.setValueAtTime(0.15, now);

    // Filter for "Intense" sweeps
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(200, now);
    // Ramp up filter frequency over 20 seconds for intensity
    filter.frequency.linearRampToValueAtTime(800, now + 20);

    // Connect Chain: Drone -> Filter -> Gain -> Out
    musicOsc.connect(filter);
    filter.connect(musicGain);
    musicGain.connect(audioCtx.destination);

    musicOsc.start(now);
    lfo.start(now);
}

function stopMusic() {
    if (musicOsc) {
        const now = audioCtx.currentTime;
        musicGain.gain.exponentialRampToValueAtTime(0.001, now + 1); // Fade out
        musicOsc.stop(now + 1);
        lfo.stop(now + 1);
        musicOsc = null;
        lfo = null;
        musicGain = null;
    }
}

let lobbyOscs = [];
let lobbyGain = null;

function startLobbyMusic() {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    if (lobbyGain) return; // Already playing

    lobbyGain = audioCtx.createGain();
    lobbyGain.gain.value = 0.1;
    lobbyGain.connect(audioCtx.destination);

    // Funky Major Chord Arpeggio (C Major 7)
    const notes = [261.63, 329.63, 392.00, 493.88]; // C4, E4, G4, B4

    notes.forEach((freq, i) => {
        const osc = audioCtx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.value = freq;

        const gain = audioCtx.createGain();
        gain.gain.value = 0;

        osc.connect(gain);
        gain.connect(lobbyGain);
        osc.start();

        // Rhythmic pulsing
        setInterval(() => {
            const time = audioCtx.currentTime;
            // Syncopated rhythm based on index
            if (Math.random() > 0.5) {
                gain.gain.setValueAtTime(0.2, time);
                gain.gain.exponentialRampToValueAtTime(0.01, time + 0.2);
            }
        }, 250 * (i + 1)); // Different intervals for funkiness

        lobbyOscs.push({ osc, gain }); // Store to stop later (simplified)
    });
}

function stopLobbyMusic() {
    if (lobbyGain) {
        lobbyGain.disconnect();
        lobbyGain = null;
        lobbyOscs.forEach(o => {
            o.osc.disconnect();
        });
        lobbyOscs = [];
    }
}

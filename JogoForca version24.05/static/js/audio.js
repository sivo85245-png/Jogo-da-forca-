// ── audio.js — Sons do jogo via Web Audio API ──

let ctx = null;
let musicaRodando = false;
let musicaAtivada = true;
let efeitosAtivados = true;
let gainMusica = null;
let oscNodes = [];
let loopTimeout = null;

function obterCtx() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
}

// ── Utilitário: toca um oscilador ──
function tocarTom({ freq = 440, tipo = 'sine', duracao = 0.15, volume = 0.25, delay = 0, decay = 0.15 } = {}) {
    if (!efeitosAtivados) return;
    const c = obterCtx();
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.connect(gain);
    gain.connect(c.destination);
    osc.type = tipo;
    osc.frequency.setValueAtTime(freq, c.currentTime + delay);
    gain.gain.setValueAtTime(volume, c.currentTime + delay);
    gain.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + delay + duracao + decay);
    osc.start(c.currentTime + delay);
    osc.stop(c.currentTime + delay + duracao + decay + 0.05);
}

function tocarSequencia(notas) {
    notas.forEach(n => tocarTom(n));
}

// ══════════════════════════════════════════════
//  EFEITOS — mais altos e caricatos
// ══════════════════════════════════════════════

export function somLetraCorreta() {
    // Slide rápido para cima — estilo cartoon
    tocarSequencia([
        { freq: 400,  tipo: 'square', duracao: 0.06, volume: 0.30, delay: 0.00, decay: 0.05 },
        { freq: 600,  tipo: 'square', duracao: 0.06, volume: 0.30, delay: 0.06, decay: 0.05 },
        { freq: 900,  tipo: 'square', duracao: 0.10, volume: 0.32, delay: 0.12, decay: 0.10 },
        { freq: 1200, tipo: 'square', duracao: 0.14, volume: 0.28, delay: 0.22, decay: 0.18 },
    ]);
}

export function somLetraErrada() {
    // "Boing" descendente exagerado
    tocarSequencia([
        { freq: 280, tipo: 'sawtooth', duracao: 0.12, volume: 0.35, delay: 0.00, decay: 0.08 },
        { freq: 200, tipo: 'sawtooth', duracao: 0.14, volume: 0.33, delay: 0.10, decay: 0.10 },
        { freq: 130, tipo: 'sawtooth', duracao: 0.20, volume: 0.35, delay: 0.22, decay: 0.18 },
        { freq: 80,  tipo: 'sawtooth', duracao: 0.26, volume: 0.30, delay: 0.38, decay: 0.22 },
    ]);
}

export function somPalavraCorreta() {
    // Fanfarra exagerada tipo "TADAAA"
    tocarSequencia([
        { freq: 440,  tipo: 'square', duracao: 0.10, volume: 0.30, delay: 0.00 },
        { freq: 554,  tipo: 'square', duracao: 0.10, volume: 0.30, delay: 0.10 },
        { freq: 659,  tipo: 'square', duracao: 0.10, volume: 0.30, delay: 0.20 },
        { freq: 880,  tipo: 'square', duracao: 0.22, volume: 0.34, delay: 0.30 },
        { freq: 1108, tipo: 'square', duracao: 0.12, volume: 0.28, delay: 0.55 },
        { freq: 1318, tipo: 'square', duracao: 0.30, volume: 0.34, delay: 0.70 },
    ]);
}

export function somPalavraErrada() {
    // Queda dramática longa
    tocarSequencia([
        { freq: 500, tipo: 'sawtooth', duracao: 0.16, volume: 0.34, delay: 0.00 },
        { freq: 380, tipo: 'sawtooth', duracao: 0.16, volume: 0.34, delay: 0.14 },
        { freq: 260, tipo: 'sawtooth', duracao: 0.20, volume: 0.36, delay: 0.28 },
        { freq: 160, tipo: 'sawtooth', duracao: 0.26, volume: 0.36, delay: 0.46 },
        { freq: 90,  tipo: 'sawtooth', duracao: 0.36, volume: 0.32, delay: 0.68 },
    ]);
}

export function somVitoria() {
    // Jingle longo e animado
    const notas = [
        [523, 0.00], [659, 0.12], [784, 0.24], [1047, 0.36],
        [784, 0.50], [880, 0.60], [1047, 0.72], [1319, 0.86],
    ];
    notas.forEach(([freq, delay]) =>
        tocarTom({ freq, tipo: 'square', duracao: 0.14, volume: 0.30, delay, decay: 0.12 })
    );
}

export function somDerrota() {
    // Desafinando até o fim — estilo game over clássico
    tocarSequencia([
        { freq: 494, tipo: 'sawtooth', duracao: 0.20, volume: 0.34, delay: 0.00 },
        { freq: 440, tipo: 'sawtooth', duracao: 0.20, volume: 0.34, delay: 0.20 },
        { freq: 370, tipo: 'sawtooth', duracao: 0.20, volume: 0.34, delay: 0.40 },
        { freq: 294, tipo: 'sawtooth', duracao: 0.50, volume: 0.36, delay: 0.60 },
    ]);
}

export function somAnjinho() {
    // Sino celestial muito limpo e alto
    tocarSequencia([
        { freq: 1047, tipo: 'sine', duracao: 0.18, volume: 0.28, decay: 0.5, delay: 0.00 },
        { freq: 1319, tipo: 'sine', duracao: 0.18, volume: 0.28, decay: 0.5, delay: 0.16 },
        { freq: 1568, tipo: 'sine', duracao: 0.18, volume: 0.28, decay: 0.5, delay: 0.32 },
        { freq: 2093, tipo: 'sine', duracao: 0.28, volume: 0.30, decay: 0.8, delay: 0.50 },
    ]);
}

export function somDiabinho() {
    // Órgão baixo ominoso
    tocarSequencia([
        { freq: 130, tipo: 'sawtooth', duracao: 0.20, volume: 0.36, delay: 0.00 },
        { freq: 110, tipo: 'sawtooth', duracao: 0.20, volume: 0.36, delay: 0.18 },
        { freq: 87,  tipo: 'sawtooth', duracao: 0.28, volume: 0.38, delay: 0.36 },
        { freq: 65,  tipo: 'sawtooth', duracao: 0.40, volume: 0.34, delay: 0.60 },
    ]);
}

export function somRespostaCorreta() {
    tocarSequencia([
        { freq: 880,  tipo: 'sine', duracao: 0.10, volume: 0.28, decay: 0.15, delay: 0.00 },
        { freq: 1319, tipo: 'sine', duracao: 0.20, volume: 0.30, decay: 0.30, delay: 0.12 },
    ]);
}

export function somRespostaErrada() {
    tocarSequencia([
        { freq: 220, tipo: 'sawtooth', duracao: 0.20, volume: 0.34, delay: 0.00 },
        { freq: 185, tipo: 'sawtooth', duracao: 0.26, volume: 0.32, delay: 0.18 },
    ]);
}

export function somBotao() {
    tocarTom({ freq: 700, tipo: 'sine', duracao: 0.04, volume: 0.18, decay: 0.04 });
}

export function somLetraBloqueada() {
    tocarSequencia([
        { freq: 350, tipo: 'square', duracao: 0.06, volume: 0.26, delay: 0.00 },
        { freq: 350, tipo: 'square', duracao: 0.06, volume: 0.20, delay: 0.10 },
    ]);
}

// ══════════════════════════════════════════════
//  TRILHA MEDIEVAL SUAVE EM LOOP
//  Inspirada em alaúde/flauta medieval, BPM lento
// ══════════════════════════════════════════════

// Escala de Ré menor natural (D E F G A Bb C D) — em Hz
const ESCALA_MEDIEVAL = [293.66, 329.63, 349.23, 392.00, 440.00, 466.16, 523.25, 587.33];

// Melodia principal (índices na escala)
const MELODIA_MED = [0, 2, 3, 5, 4, 3, 2, 0, 1, 3, 4, 3, 2, 0, 1, 2, 3, 4, 5, 4, 3, 2, 0, 1];

// Acompanhamento (bordão grave)
const BORDAO = [0, 4, 2, 4, 0, 4, 3, 4];

const BPM = 72;
const BEAT = 60 / BPM;

function pararOsciladores() {
    oscNodes.forEach(o => { try { o.stop(); } catch(e) {} });
    oscNodes = [];
    if (gainMusica) {
        try { gainMusica.disconnect(); } catch(e) {}
        gainMusica = null;
    }
}

function agendarLoop(startTime) {
    const c = obterCtx();

    const master = c.createGain();
    master.gain.setValueAtTime(0.045, startTime); // volume suave da trilha
    master.connect(c.destination);
    gainMusica = master;

    const durLoop = MELODIA_MED.length * BEAT;

    // Flauta (melodia) — sine com vibrato leve
    MELODIA_MED.forEach((idx, i) => {
        const freq = ESCALA_MEDIEVAL[idx];
        const t = startTime + i * BEAT;

        const osc = c.createOscillator();
        const lfo = c.createOscillator();
        const lfoGain = c.createGain();
        const g = c.createGain();

        lfo.frequency.value = 5.5;
        lfoGain.gain.value = 3;
        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);
        osc.connect(g);
        g.connect(master);

        g.gain.setValueAtTime(0.0001, t);
        g.gain.linearRampToValueAtTime(0.55, t + BEAT * 0.12);
        g.gain.setValueAtTime(0.55, t + BEAT * 0.65);
        g.gain.exponentialRampToValueAtTime(0.0001, t + BEAT * 0.92);

        lfo.start(t);
        lfo.stop(t + BEAT);
        osc.start(t);
        osc.stop(t + BEAT);
        oscNodes.push(osc, lfo);
    });

    // Alaúde (bordão) — triangle, mais grave
    BORDAO.forEach((idx, i) => {
        const freq = ESCALA_MEDIEVAL[idx] / 2;
        const t = startTime + i * (BEAT * 3);

        const osc = c.createOscillator();
        const g = c.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t);
        osc.connect(g);
        g.connect(master);

        g.gain.setValueAtTime(0.4, t);
        g.gain.exponentialRampToValueAtTime(0.0001, t + BEAT * 2.5);

        osc.start(t);
        osc.stop(t + BEAT * 3);
        oscNodes.push(osc);
    });

    return durLoop;
}

function loopMusica(startTime) {
    if (!musicaRodando || !musicaAtivada) return;
    const dur = agendarLoop(startTime);
    loopTimeout = setTimeout(() => loopMusica(startTime + dur), (dur - 0.15) * 1000);
}

export function iniciarMusica() {
    if (musicaRodando || !musicaAtivada) return;
    musicaRodando = true;
    const c = obterCtx();
    loopMusica(c.currentTime + 0.2);
}

export function pararMusica() {
    musicaRodando = false;
    clearTimeout(loopTimeout);
    // Para na hora — fade de 80ms apenas para não estourar
    if (gainMusica) {
        try {
            const c = obterCtx();
            gainMusica.gain.cancelScheduledValues(c.currentTime);
            gainMusica.gain.setValueAtTime(gainMusica.gain.value, c.currentTime);
            gainMusica.gain.linearRampToValueAtTime(0.0001, c.currentTime + 0.08);
        } catch(e) {}
    }
    setTimeout(pararOsciladores, 120);
}

export function toggleMusica() {
    musicaAtivada = !musicaAtivada;
    if (!musicaAtivada) pararMusica();
    else iniciarMusica();
    return musicaAtivada;
}

export function toggleEfeitos() {
    efeitosAtivados = !efeitosAtivados;
    return efeitosAtivados;
}

export function isMusicaAtivada() { return musicaAtivada; }
export function isEfeitosAtivados() { return efeitosAtivados; }

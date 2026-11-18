import { postJSON } from './api.js';
import { atualizarEstadoExterno } from './jogo.js';

let timerDiabinho = null;
export const TEMPO_DIABINHO = window.TEMPO_DIABINHO || 45000;
let primeiraLetraJogada = false;

export function registrarPrimeiraJogada() {
    primeiraLetraJogada = true;
}

export function resetarPrimeiraJogada() {
    primeiraLetraJogada = false;
}

export function cancelarTimerDiabinho() {
    clearTimeout(timerDiabinho);
    timerDiabinho = null;
}

export function iniciarTimerDiabinho(estadoAtual, atualizarTela) {
    cancelarTimerDiabinho();
    if (!primeiraLetraJogada) return;
    if (!estadoAtual || estadoAtual.estado !== 'EM_ANDAMENTO' || estadoAtual.pergunta_ativa) return;

    timerDiabinho = setTimeout(async () => {
        if (!estadoAtual || estadoAtual.estado !== 'EM_ANDAMENTO' || estadoAtual.pergunta_ativa) return;
        const estado = await postJSON('/acionar-diabinho-timer', {});
        atualizarEstadoExterno(estado);
    }, TEMPO_DIABINHO);
}
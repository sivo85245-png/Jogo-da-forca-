import { el } from './elementos.js';
import { mostrarModal } from './modal.js';
import { atualizarAlfabeto, sincronizarTeclado } from './teclado.js';
import { iniciarTimerDiabinho, cancelarTimerDiabinho } from './timer.js';

export const capitalizar = (texto = '') => texto.charAt(0).toUpperCase() + texto.slice(1);

let timeoutToast = null;

export function exibirToast(mensagem, tipo = 'info') {
    if (!mensagem) return;
    el.toast.textContent = mensagem;
    el.toast.className = `toast ${tipo}`;
    el.toast.classList.remove('hidden');
    clearTimeout(timeoutToast);
    timeoutToast = setTimeout(() => el.toast.classList.add('hidden'), 2600);
}

export function reaplicarAnimacao(elemento, classe) {
    if (!elemento) return;
    elemento.classList.remove(classe);
    void elemento.offsetWidth;
    elemento.classList.add(classe);
}

function criarElemento(tag, { className = '', textContent = '', innerHTML = '' } = {}) {
    const elemento = document.createElement(tag);
    if (className) elemento.className = className;
    if (textContent) elemento.textContent = textContent;
    if (innerHTML) elemento.innerHTML = innerHTML;
    return elemento;
}

function criarTag(texto, classe = '') {
    return criarElemento('span', {
        className: `letter-pill ${classe}`.trim(),
        textContent: String(texto).toUpperCase(),
    });
}

export function renderizarTags(container, itens, classe, vazio = 'Nenhuma') {
    container.innerHTML = '';
    if (!itens?.length) {
        container.appendChild(criarElemento('span', { className: 'tag-empty', textContent: vazio }));
        return;
    }
    itens.forEach((item) => container.appendChild(criarTag(item, classe)));
}

export function renderizarPalavra(texto) {
    el.jogo.palavraMascarada.innerHTML = '';
    texto.split(' ').filter(Boolean).forEach((slot) => {
        el.jogo.palavraMascarada.appendChild(criarElemento('span', {
            className: `word-slot ${slot !== '_' ? 'revealed' : 'unknown'}`,
            textContent: slot === '-' ? '—' : slot.toUpperCase(),
        }));
    });
}

export function atualizarBanner(estado) {
    let banner = null;
    if (estado.pergunta_ativa?.origem === 'anjinho') {
        banner = { texto: '👼 O anjinho abriu uma pergunta.', classe: 'event-banner' };
    } else if (estado.pergunta_ativa?.origem === 'diabinho') {
        banner = { texto: '😈 O diabinho apareceu com um desafio.', classe: 'event-banner danger' };
    } else if (estado.modo_invertido) {
        banner = {
            texto: `⚠ A palavra está invertida por ${estado.turnos_invertidos_restantes} jogada(s).`,
            classe: 'event-banner danger',
        };
    }
    el.jogo.eventBanner.classList.toggle('hidden', !banner);
    if (!banner) return;
    el.jogo.eventBanner.textContent = banner.texto;
    el.jogo.eventBanner.className = banner.classe;
}

export function atualizarAnjinho(estado) {
    const status = estado.pergunta_ativa?.origem === 'anjinho'
        ? ['Pergunta ativa', 'power-state waiting']
        : estado.anjinho_usado
            ? ['Já usado', 'power-state used']
            : ['Disponível', 'power-state ready'];
    [el.controles.powerAngelState.textContent, el.controles.powerAngelState.className] = status;
}

export function atualizarControles(estado) {
    const bloqueado = estado.estado !== 'EM_ANDAMENTO' || Boolean(estado.pergunta_ativa);
    el.controles.btnTentar.disabled = bloqueado;
    el.controles.inputPalpite.disabled = bloqueado;
    el.controles.btnAnjinho.disabled = estado.anjinho_usado || bloqueado;
    el.controles.btnReiniciar.classList.toggle('hidden', estado.estado === 'EM_ANDAMENTO');
}

export function atualizarOverlayFinal(estado) {
    if (estado.estado === 'VENCEU') {
        el.endgame.kicker.textContent = 'Vitória';
        el.endgame.title.textContent = 'Você venceu a rodada';
        el.endgame.text.textContent = `Boa! Você descobriu a palavra ${String(estado.palavra_revelada || '').toUpperCase()}.`;
        return el.endgame.overlay.classList.remove('hidden');
    }
    if (estado.estado === 'PERDEU') {
        el.endgame.kicker.textContent = 'Fim de jogo';
        el.endgame.title.textContent = 'A rodada terminou';
        el.endgame.text.textContent = `A palavra correta era ${String(estado.palavra_revelada || '').toUpperCase()}. Tente de novo.`;
        return el.endgame.overlay.classList.remove('hidden');
    }
    el.endgame.overlay.classList.add('hidden');
}

export function aplicarAnimacoes(estado, ultimoErro, ultimaPalavra) {
    if (estado.erros > ultimoErro) {
        reaplicarAnimacao(el.jogo.forcaStage, 'shake');
        reaplicarAnimacao(el.jogo.errosLabel, 'pulse-danger');
    }
    if (estado.palavra_mascarada !== ultimaPalavra && estado.erros === ultimoErro) {
        reaplicarAnimacao(el.jogo.palavraWrapper, 'pop');
    }
    if (estado.feedback === 'angel') {
        reaplicarAnimacao(document.body, 'flash-angel');
        setTimeout(() => document.body.classList.remove('flash-angel'), 600);
    }
    if (estado.feedback === 'devil') {
        reaplicarAnimacao(document.body, 'flash-devil');
        setTimeout(() => document.body.classList.remove('flash-devil'), 600);
    }
}

export function atualizarTela(estado, estadoAtual, ultimoErro, ultimaPalavra, tecladoVisivel, responderEvento) {
    el.jogo.categoriaLabel.textContent = capitalizar(estado.categoria);
    el.jogo.errosLabel.textContent = `${estado.erros} / ${estado.max_erros}`;

    renderizarPalavra(estado.palavra_mascarada);
    renderizarTags(
        el.historico.letrasTentadas,
        estado.letras_tentadas.filter((letra) => !estado.letras_descobertas.includes(letra)),
        'wrong',
    );
    renderizarTags(el.historico.letrasBloqueadas, estado.letras_bloqueadas, 'blocked');
    renderizarTags(el.historico.chutesPalavra, estado.chutes_palavra, 'full-guess', 'Nenhum');
    el.jogo.forcaImg.src = `/static/img/forca_${estado.erros}.svg`;

    document.body.classList.toggle('invert-mode', estado.modo_invertido);
    atualizarBanner(estado);
    atualizarAnjinho(estado);
    atualizarControles(estado);
    atualizarAlfabeto(estado);
    sincronizarTeclado(tecladoVisivel);
    aplicarAnimacoes(estado, ultimoErro, ultimaPalavra);
    atualizarOverlayFinal(estado);

    if (estado.pergunta_ativa) {
        mostrarModal(estado.pergunta_ativa, responderEvento);
    } else {
        el.modal.container.classList.add('hidden');
    }

    exibirToast(estado.mensagem, estado.feedback || 'info');

    if (estado.estado === 'EM_ANDAMENTO' && !estado.pergunta_ativa) {
        iniciarTimerDiabinho(estadoAtual, (e) => atualizarTela(e, estadoAtual, ultimoErro, ultimaPalavra, tecladoVisivel, responderEvento));
    } else {
        cancelarTimerDiabinho();
    }
}
import { el } from './elementos.js';
import { postJSON, getJSON } from './api.js';
import { capitalizar, atualizarTela, exibirToast } from './ui.js';
import { criarAlfabeto } from './teclado.js';
import { cancelarTimerDiabinho, registrarPrimeiraJogada, resetarPrimeiraJogada } from './timer.js';

export const CATEGORY_META = {
    tecnologia: { icon: '💻', desc: 'Programação, sistemas e ferramentas do mundo tech.' },
    games: { icon: '🎮', desc: 'Palavras ligadas ao universo dos jogos e franquias famosas.' },
    filmes: { icon: '🎬', desc: 'Títulos, personagens e referências do cinema.' },
};

export const DURACAO_TRANSICAO = window.DURACAO_TRANSICAO || parseInt(
    getComputedStyle(document.documentElement).getPropertyValue('--duracao-transicao')
) || 350;

export let estadoAtual = null;
export let ultimoErro = 0;
export let ultimaPalavra = '';
export let tecladoVisivel = !window.matchMedia('(min-width: 900px)').matches;

export function responderEvento(resposta) {
    if (!estadoAtual?.pergunta_ativa) return;
    const rota = estadoAtual.pergunta_ativa.origem === 'anjinho' ? '/responder-anjinho' : '/responder-diabinho';
    postJSON(rota, { resposta }).then((estado) => atualizarEstado(estado));
}

function atualizarEstado(estado) {
    ultimoErro = estadoAtual?.erros ?? 0;
    ultimaPalavra = estadoAtual?.palavra_mascarada ?? '';
    estadoAtual = estado;
    atualizarTela(estado, estadoAtual, ultimoErro, ultimaPalavra, tecladoVisivel, responderEvento);
}

export function atualizarEstadoExterno(estado) {
    atualizarEstado(estado);
}

export async function enviarPalpite(palpite) {
    registrarPrimeiraJogada();
    if (!palpite) return;
    const estado = await postJSON('/tentar', { palpite });
    el.controles.inputPalpite.value = '';
    atualizarEstado(estado);
    if (!estado.pergunta_ativa && estado.estado === 'EM_ANDAMENTO') {
        setTimeout(() => el.controles.inputPalpite.focus(), 0);
    }
}

export async function acionarAnjinho() {
    const estado = await postJSON('/acionar-anjinho');
    atualizarEstado(estado);
}

export async function iniciarJogo(categoria) {
    const estadoPromise = postJSON('/iniciar', { categoria });
    el.telas.categorias.classList.add('tela-saindo-esquerda');

    const [estado] = await Promise.all([
        estadoPromise,
        new Promise((resolve) => setTimeout(resolve, DURACAO_TRANSICAO)),
    ]);

    if (!estado.palavra_mascarada) {
        el.telas.categorias.classList.remove('tela-saindo-esquerda');
        el.telas.categorias.classList.remove('hidden');
        exibirToast(estado.mensagem || 'Erro ao iniciar o jogo.', 'error');
        return;
    }

    el.telas.categorias.classList.remove('tela-saindo-esquerda');
    el.telas.categorias.classList.add('hidden');

    el.telas.jogo.classList.remove('hidden');
    el.telas.jogo.classList.add('tela-entrando-direita');
    setTimeout(() => el.telas.jogo.classList.remove('tela-entrando-direita'), DURACAO_TRANSICAO);

    tecladoVisivel = !window.matchMedia('(min-width: 900px)').matches;
    criarAlfabeto(enviarPalpite);
    atualizarEstado(estado);
    setTimeout(() => el.controles.inputPalpite.focus(), 0);
}

export async function reiniciarJogo() {
    if (!estadoAtual) return;
    const estado = await postJSON('/reiniciar', { categoria: estadoAtual.categoria });
    el.endgame.overlay.classList.add('hidden');
    criarAlfabeto(enviarPalpite);
    atualizarEstado(estado);
    setTimeout(() => el.controles.inputPalpite.focus(), 0);
}

export function voltarMenuPrincipal() {
    estadoAtual = null;
    ultimoErro = 0;
    ultimaPalavra = '';
    el.controles.inputPalpite.value = '';
    cancelarTimerDiabinho();
    resetarPrimeiraJogada();
    el.modal.container.classList.add('hidden');
    el.endgame.overlay.classList.add('hidden');
    el.controles.btnReiniciar.classList.add('hidden');
    document.body.classList.remove('invert-mode');

    el.menu.listaCategorias.querySelectorAll('.category-button').forEach((btn) => {
        btn.disabled = false;
        btn.querySelector('.cat-title').textContent = capitalizar(
            btn.querySelector('.cat-desc').textContent.includes('tech') ? 'Tecnologia' :
            btn.querySelector('.cat-desc').textContent.includes('jogos') ? 'Games' : 'Filmes'
        );
    });

    el.telas.jogo.classList.add('tela-saindo-direita');
    setTimeout(() => {
        el.telas.jogo.classList.remove('tela-saindo-direita');
        el.telas.jogo.classList.add('hidden');
        el.telas.categorias.classList.remove('hidden');
        el.telas.categorias.classList.add('tela-entrando-esquerda');
        setTimeout(() => el.telas.categorias.classList.remove('tela-entrando-esquerda'), DURACAO_TRANSICAO);
    }, DURACAO_TRANSICAO);
}

export function renderizarCategorias(categorias) {
    el.menu.listaCategorias.innerHTML = '';
    categorias.forEach((categoria) => {
        const { icon, desc } = CATEGORY_META[categoria] || { icon: '🎯', desc: 'Categoria do jogo.' };
        const botao = document.createElement('button');
        botao.className = 'category-button';
        botao.innerHTML = `
            <span class="cat-icon">${icon}</span>
            <span class="cat-title">${capitalizar(categoria)}</span>
            <span class="cat-desc">${desc}</span>
        `;
        botao.addEventListener('click', () => {
            botao.disabled = true;
            botao.querySelector('.cat-title').textContent = 'Carregando...';
            iniciarJogo(categoria);
        });
        el.menu.listaCategorias.appendChild(botao);
    });
}

export async function carregarCategorias() {
    renderizarCategorias(await getJSON('/categorias'));
}
import { el } from './elementos.js';
import {
    iniciarJogo,
    reiniciarJogo,
    voltarMenuPrincipal,
    enviarPalpite,
    responderEvento,
    carregarCategorias,
    acionarAnjinho,
} from './jogo.js';
import { sincronizarTeclado } from './teclado.js';
import { fecharModal } from './modal.js';
import { iniciarMusica, somBotao, toggleMusica, toggleEfeitos } from './audio.js';

let tecladoVisivel = !window.matchMedia('(min-width: 900px)').matches;

// ── Botões de áudio (um em cima do outro, legenda abaixo de cada) ──
const audioBar = document.createElement('div');
audioBar.style.cssText = `
    position: fixed;
    bottom: 24px;
    left: 24px;
    z-index: 50;
    display: flex;
    flex-direction: column;
    gap: 14px;
    pointer-events: none;
`;

function criarBtnAudio(emoji, legenda, titulo) {
    const wrapper = document.createElement('div');
    wrapper.style.cssText = `
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 5px;
        pointer-events: auto;
        width: 52px;
    `;
    const btn = document.createElement('button');
    btn.className = 'secondary-button';
    btn.style.cssText = `
        padding: 0;
        font-size: 1.1rem;
        border-radius: 50%;
        width: 44px;
        height: 44px;
        min-width: unset;
    `;
    btn.textContent = emoji;
    btn.title = titulo;
    const label = document.createElement('span');
    label.textContent = legenda;
    label.style.cssText = `
        font-size: 0.62rem;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--text-muted);
        font-family: inherit;
        white-space: nowrap;
    `;
    wrapper.appendChild(btn);
    wrapper.appendChild(label);
    return { wrapper, btn };
}

const { wrapper: wMusica, btn: btnMusica } = criarBtnAudio('🎵', 'Trilha', 'Música de fundo');
btnMusica.addEventListener('click', () => {
    const ativo = toggleMusica();
    btnMusica.textContent = ativo ? '🎵' : '🔕';
    btnMusica.style.opacity = ativo ? '1' : '0.45';
});

const { wrapper: wEfeitos, btn: btnEfeitos } = criarBtnAudio('🔊', 'Efeitos', 'Efeitos sonoros');
btnEfeitos.addEventListener('click', () => {
    const ativo = toggleEfeitos();
    btnEfeitos.textContent = ativo ? '🔊' : '🔇';
    btnEfeitos.style.opacity = ativo ? '1' : '0.45';
});

audioBar.appendChild(wMusica);
audioBar.appendChild(wEfeitos);
document.body.appendChild(audioBar);

// Inicia música ao primeiro clique do usuário (exigência do navegador)
document.addEventListener('click', () => iniciarMusica(), { once: true });

el.controles.btnTentar.addEventListener('click', () => {
    somBotao();
    const palpite = el.controles.inputPalpite.value.trim();
    if (palpite) enviarPalpite(palpite);
});

el.controles.inputPalpite.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        somBotao();
        const palpite = el.controles.inputPalpite.value.trim();
        if (palpite) enviarPalpite(palpite);
    }
});

el.controles.btnAnjinho.addEventListener('click', () => { somBotao(); acionarAnjinho(); });

el.controles.btnVoltarMenu.addEventListener('click', () => { somBotao(); voltarMenuPrincipal(); });
el.controles.btnReiniciar.addEventListener('click', () => { somBotao(); reiniciarJogo(); });
el.controles.btnReiniciarOverlay.addEventListener('click', () => { somBotao(); reiniciarJogo(); });

el.controles.btnToggleTeclado.addEventListener('click', () => {
    somBotao();
    tecladoVisivel = !tecladoVisivel;
    sincronizarTeclado(tecladoVisivel);
});

el.modal.btnEnviar.addEventListener('click', () => { somBotao(); responderEvento(el.modal.inputResposta.value); });
el.modal.inputResposta.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') { somBotao(); responderEvento(el.modal.inputResposta.value); }
});
el.modal.btnVerdadeiro.addEventListener('click', () => { somBotao(); responderEvento('v'); });
el.modal.btnFalso.addEventListener('click', () => { somBotao(); responderEvento('f'); });
el.modal.btnFechar.addEventListener('click', () => { somBotao(); fecharModal(null); });

window.addEventListener('keydown', (event) => {
    import('./jogo.js').then(({ estadoAtual }) => {
        if (
            el.telas.jogo.classList.contains('hidden')
            || !estadoAtual
            || estadoAtual.estado !== 'EM_ANDAMENTO'
            || estadoAtual.pergunta_ativa
            || [el.modal.inputResposta, el.controles.inputPalpite].includes(document.activeElement)
        ) return;

        const tecla = event.key.toLowerCase();
        if (/^[a-z]$/.test(tecla)) enviarPalpite(tecla);
    });
});

// ── Inicialização ──
sincronizarTeclado(tecladoVisivel);
carregarCategorias();
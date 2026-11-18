import { el } from './elementos.js';

export function renderizarAlternativas(pergunta, responderEvento) {
    el.modal.respostaAlternativasArea.innerHTML = '';
    Object.entries(pergunta.alternativas || {}).forEach(([letra, texto]) => {
        const botao = document.createElement('button');
        botao.className = 'alt-btn';
        botao.innerHTML = `<span class="alt-label">${letra}</span><span class="alt-text">${texto}</span>`;
        botao.addEventListener('click', () => responderEvento(letra));
        el.modal.respostaAlternativasArea.appendChild(botao);
    });
}

export function mostrarModal(pergunta, responderEvento) {
    el.modal.container.classList.remove('hidden');
    el.modal.origem.textContent = pergunta.origem === 'anjinho' ? 'Anjinho' : 'Diabinho';
    el.modal.textoPergunta.textContent = pergunta.pergunta;
    el.modal.dicaPergunta.textContent = pergunta.dica || '';
    el.modal.inputResposta.value = '';

    [el.modal.respostaTextoArea, el.modal.respostaVfArea, el.modal.respostaAlternativasArea]
        .forEach((area) => area.classList.add('hidden'));

    // Move foco para o modal-card para garantir que cliques funcionem
    const card = el.modal.container.querySelector('.modal-card');
    if (card) {
        card.setAttribute('tabindex', '-1');
        card.focus();
    }

    if (pergunta.tipo === 'alternativas') {
        renderizarAlternativas(pergunta, responderEvento);
        el.modal.respostaAlternativasArea.classList.remove('hidden');
        setTimeout(() => {
            const primeiro = el.modal.respostaAlternativasArea.querySelector('.alt-btn');
            if (primeiro) primeiro.focus();
        }, 50);
    } else if (pergunta.tipo === 'texto') {
        el.modal.respostaTextoArea.classList.remove('hidden');
        setTimeout(() => el.modal.inputResposta.focus(), 50);
    } else {
        el.modal.respostaVfArea.classList.remove('hidden');
        setTimeout(() => el.modal.btnVerdadeiro.focus(), 50);
    }

    el.modal.btnFechar.classList.add('hidden');
}

export function fecharModal(estadoAtual) {
    if (!estadoAtual?.pergunta_ativa) el.modal.container.classList.add('hidden');
}
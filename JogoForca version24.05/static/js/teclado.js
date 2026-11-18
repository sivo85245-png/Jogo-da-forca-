import { el } from './elementos.js';

export const KEYBOARD_ROWS = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm'];

export function criarAlfabeto(enviarPalpite) {
    el.teclado.alfabetoArea.innerHTML = '';
    KEYBOARD_ROWS.forEach((linha) => {
        const row = document.createElement('div');
        row.className = 'keyboard-row';
        [...linha].forEach((letra) => {
            const btn = document.createElement('button');
            btn.className = 'letter-key';
            btn.textContent = letra.toUpperCase();
            btn.dataset.letra = letra;
            btn.addEventListener('click', () => enviarPalpite(letra));
            row.appendChild(btn);
        });
        el.teclado.alfabetoArea.appendChild(row);
    });
}

export function atualizarAlfabeto(estado) {
    const bloqueado = Boolean(estado.pergunta_ativa) || estado.estado !== 'EM_ANDAMENTO';

    el.teclado.alfabetoArea.querySelectorAll('.letter-key').forEach((btn) => {
        const letra = btn.dataset.letra;
        btn.className = 'letter-key';
        btn.disabled = false;

        const classe = estado.letras_descobertas.includes(letra)
            ? 'correct'
            : estado.letras_tentadas.includes(letra)
                ? 'wrong'
                : estado.letras_bloqueadas.includes(letra)
                    ? 'blocked'
                    : bloqueado
                        ? 'inactive'
                        : '';

        if (classe) {
            btn.classList.add(classe);
            btn.disabled = true;
        }
    });
}

export function sincronizarTeclado(tecladoVisivel) {
    el.teclado.keyboardShell.classList.toggle('hidden', !tecladoVisivel);
    el.controles.btnToggleTeclado.textContent = tecladoVisivel ? 'Ocultar teclado' : 'Mostrar teclado';
}
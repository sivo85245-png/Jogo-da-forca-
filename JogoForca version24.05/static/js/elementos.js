const $ = (id) => document.getElementById(id);

export const el = {
    telas: {
        categorias: $('tela-categorias'),
        jogo: $('tela-jogo'),
    },
    menu: {
        listaCategorias: $('lista-categorias'),
    },
    jogo: {
        categoriaLabel: $('categoria-label'),
        errosLabel: $('erros-label'),
        eventBanner: $('event-banner'),
        forcaStage: $('forca-stage'),
        forcaImg: $('forca-img'),
        palavraWrapper: $('palavra-wrapper'),
        palavraMascarada: $('palavra-mascarada'),
    },
    controles: {
        inputPalpite: $('input-palpite'),
        btnTentar: $('btn-tentar'),
        btnAnjinho: $('btn-anjinho'),
        btnVoltarMenu: $('btn-voltar-menu'),
        btnReiniciar: $('btn-reiniciar'),
        btnReiniciarOverlay: $('btn-reiniciar-overlay'),
        btnToggleTeclado: $('btn-toggle-teclado'),
        powerAngelState: $('power-angel-state'),
    },
    historico: {
        letrasTentadas: $('letras-tentadas'),
        letrasBloqueadas: $('letras-bloqueadas'),
        chutesPalavra: $('chutes-palavra'),
    },
    teclado: {
        keyboardShell: $('keyboard-shell'),
        alfabetoArea: $('alfabeto-area'),
    },
    modal: {
        container: $('modal-pergunta'),
        origem: $('modal-origem'),
        textoPergunta: $('texto-pergunta'),
        dicaPergunta: $('dica-pergunta'),
        respostaTextoArea: $('resposta-texto-area'),
        respostaVfArea: $('resposta-vf-area'),
        respostaAlternativasArea: $('resposta-alternativas-area'),
        inputResposta: $('input-resposta-pergunta'),
        btnEnviar: $('btn-enviar-resposta'),
        btnVerdadeiro: $('btn-verdadeiro'),
        btnFalso: $('btn-falso'),
        btnFechar: $('btn-fechar-modal'),
    },
    endgame: {
        overlay: $('endgame-overlay'),
        kicker: $('endgame-kicker'),
        title: $('endgame-title'),
        text: $('endgame-text'),
    },
    toast: $('toast'),
};
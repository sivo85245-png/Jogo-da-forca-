import string

from src.banco_palavras import BancoPalavras
from src.controle_palpite import ControlePalpite
from src.estado_jogo import EstadoJogo
from src.guardioes_forca import GuardioesForca


class JogoForca:
    def __init__(self, categoria):
        self.banco_palavras = BancoPalavras()
        self.guardioes = GuardioesForca(self.banco_palavras)
        self.controle_palpite = ControlePalpite()
        self._max_erros = 6
        self.iniciar_jogo(categoria)

    def _criar_resposta(self, mensagem='', feedback='info'):
        return self.obter_estado_completo() | {'mensagem': mensagem, 'feedback': feedback}

    def _jogo_encerrado(self):
        return self.estado in {EstadoJogo.VENCEU, EstadoJogo.PERDEU}

    def _revelar_palavra_toda(self):
        self.letras_descobertas = list(dict.fromkeys(ch for ch in self.palavra_secreta if ch.isalpha()))

    def _letras_reveladas(self):
        return {letra for letra in self.palavra_secreta if letra in self.letras_descobertas}

    def _registrar_jogada(self):
        self.jogadas_realizadas += 1
        self.guardioes.registrar_jogada()

    def _processar_pos_jogada(self, mensagem, feedback):
        evento = self.guardioes.acionar_diabinho_automatico(
            categoria=self.categoria,
            total_tentativas=self.jogadas_realizadas,
            jogo_encerrado=self._jogo_encerrado(),
        )
        if evento:
            mensagem = f"{mensagem} {evento['mensagem']}"
            feedback = evento['feedback']
        return self._criar_resposta(mensagem, feedback)

    def obter_palavra_mascarada(self):
        slots = [
            caractere if not caractere.isalpha() or caractere in self.letras_descobertas else '_'
            for caractere in self.palavra_secreta
        ]
        if self.guardioes.esta_invertido():
            slots.reverse()
        return ' '.join(slots)

    def verificar_vitoria(self):
        if {letra for letra in self.palavra_secreta if letra.isalpha()} <= set(self.letras_descobertas):
            self.estado = EstadoJogo.VENCEU

    def verificar_derrota(self):
        if self.erros >= self._max_erros:
            self.erros = self._max_erros
            self.estado = EstadoJogo.PERDEU

    def _validar_entrada_base(self):
        if self._jogo_encerrado():
            return self._criar_resposta('A partida já terminou. Reinicie para jogar de novo.', 'warning')
        if self.guardioes.pergunta_ativa:
            return self._criar_resposta('Responda primeiro o pop-up do anjinho ou do diabinho.', 'warning')
        return None

    def _tentar_letra(self, letra):
        if letra not in string.ascii_lowercase:
            return self._criar_resposta('Digite apenas uma letra de a a z.', 'warning')
        if self.guardioes.esta_bloqueada(letra):
            return self._criar_resposta(f"A letra '{letra}' foi bloqueada pelo anjinho.", 'warning')
        if letra in self.letras_tentadas:
            return self._criar_resposta(f"A letra '{letra}' já foi tentada.", 'warning')

        self.letras_tentadas.append(letra)
        self._registrar_jogada()
        acertou = letra in self.palavra_secreta
        if acertou and letra not in self.letras_descobertas:
            self.letras_descobertas.append(letra)
        self.erros += 0 if acertou else 1
        self.verificar_vitoria()
        self.verificar_derrota()

        mensagem = f"Boa! A letra '{letra}' existe na palavra." if acertou else f"Ops! A letra '{letra}' não está na palavra."
        return self._processar_pos_jogada(mensagem, 'success' if acertou else 'error')

    def _tentar_palavra_completa(self, palpite):
        resultado = self.controle_palpite.registrar_tentativa_palavra(palpite, self.palavra_secreta)
        self._registrar_jogada()
        if resultado['acertou']:
            self._revelar_palavra_toda()
            self.verificar_vitoria()
            return self._criar_resposta(
                f"Excelente! Você acertou a palavra completa: {resultado['palpite'].upper()}.",
                'success',
            )

        self.erros += resultado['penalidade']
        self.verificar_derrota()
        return self._processar_pos_jogada(
            (
                f"Palpite completo incorreto: {resultado['palpite'].upper()}. "
                f"Você perdeu {resultado['penalidade']} vida(s). "
                f"Próxima penalidade: {self.controle_palpite.proxima_penalidade()} vida(s)."
            ),
            'error',
        )

    def tentar_palpite(self, palpite):
        if bloqueio := self._validar_entrada_base():
            return bloqueio

        tipo, valor = self.controle_palpite.classificar_palpite(palpite)
        if tipo == 'invalido':
            return self._criar_resposta('Use apenas letras. Espaços e hífens são aceitos no chute completo.', 'warning')
        if tipo == 'vazio':
            return self._criar_resposta('Digite uma letra ou arrisque a palavra inteira.', 'warning')
        return self._tentar_letra(valor) if tipo == 'letra' else self._tentar_palavra_completa(valor)

    def tentar_letra(self, letra):
        return self.tentar_palpite(letra)

    def acionar_anjinho(self):
        resultado = self.guardioes.acionar_anjinho(self.categoria, self._jogo_encerrado())
        return self._criar_resposta(resultado['mensagem'], resultado['feedback'])

    def responder_anjinho(self, resposta):
        resultado = self.guardioes.responder_anjinho(resposta, self.palavra_secreta, self.letras_tentadas)
        return self._criar_resposta(resultado['mensagem'], resultado['feedback'])

    def acionar_diabinho(self):
        resultado = self.guardioes.acionar_diabinho(self.categoria, self._jogo_encerrado())
        return self._criar_resposta(resultado['mensagem'], resultado['feedback'])

    def responder_diabinho(self, resposta):
        resultado = self.guardioes.responder_diabinho(resposta)
        self.erros += resultado.get('erros_extra', 0)
        self.verificar_derrota()
        return self._criar_resposta(resultado['mensagem'], resultado['feedback'])

    def acionar_diabinho_timer(self):
        if self._jogo_encerrado():
            return self._criar_resposta('A partida já terminou.', 'warning')
        if self.guardioes.pergunta_ativa:
            return self._criar_resposta('Já existe uma pergunta ativa.', 'warning')
        resultado = self.guardioes.acionar_diabinho_automatico(
            categoria=self.categoria,
            total_tentativas=self.jogadas_realizadas,
            jogo_encerrado=self._jogo_encerrado(),
            forcar=True,
        )
        if not resultado:
            return self._criar_resposta('O diabinho não tem mais eventos disponíveis.', 'info')
        return self._criar_resposta(resultado['mensagem'], resultado['feedback'])

    def iniciar_jogo(self, categoria):
        self.categoria = categoria
        self.palavra_secreta = self.banco_palavras.sortear_palavra(categoria)
        self.letras_descobertas, self.letras_tentadas = [], []
        self.erros = self.jogadas_realizadas = 0
        self.estado = EstadoJogo.EM_ANDAMENTO
        self.guardioes.reiniciar()
        self.guardioes.configurar_partida(self.palavra_secreta)
        self.controle_palpite.reiniciar()

    def listar_categorias(self):
        return self.banco_palavras.listar_categorias()

    def obter_estado_completo(self):
        return {
            'palavra_mascarada': self.obter_palavra_mascarada(),
            'erros': self.erros,
            'max_erros': self._max_erros,
            'letras_tentadas': self.letras_tentadas,
            'letras_descobertas': sorted(self._letras_reveladas()),
            'estado': self.estado.name,
            'categoria': self.categoria,
            'palavra_revelada': self.palavra_secreta if self._jogo_encerrado() else None,
            'jogadas_realizadas': self.jogadas_realizadas,
        } | self.guardioes.obter_estado_publico() | self.controle_palpite.obter_estado_publico()

    def reiniciar_jogo(self, categoria):
        self.iniciar_jogo(categoria)
        return self._criar_resposta('Nova partida iniciada.', 'info')
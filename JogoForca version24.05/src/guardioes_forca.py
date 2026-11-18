import math
import random
import string
import unicodedata
from difflib import SequenceMatcher


class GuardioesForca:
    def __init__(self, banco_palavras):
        self.banco_palavras = banco_palavras
        self.reiniciar()

    @staticmethod
    def _normalizar(texto):
        texto = unicodedata.normalize('NFD', (texto or '').strip().lower())
        return ''.join(ch for ch in texto if unicodedata.category(ch) != 'Mn')

    @staticmethod
    def _resposta(mensagem, feedback='warning', **extra):
        return {'mensagem': mensagem, 'feedback': feedback, **extra}

    def reiniciar(self):
        self.letras_bloqueadas = set()
        self.turnos_invertidos_restantes = 0
        self.pergunta_ativa = None
        self.anjinho_usado = False
        self.diabinho_total_eventos = 0
        self.diabinho_eventos_disparados = 0
        self.diabinho_eventos_restantes = 0
        self.diabinho_gatilhos = []

    def configurar_partida(self, palavra_secreta):
        tamanho = len(palavra_secreta or '')

        # Define faixa de aparições baseada no tamanho da palavra
        if tamanho <= 5:
            minimo, maximo = 1, 2
        elif tamanho <= 9:
            minimo, maximo = 2, 3
        else:
            minimo, maximo = 3, 4

        # Peso inteligente: quanto mais próximo do limite superior da faixa,
        # maior a chance do número maior de aparições
        peso = (tamanho - (5 if tamanho <= 5 else 6 if tamanho <= 9 else 10))
        peso_normalizado = min(1.0, max(0.0, peso / 4))

        # random.random() sorteia entre 0.0 e 1.0
        # math.ceil garante que o resultado seja inteiro arredondado para cima
        total = math.ceil(minimo + peso_normalizado * random.random() * (maximo - minimo))
        total = max(minimo, min(maximo, total))

        self.diabinho_total_eventos = total
        self.diabinho_eventos_disparados = 0
        self.diabinho_eventos_restantes = total
        self.diabinho_gatilhos = self._calcular_gatilhos(tamanho, total)

    def _calcular_gatilhos(self, tamanho_palavra, total_eventos):
        gatilhos = []
        for indice in range(1, total_eventos + 1):
            marco = max(2, round(indice * (max(1, tamanho_palavra) / (total_eventos + 1))))
            gatilhos.append(max(marco, gatilhos[-1] + 1) if gatilhos else marco)
        return gatilhos

    def _texto_parecido(self, resposta, esperado, limite=0.92):
        resposta, esperado = self._normalizar(resposta), self._normalizar(esperado)
        return bool(resposta and esperado) and (
            resposta == esperado or SequenceMatcher(None, resposta, esperado).ratio() >= limite
        )

    def esta_bloqueada(self, letra):
        return letra in self.letras_bloqueadas

    def esta_invertido(self):
        return self.turnos_invertidos_restantes > 0

    def registrar_jogada(self):
        if self.turnos_invertidos_restantes:
            self.turnos_invertidos_restantes -= 1

    def acionar_anjinho(self, categoria, jogo_encerrado=False):
        if jogo_encerrado:
            return self._resposta('A partida já terminou.')
        if self.pergunta_ativa:
            return self._resposta('Já existe uma pergunta ativa na tela.')
        if self.anjinho_usado:
            return self._resposta('O anjinho já foi usado nesta partida.')

        pergunta = self.banco_palavras.sortear_pergunta_anjinho(categoria)
        self.pergunta_ativa = {
            'origem': 'anjinho',
            'pergunta': pergunta['pergunta'],
            'resposta': self._normalizar(pergunta['resposta']),
            'tipo': pergunta['tipo'],
            'dica': pergunta.get('dica', ''),
            'alternativas': pergunta.get('alternativas', {}),
        }
        return self._resposta(
            'O anjinho abriu um desafio opcional. Acerte para receber ajuda.',
            feedback='angel',
        )

    def _resposta_anjinho_correta(self, resposta):
        if not self.pergunta_ativa:
            return False

        resposta_normalizada = self._normalizar(resposta)
        correta = self.pergunta_ativa['resposta']
        if resposta_normalizada == correta:
            return True
        if self.pergunta_ativa.get('tipo') != 'alternativas':
            return False

        texto_correto = self.pergunta_ativa.get('alternativas', {}).get(correta.upper(), '')
        return self._texto_parecido(resposta_normalizada, texto_correto)

    def responder_anjinho(self, resposta, palavra_secreta, letras_tentadas):
        if not self.pergunta_ativa or self.pergunta_ativa.get('origem') != 'anjinho':
            return self._resposta('Não há pergunta do anjinho ativa agora.')

        correta = self._resposta_anjinho_correta(resposta)
        self.anjinho_usado = True
        self.pergunta_ativa = None
        if not correta:
            self.turnos_invertidos_restantes = 2
            return self._resposta(
                'Você errou o desafio do anjinho. A palavra ficará invertida por 2 jogadas.',
                feedback='error',
            )

        candidatas = [
            letra
            for letra in string.ascii_lowercase
            if letra not in palavra_secreta
            and letra not in letras_tentadas
            and letra not in self.letras_bloqueadas
        ]
        quantidade = min(len(candidatas), max(1, math.ceil(len(candidatas) / 5)))
        removidas = random.sample(candidatas, quantidade) if quantidade else []
        self.letras_bloqueadas.update(removidas)
        letras_texto = ', '.join(sorted(removidas)) if removidas else 'nenhuma'
        return self._resposta(
            f'Resposta certa! O anjinho bloqueou letras erradas do teclado: {letras_texto}.',
            feedback='angel',
        )

    def acionar_diabinho(self, categoria=None, jogo_encerrado=False):
        _ = categoria
        if jogo_encerrado:
            return self._resposta('A partida já terminou.')
        return self._resposta(
            'Agora o diabinho aparece sozinho durante a partida, em forma de pop-up automático.',
        )

    def acionar_diabinho_automatico(self, categoria, total_tentativas, jogo_encerrado=False, forcar=False):
        if jogo_encerrado or self.pergunta_ativa:
            return None

        # Só verifica limite de eventos se NÃO for forçado pelo timer
        if not forcar and self.diabinho_eventos_disparados >= self.diabinho_total_eventos:
            return None

        # Só verifica gatilhos se NÃO for forçado pelo timer
        if not forcar:
            indice = self.diabinho_eventos_disparados
            if indice >= len(self.diabinho_gatilhos) or total_tentativas < self.diabinho_gatilhos[indice]:
                return None

        pergunta = self.banco_palavras.sortear_pergunta_diabinho(categoria)
        self.diabinho_eventos_disparados += 1
        self.diabinho_eventos_restantes = max(0, self.diabinho_total_eventos - self.diabinho_eventos_disparados)
        self.pergunta_ativa = {
            'origem': 'diabinho',
            'pergunta': pergunta['pergunta'],
            'resposta': self._normalizar(pergunta['resposta']),
            'tipo': pergunta['tipo'],
            'dica': 'Responda com verdadeiro ou falso.',
        }
        return self._resposta(
            'O diabinho apareceu automaticamente com um desafio temático.',
            feedback='devil',
        )

    def responder_diabinho(self, resposta):
        if not self.pergunta_ativa or self.pergunta_ativa.get('origem') != 'diabinho':
            return self._resposta('Não há pergunta do diabinho ativa agora.', erros_extra=0)

        correta = self._normalizar(resposta) == self.pergunta_ativa['resposta']
        self.pergunta_ativa = None
        if correta:
            return self._resposta(
                'Você respondeu certo. O diabinho não conseguiu te prejudicar.',
                feedback='success',
                erros_extra=0,
            )
        return self._resposta('Resposta errada! O diabinho tirou 2 vidas.', feedback='devil', erros_extra=2)

    def obter_estado_publico(self):
        pergunta = None
        if self.pergunta_ativa:
            pergunta = {
                'origem': self.pergunta_ativa['origem'],
                'pergunta': self.pergunta_ativa['pergunta'],
                'tipo': self.pergunta_ativa['tipo'],
                'dica': self.pergunta_ativa.get('dica', ''),
                'alternativas': self.pergunta_ativa.get('alternativas', {}),
            }
        return {
            'letras_bloqueadas': sorted(self.letras_bloqueadas),
            'turnos_invertidos_restantes': self.turnos_invertidos_restantes,
            'modo_invertido': self.esta_invertido(),
            'anjinho_usado': self.anjinho_usado,
            'diabinho_total_eventos': self.diabinho_total_eventos,
            'diabinho_eventos_disparados': self.diabinho_eventos_disparados,
            'diabinho_eventos_restantes': self.diabinho_eventos_restantes,
            'diabinho_gatilhos': self.diabinho_gatilhos,
            'pergunta_ativa': pergunta,
        }
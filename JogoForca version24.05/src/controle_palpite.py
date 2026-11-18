from dataclasses import dataclass, field
import string
import unicodedata


@dataclass
class ControlePalpite:
    penalidade_inicial: int = 2
    tentativas_incorretas: int = 0
    historico: list[str] = field(default_factory=list)

    _SEPARADORES_IGNORADOS = {' ', '-', '_', "'"}

    def reiniciar(self):
        self.tentativas_incorretas = 0
        self.historico.clear()

    @staticmethod
    def _normalizar_base(texto):
        texto = unicodedata.normalize('NFD', (texto or '').strip().lower())
        return ''.join(ch for ch in texto if unicodedata.category(ch) != 'Mn')

    def normalizar_palpite(self, texto):
        base = self._normalizar_base(texto)
        if not base:
            return ''
        if any(ch not in string.ascii_lowercase and ch not in self._SEPARADORES_IGNORADOS for ch in base):
            return None
        return ''.join(ch for ch in base if ch not in self._SEPARADORES_IGNORADOS)

    def classificar_palpite(self, texto):
        palpite = self.normalizar_palpite(texto)
        if palpite is None:
            return 'invalido', ''
        if not palpite:
            return 'vazio', ''
        return ('letra' if len(palpite) == 1 else 'palavra'), palpite

    def proxima_penalidade(self):
        return self.penalidade_inicial + self.tentativas_incorretas

    def registrar_tentativa_palavra(self, palpite, palavra_secreta):
        palpite_normalizado = self.normalizar_palpite(palpite)
        palavra_normalizada = self.normalizar_palpite(palavra_secreta)
        if palpite_normalizado is None or palavra_normalizada is None or len(palpite_normalizado or '') <= 1:
            raise ValueError('Palpite completo inválido.')

        self.historico.append(palpite_normalizado)
        if palpite_normalizado == palavra_normalizada:
            return {
                'acertou': True,
                'palpite': palpite_normalizado,
                'penalidade': 0,
                'mensagem': 'Palpite completo correto!',
            }

        penalidade = self.proxima_penalidade()
        self.tentativas_incorretas += 1
        return {
            'acertou': False,
            'palpite': palpite_normalizado,
            'penalidade': penalidade,
            'mensagem': f'Palpite completo incorreto. Você perdeu {penalidade} vida(s).',
        }

    def obter_estado_publico(self):
        return {
            'chutes_palavra': [palpite.upper() for palpite in self.historico],
            'tentativas_palavra_incorretas': self.tentativas_incorretas,
            'proxima_penalidade_palavra': self.proxima_penalidade(),
        }

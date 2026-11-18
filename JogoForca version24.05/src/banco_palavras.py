import random
import json
from pathlib import Path



class BancoPalavras:
   
    def __init__(self):
        caminho = Path(__file__).parent.parent / 'banco.json'
        with open(caminho, encoding='utf-8') as f:
            dados = json.load(f)

        self.PALAVRAS = dados['palavras']
        self.PERGUNTAS_ANJINHO = dados['perguntas_anjinho']
        self.PERGUNTAS_DIABINHO = dados['perguntas_diabinho']
        

    def listar_categorias(self):
        return list(self.PALAVRAS)

    def obter_palavras_categoria(self, categoria):
        palavras = self.PALAVRAS.get(categoria.lower())
        if palavras is None:
            raise ValueError('Categoria inválida')
        return palavras

    def sortear_palavra(self, categoria):
        return random.choice(self.obter_palavras_categoria(categoria))

    def sortear_pergunta_anjinho(self):
        return random.choice(self.PERGUNTAS_ANJINHO).copy()

    def sortear_pergunta_diabinho(self, categoria):
        perguntas = self.PERGUNTAS_DIABINHO.get(categoria.lower())
        if perguntas is None:
            raise ValueError('Categoria inválida para pergunta do diabinho')
        return random.choice(perguntas).copy()
    
    def sortear_pergunta_anjinho(self, categoria):
        perguntas = self.PERGUNTAS_ANJINHO.get(categoria.lower())
        if perguntas is None:
            raise ValueError('Categoria inválida para pergunta do anjinho')
        return random.choice(perguntas).copy()
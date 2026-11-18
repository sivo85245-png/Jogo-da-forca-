import os
from flask import Blueprint, jsonify, render_template, request, session

from src.banco_palavras import BancoPalavras
from src.jogo_forca import JogoForca

rotas = Blueprint('rotas', __name__)
banco_palavras = BancoPalavras()


def obter_json():
    return request.get_json(silent=True) or {}


def resposta_erro(mensagem, status=400):
    return jsonify({'mensagem': mensagem}), status


def obter_jogo():
    return session.get('jogo')


def sem_partida():
    return None if obter_jogo() is not None else resposta_erro('Inicie uma partida primeiro.')


@rotas.route('/')
def index():
    return render_template(
        'index.html',
        api_url='',
        tempo_diabinho=int(os.getenv('TEMPO_DIABINHO', '45000')),
        duracao_transicao=int(os.getenv('DURACAO_TRANSICAO', '350')),
    )


@rotas.route('/categorias')
def categorias():
    return jsonify(banco_palavras.listar_categorias())


@rotas.route('/iniciar', methods=['POST'])
def iniciar():
    categoria = obter_json().get('categoria')
    if not categoria:
        return resposta_erro('Categoria não informada.')
    jogo = JogoForca(categoria)
    session['jogo'] = jogo
    return jsonify(jogo.obter_estado_completo())


@rotas.route('/tentar', methods=['POST'])
def tentar():
    if erro := sem_partida():
        return erro
    jogo = obter_jogo()
    resultado = jogo.tentar_palpite(obter_json().get('palpite', ''))
    session['jogo'] = jogo
    return jsonify(resultado)


@rotas.route('/acionar-anjinho', methods=['POST'])
def acionar_anjinho():
    if erro := sem_partida():
        return erro
    jogo = obter_jogo()
    resultado = jogo.acionar_anjinho()
    session['jogo'] = jogo
    return jsonify(resultado)


@rotas.route('/acionar-diabinho-timer', methods=['POST'])
def acionar_diabinho_timer():
    if erro := sem_partida():
        return erro
    jogo = obter_jogo()
    resultado = jogo.acionar_diabinho_timer()
    session['jogo'] = jogo
    return jsonify(resultado)


@rotas.route('/responder-anjinho', methods=['POST'])
def responder_anjinho():
    if erro := sem_partida():
        return erro
    jogo = obter_jogo()
    resultado = jogo.responder_anjinho(obter_json().get('resposta', ''))
    session['jogo'] = jogo
    return jsonify(resultado)


@rotas.route('/responder-diabinho', methods=['POST'])
def responder_diabinho():
    if erro := sem_partida():
        return erro
    jogo = obter_jogo()
    resultado = jogo.responder_diabinho(obter_json().get('resposta', ''))
    session['jogo'] = jogo
    return jsonify(resultado)


@rotas.route('/estado')
def estado():
    if erro := sem_partida():
        return erro
    jogo = obter_jogo()
    return jsonify(jogo.obter_estado_completo())


@rotas.route('/reiniciar', methods=['POST'])
def reiniciar():
    if erro := sem_partida():
        return erro
    jogo = obter_jogo()
    categoria = obter_json().get('categoria') or jogo.categoria
    resultado = jogo.reiniciar_jogo(categoria)
    session['jogo'] = jogo
    return jsonify(resultado)
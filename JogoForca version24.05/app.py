import os
from flask import Flask
from flask_cors import CORS
from flask_session import Session
from dotenv import load_dotenv

from src.rotas import rotas

# Carrega as variáveis do arquivo .env
load_dotenv()

app = Flask(__name__)
CORS(app)

app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'forca-aps-2025')
app.config['SESSION_TYPE'] = os.getenv('SESSION_TYPE', 'filesystem')
Session(app)

app.register_blueprint(rotas)

if __name__ == '__main__':
    app.run(debug=True)
    
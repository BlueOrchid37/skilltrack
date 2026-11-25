import os
from flask_cors import CORS
from flask import Flask, jsonify, request, send_from_directory
from flask_sqlalchemy import SQLAlchemy

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FRONTEND_BUILD = os.path.abspath(
    os.path.join(BASE_DIR, "../frontend/build")
)

app = Flask(
    __name__,
    static_folder=FRONTEND_BUILD,
    static_url_path=""
)

CORS(app)

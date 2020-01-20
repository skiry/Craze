from flask import Flask
from flask_cors import CORS
from app.config import Config
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt import JWT
import datetime

app = Flask(__name__)
app.config.from_object(Config)
app.config['JWT_EXPIRATION_DELTA'] = datetime.timedelta(hours=8)

db = SQLAlchemy(app)
migrate = Migrate(app, db)
CORS(app)

from app import routes, models  # nopep8

db.create_all()
def authenticate(email, password):
    user = models.User.query.filter_by(email=email).first()
    if user is not None and user.verify_password(password):
        return user


def identity(payload):
    return models.User.query.get(payload['identity'])


jwt = JWT(app, authenticate, identity)

if __name__ == '__main__':
    app.run(debug=True)

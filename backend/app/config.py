import os
from secrets import Secrets
basedir = os.path.abspath(os.path.dirname(__file__))


class Config(object):
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or \
        'sqlite:///' + os.path.join(basedir, 'app.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    USERS_ENDPOINT = '/users'
    AUTH_ENDPOINT = '/auth'
    LOCATION_ENDPOINT = '/locations'
    SECRET_KEY = Secrets.SECRET_KEY

    JWT_AUTH_USERNAME_KEY = 'email'
    JWT_AUTH_PASSWORD_KEY = 'password'

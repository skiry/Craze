from itsdangerous import Serializer

from app import db
from passlib.hash import pbkdf2_sha256


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), nullable=False,
                         index=True, unique=True)
    email = db.Column(db.String(128), nullable=False, index=True, unique=True)
    password_hash = db.Column(db.String(128), nullable=False)

    def hash_password(self, password):
        self.password_hash = pbkdf2_sha256.hash(password)

    def verify_password(self, password):
        return pbkdf2_sha256.verify(password, self.password_hash)

    def __repr__(self):
        return '<User %s>' % self.email


class Location(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    description = db.Column(db.String(255), nullable=False)
    lat = db.Column(db.Float, nullable=False)
    lng = db.Column(db.Float, nullable=False)
    tag = db.Column(db.String(64), nullable=False)
    is_positive = db.Column(db.Boolean, nullable=False)
    user_id = db.Column(db.Integer, nullable=False)

    def __init__(self, description, lat, lng, tag, is_positive, user_id):
        self.description = description
        self.lat = lat
        self.lng = lng
        self.tag = tag
        self.is_positive = is_positive
        self.user_id = user_id

    def to_json(self):
        json = self.__dict__
        del json['_sa_instance_state']
        return json

    def __str__(self) -> str:
        return "Location: " + "Description: " + self.description + "Latitude: " + str(self.lat) + " " + "Longitude: " \
               + str(self.lng) + " " + "Tag: " + str(self.tag) + " " + "Is Positive: " + str(self.is_positive) + " " \
               + "User ID: " + str(self.userId)

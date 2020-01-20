from app import app, db
from app.models import User
from app.models import Location
from json import dumps

from app.config import Config
from flask import request, jsonify, Response
from flask_jwt import jwt_required, current_identity
import logging

logging.basicConfig(level=logging.DEBUG)


def get_from_json(json, key):
    return json.get(key) if key in json else ''


def check_input(json, description, lat, lng, tag, is_positive):
    errors = ''

    app.logger.info(json)
    app.logger.info(description)
    app.logger.info(lat)
    app.logger.info(lng)
    app.logger.info(tag)
    app.logger.info(is_positive)

    if len(description) <= 1:
        errors += 'Description should have at least 2 characters.\n'

    if float(lng) < -90 or float(lng) > 90:
        errors += 'The longitude must be between -90 and 90 .\n'

    if float(lat) < -90 or float(lat) > 90:
        errors += 'The latitude must be between -90 and 90 .\n'

    return errors


@app.route(Config.LOCATION_ENDPOINT, methods=['GET', 'POST'])
@jwt_required()
def location_endpoint():
    if request.method == 'GET' and request.args.get('tag') is not None:
        tag_parameter = request.args.get('tag')

        query_locations = Location.query.filter(Location.tag.contains(tag_parameter)).all()
        result_json = [location.to_json() for location in query_locations]

        return dumps(result_json)

    elif request.method == 'GET':
        query_locations = Location.query.all()
        result_json = [location.to_json() for location in query_locations]

        return dumps(result_json)

    elif request.method == 'POST':
        json = request.json
        description = get_from_json(json, 'description')
        lat = get_from_json(json, 'lat')
        lng = get_from_json(json, 'lng')
        tag = get_from_json(json, 'tag')
        is_positive = get_from_json(json, 'isPositiveOpinion')

        errors = check_input(json, description, lat, lng, tag, is_positive)

        if len(errors):
            app.logger.info(errors)
            return jsonify({'errors': errors}), 400

        try:
            user_id = current_identity.id
            new_location = Location(description=description, lat=lat, lng=lng, tag=tag,
                                    is_positive=is_positive, user_id=user_id)
            db.session.add(new_location)
            db.session.commit()
            return jsonify({'success': "Location has been ADDED successfully"}), 200
        except Exception as exc:
            app.logger.info(str(exc))
            return jsonify({'errors': str(exc)}), 400


@app.route(Config.LOCATION_ENDPOINT + "/<location_id>", methods=['PUT'])
@jwt_required()
def update_location(location_id):
    json = request.json
    description = get_from_json(json, 'description')
    lat = get_from_json(json, 'lat')
    lng = get_from_json(json, 'lng')
    tag = get_from_json(json, 'tag')
    is_positive = get_from_json(json, 'isPositiveOpinion')

    errors = check_input(json, description, lat, lng, tag, is_positive)

    if len(errors):
        app.logger.info(errors)
        return jsonify({'errors': errors}), 400

    try:
        query_locations = db.session.query(Location).filter(Location.id == location_id).first()
        if query_locations is not None:
            db.session.query(Location). \
                filter(Location.id == location_id). \
                update({"description": description, "lat": lat, "lng": lng, "tag": tag, "is_positive": is_positive})
            db.session.commit()
            return jsonify({'success': "Location has been UPDATED successfully"}), 200
        else:
            return jsonify({'errors': "The location having this ID does not exist!"}), 400
    except Exception as exc:
        app.logger.info(str(exc))
        return jsonify({'errors': str(exc)}), 400


@app.route(Config.LOCATION_ENDPOINT + "/<location_id>", methods=['DELETE'])
@jwt_required()
def delete_location(location_id):
    location_to_be_deleted = db.session.query(Location).filter(Location.id == location_id).first()
    if location_to_be_deleted is not None:
        db.session.query(Location).filter(Location.id == location_id). \
            delete(synchronize_session=False)
        db.session.commit()
        return jsonify({'success': "Location has been DELETED successfully"}), 200
    else:
        return jsonify({'errors': "The location having this ID does not exist!"}), 400


# User registration
@app.route(Config.USERS_ENDPOINT, methods=['POST'])
def create_user():
    errors = ''
    json = request.json
    username = get_from_json(json, 'username')
    email = get_from_json(json, 'email')
    password = get_from_json(json, 'password')
    password_confirmation = get_from_json(json, 'password_confirmation')

    # Handle everything that is not feasible in ORM
    if len(username) <= 4:
        errors += 'Username should have more than 4 characters.\n'
    if User.query.filter_by(username=username).first() is not None:
        errors += 'There is already a user with this username.\n'
    if len(email) <= 2:
        errors += 'Email should have more than 2 characters.\n'
    if email.count('@') != 1:
        errors += 'Email is not valid.\n'
    if email[-1] == '@':
        errors += 'Email can not end in the @ symbol.\n'
    if User.query.filter_by(email=email).first() is not None:
        errors += 'There is already a user with this email.\n'
    if len(password) <= 7:
        errors += 'Password should have more than 7 characters.\n'
    if len(password_confirmation) <= 7:
        errors += 'Password confirmation should have more than 7 characters.\n'
    if password != password_confirmation:
        errors += 'Password and password confirmation are not equal.\n'
    if len(errors):
        return jsonify({'errors': errors}), 400

    try:
        user = User(username=username, email=email)
        user.hash_password(password)
        db.session.add(user)
        db.session.commit()
        return Response(status=200)
    except Exception as exc:
        return jsonify({'errors': str(exc)}), 400

# User id getter
@app.route('/myid', methods=['GET'])
@jwt_required()
def get_user_id():
    try:
        return jsonify({'id': current_identity.id}), 200
    except Exception as exc:
        return jsonify({'errors': str(exc)}), 400

# Protected route test
@app.route('/protected', methods=['POST'])
@jwt_required()
def protected():
    return '%s' % current_identity

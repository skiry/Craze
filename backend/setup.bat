SET FLASK_APP=app.py

pip3 install flask || pip install flask
pip3 install flask-cors || pip install flask-cors
pip3 install flask-sqlalchemy || pip install flask-sqlalchemy
pip3 install flask-migrate || pip install flask-migrate
pip3 install passlib || pip install passlib
pip3 install Flask-JWT || pip install Flask-JWT
pip3 install pep8 || pip install pep8

# Init database
flask db init

# Run migrations
flask db upgrade
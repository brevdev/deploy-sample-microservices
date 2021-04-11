from contextlib import closing
from datetime import datetime
from flask import Flask, request, jsonify
from werkzeug.exceptions import HTTPException, NotFound

import aws_lambda_wsgi
import brev

app = Flask(__name__)
db = brev.db("foo")


# Entrypoint
def handler(request, context):

    # execute database upgrades
    init_db()

    # route requests
    return aws_lambda_wsgi.response(app, request, context)


@app.route('/users', methods=['GET', 'POST'])
def users():

    if request.method == 'POST':
        payload = request.get_json()
        user = put_user(payload)
        return jsonify(user), 201

    else:
        users = get_users()
        return jsonify(users), 200


@app.route('/users/<user_id>', methods=['GET', 'DELETE'])
def user(user_id):
    user = get_user(user_id)
    if not user:
        raise NotFound()

    if request.method == 'DELETE':
        delete_user(user_id)
        return jsonify(user), 202

    else:
        return jsonify(user), 200


@app.errorhandler(Exception)
def errors(e):
    code = 500
    if isinstance(e, HTTPException):
        code = e.code
    return jsonify(error=str(e)), code


def init_db():
    users_table = (
        "CREATE TABLE IF NOT EXISTS `users` ("
        "  `id` int(11) NOT NULL AUTO_INCREMENT,"
        "  `first_name` varchar(14) NOT NULL,"
        "  `last_name` varchar(14) NOT NULL,"
        "  PRIMARY KEY (`id`)"
        ") ENGINE=InnoDB"
    )
    with closing(db.cursor()) as c:
        c.execute(users_table)

def get_users():
    statement = (
        "SELECT id, first_name, last_name FROM users"
    )

    results = {}
    with closing(db.cursor()) as c:
        c.execute(statement)
        for (user_id, first_name, last_name) in c:
            results[user_id] = {
                "id": user_id,
                "first_name": first_name,
                "last_name": last_name,
            }
    return list(results.values())


def put_user(user):
    statement = (
        "INSERT INTO users "
        "(first_name, last_name) "
        "VALUES (%(first_name)s, %(last_name)s)"
    )
    data = {
        "first_name": user["first_name"],
        "last_name": user["last_name"],
    }

    result_id = 0
    with closing(db.cursor()) as c:
        c.execute(statement, data)
        # db.commit()
        result_id = c.lastrowid

    return {
        "id": result_id,
        "first_name": user["first_name"],
        "last_name": user["last_name"],
    }


def get_user(user_id):
    statement = (
        "SELECT id, first_name, last_name FROM users "
        "WHERE id = %(id)s"
    )
    data = {
        "id": user_id,
    }

    results = {}
    with closing(db.cursor()) as c:
        c.execute(statement, data)
        for (user_id, first_name, last_name) in c:
            results[user_id] = {
                "id": user_id,
                "first_name": first_name,
                "last_name": last_name,
            }
    if len(results) != 1:
        return None
    else:
        return results[user_id]

def delete_user(user_id):
    statement = (
        "DELETE FROM users "
        "WHERE id = %(id)s"
    )
    data = {
        "id": user_id,
    }
    with closing(db.cursor()) as c:
        c.execute(statement, data)
        db.commit()

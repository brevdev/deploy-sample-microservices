from datetime import datetime

import brev
import json

foo_db = brev.db("foo")

def handler(request):
    init_db()

    print(request)

    path = request["requestContext"]["http"]["path"]
    method = request["requestContext"]["http"]["method"]

    if path == "/users":
        if method == "GET":
            data = get_users()
            results = []
            for k, v in data:
                results.append(v)
            return {
                "statusCode": 200,
                "body": results,
            }
        if method == "POST":
            payload = request["body"]
            results = put_user(json.loads(payload))
            return {
                "statusCode": 201,
                "body": results,
            }
    else:
        return {
            "statusCode": 404,
            "body": "Not found",
        }

    # with foo_db.cursor() as cursor:
    #     cursor.execute(query)
    #     for l in cursor:
    #         print(l)
    # brev.db_query("foo", "SHOW TABLES;")
    # brev.db_query("foo", "SELECT COUNT(1);")
    # now = datetime.now()
    # current_time = now.strftime("%H:%M:%S")
    # return {
    #     "message": "main.a - " + current_time,
    #     "request": request,
    # }


def init_db():
    users_table = (
        "CREATE TABLE IF NOT EXISTS `users` ("
        "  `id` int(11) NOT NULL AUTO_INCREMENT,"
        "  `first_name` varchar(14) NOT NULL,"
        "  `last_name` varchar(14) NOT NULL,"
        "  PRIMARY KEY (`id`)"
        ") ENGINE=InnoDB"
    )
    with foo_db.cursor() as c:
        c.execute(users_table)


def get_users():
    statement = (
        "SELECT id, first_name, last_name FROM users"
    )

    results = {}
    with foo_db.cursor() as c:
        c.execute(statement)
        for (user_id, first_name, last_name) in c:
            results[user_id] = {
                "id": user_id,
                "first_name": first_name,
                "last_name": last_name,
            }
    return results

def put_user(user):
    statement = (
        "INSERT INTO users "
        "(first_name, last_name) "
        "VALUES (%(first_name)s, %(last_name)s)"
    )
    data = {
        "first_name": user[first_name],
        "last_name": user[last_name],
    }

    result_id = 0
    with foo_db.cursor() as c:
        c.execute(statement, data)
        result_id = c.lastrowid
    foo_db.commit()

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
    with foo_db.cursor() as c:
        c.execute(statement, data)
        for (user_id, first_name, last_name) in c:
            results[user_id] = {
                "id": user_id,
                "first_name": first_name,
                "last_name": last_name,
            }
    return results

def delete_user(user_id):
    statement = (
        "DELETE FROM users "
        "WHERE id = %(id)s"
    )
    data = {
        "id": user_id,
    }
    with foo_db.cursor() as c:
        c.execute(statement, data)
    foo_db.commit()

const brev = require('brev');
const serverless = require('serverless-http');
const express = require('express');

const app = express();
//const db = brev.db("foo");

app.use(express.json());
app.use(errorHandler());

app.get('/users', (req, res) => {
  let users = getUsers();
  return res.status(200).send(users);
});

app.post('/users', (req, res) => {
  let payload = req.body;
  let user = putUser(payload);
  return res.status(201).send(user);
});

app.get('/users/:userId', (req, res) => {
  let user = getUser(req.params.userId);
  return res.status(200).send(user);
});

app.delete('/users/:userId', (req, res) => {
  let user = deleteUser(req.params.userId);
  return res.status(202).send(user);
});

function errorHandler(err, req, res, next) {
  if (err instanceof HttpError) {
    res.status(err.statusCode);
    res.render('error', { error: err.message });
  }
  else {
    res.status(500);
    res.render('error', { error: err });
  }
  return;
}

const handler = serverless(app);
module.exports.handler = async (request, context) => {
  initDb();

  const result = await handler(request, context);
  return result;
};

function initDb() {
  let usersTable =
    "CREATE TABLE IF NOT EXISTS `users` (" +
    "  `id` int(11) NOT NULL AUTO_INCREMENT," +
    "  `first_name` varchar(14) NOT NULL," +
    "  `last_name` varchar(14) NOT NULL," +
    "  PRIMARY KEY (`id`)" +
    ") ENGINE=InnoDB";

  db.query(
    usersTable,
    function (error, results, fields) {
      if (error) {
        throw error;
      }
    });
}

function getUsers() {
  let users = [];

  db.query(
    "SELECT id, first_name, last_name FROM users;",
    function (error, results, fields) {
      if (error) {
        throw error;
      }
      results.forEach(result => {
        users.push({
          "id": result["id"],
          "first_name": result["first_name"],
          "last_name": result["last_name"],
        });
      });
    });

  return users;
}

function putUser(user) {
  let user_id = 0;

  db.query(
    "INSERT INTO users SET ?;",
    user,
    function (error, results, fields) {
      if (error) {
        throw error;
      }
      user_id = results.insertId;
    });

  return {
    "id": user_id,
    "first_name": user["first_name"],
    "last_name": user["last_name"],
  };
}

function getUser(userId) {
  let users = [];

  let statement =
    "SELECT id, first_name, last_name FROM users " +
    "WHERE id = ?";

  db.query(
    statement,
    [userId],
    function (error, results, fields) {
      if (error) {
        throw error;
      }
      results.forEach(result => {
        users.push({
          "id": result["id"],
          "first_name": result["first_name"],
          "last_name": result["last_name"],
        });
      });
    });

  if (users.length === 0) {
    throw new HttpError(404, "Not found");
  }
  return users[0];
}

function deleteUser(userId) {
  let statement =
    "DELETE FROM users " +
    "WHERE id = ?";

  db.query(
    statement,
    [userId],
    function (error, results, fields) {
      if (error) {
        throw error;
      }
    });
}


class HttpError extends Error {
  constructor(statusCode, message, ...params) {
    super(...params);
    this.statusCode = statusCode;
    this.message = message;
  }
}

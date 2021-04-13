const brev = require('brev');
const serverless = require('serverless-http');
const express = require('express');

class HttpError extends Error {
  constructor(statusCode, message, ...params) {
    super(...params);
    this.statusCode = statusCode;
    this.message = message;
  }
}

const app = express();

app.use(express.json());

app.get('/users', (req, res) => {
  return getUsers()
    .then((users) => {
      return res.status(200).send(users);
    })
    .catch((err) => {
      console.log(err);
      if (err instanceof HttpError) {
        return res.status(err.statusCode).json(err.message);
      }
      else {
        return res.status(500).json(err);
      }
    });
});

app.post('/users', (req, res) => {
  return putUser(req.body)
    .then((user) => {
      return res.status(201).send(user);
    })
    .catch((err) => {
      console.log(err);
      if (err instanceof HttpError) {
        return res.status(err.statusCode).json(err.message);
      }
      else {
        return res.status(500).json(err);
      }
    });
});

app.get('/users/:userId', (req, res) => {
  return getUser(req.params.userId)
    .then((user) => {
      return res.status(200).send(user);
    })
    .catch((err) => {
      console.log(err);
      if (err instanceof HttpError) {
        return res.status(err.statusCode).json(err.message);
      }
      else {
        return res.status(500).json(err);
      }
    });
});

app.delete('/users/:userId', (req, res) => {
  return deleteUser(req.params.userId)
    .then((user) => {
      return res.status(202).send(user);
    })
    .catch((err) => {
      console.log(err);
      if (err instanceof HttpError) {
        return res.status(err.statusCode).json(err.message);
      }
      else {
        return res.status(500).json(err);
      }
    });
});

const handler = serverless(app);
module.exports.handler = async (request, context) => {
  await initDb();

  const result = await handler(request, context);
  return result;
};

async function initDb() {
  let usersTable =
    "CREATE TABLE IF NOT EXISTS `users` (" +
    "  `id` int(11) NOT NULL AUTO_INCREMENT," +
    "  `first_name` varchar(14) NOT NULL," +
    "  `last_name` varchar(14) NOT NULL," +
    "  PRIMARY KEY (`id`)" +
    ") ENGINE=InnoDB";

  return brev.db("foo")
    .then((connection) => {
      return new Promise((resolve, reject) => {
        connection.query(usersTable, (error, results, fields) => {
          if (error) {
            return reject(error);
          }
          else {
            return resolve();
          }
        });
      });
    });
}

async function getUsers() {
  return brev.db("foo").then(connection => {

    return new Promise((resolve, reject) => {

      connection.query("SELECT id, first_name, last_name FROM users;", (error, results, fields) => {
        if (error) {
          return reject(error);
        }
        let users = [];
        results.forEach(result => {
          users.push({
            "id": result["id"],
            "first_name": result["first_name"],
            "last_name": result["last_name"],
          });
        });
        return resolve(users);
      });


    });

  });
}

async function putUser(user) {
  return brev.db("foo").then(connection => {

    return new Promise((resolve, reject) => {

      connection.query("INSERT INTO users SET ?;", user, (error, results, fields) => {
        if (error) {
          return reject(error);
        }
        return resolve({
          "id": results.insertId,
          "first_name": user["first_name"],
          "last_name": user["last_name"],
        });

      });

    });

  });
}

async function getUser(userId) {
  return brev.db("foo").then(connection => {

    return new Promise((resolve, reject) => {

      connection.query(
        "SELECT id, first_name, last_name FROM users WHERE id = ?", [userId], (error, results, fields) => {
          if (error) {
            return reject(error);
          }

          let users = [];
          results.forEach(result => {
            users.push({
              "id": result["id"],
              "first_name": result["first_name"],
              "last_name": result["last_name"],
            });
          });

          if (users.length === 0) {
            return reject(new HttpError(404, "Not found"));
          }
          else {
            return resolve(users[0]);
          }
        });
    });
  });

}

async function deleteUser(userId) {
  return brev.db("foo").then(connection => {

    return new Promise((resolve, reject) => {
      connection.query(
        "DELETE FROM users WHERE id = ?", [userId], (error, results, fields) => {
          if (error) {
            return reject(error);
          }
          else {
            return resolve();
          }
        });
    });
  });
}

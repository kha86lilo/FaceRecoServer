const express = require("express");
const bodyparser = require("body-parser");
const bcrypt = require("bcrypt-nodejs");
const cors = require("cors");
const knex = require("knex");

const db = knex({
  client: "pg",
  connection: {
    host: "127.0.0.1",
    user: "postgres",
    password: "test",
    database: "SmartBrain"
  }
});
const database = [
  {
    id: "1",
    name: "khalil",
    email: "kha86lilo@gmail.com",
    password: "test1234",
    entries: 0,
    joined: new Date()
  },
  {
    id: "2",
    name: "khalil2",
    email: "kha86lilo2@gmail.com",
    password: "test1234",
    entries: 0,
    joined: new Date()
  }
];

const server = express();
server.use(bodyparser.json());
server.use(cors());
server.listen(process.env.PORT || 3000, () => {
  console.log("App is running on port 3000");
});

server.get("/", (req, res) => {
  res.json(database);
});

server.get("/profile/:id", (req, res) => {
  const { id } = req.params;
  db.select("*")
    .from("users")
    .where({ id })
    .then(users => {
      if (users.length === 0) {
        res.status(400).json("Not Found");
      } else {
        res.json(users[0]);
      }
    })
    .catch(err => res.status(400).json("Error Reading Data"));
});

server.put("/image", (req, res) => {
  db("users")
    .where("id", "=", req.body.id)
    .increment("entries", 1)
    .returning("entries")
    .then(entries => {
      res.json(entries[0]);
    })
    .catch(err => {
      console.log(err);
      res.status(404).json("unable to get entries");
    });
});
server.post("/signin", (req, res) => {
  const { email, password } = req.body;
  db("logins")
    .select("*")
    .where("email", "=", email)
    .then(data => {
      console.log(data);
      const isValid = bcrypt.compareSync(password, data[0].hash);
      if (isValid) {
        db.select("*")
          .from("users")
          .where("email", "=", email)
          .then(data => {
            res.json(data[0]);
          })
          .catch(err => res.status(400).json("error while getting the user"));
      } else {
        res.status(400).json("invalid user name or password");
      }
    })
    .catch(err => {
      res.status("400").json("error while siging in");
      console.log(err);
    });
});
server.post("/register", (req, res) => {
  const { name, email, password } = req.body;
  let hashedPassword;
  bcrypt.hash(password, null, null, (error, hash) => {
    hashedPassword = hash;
  });
  db.transaction(trx => {
    trx
      .insert({
        hash: hashedPassword,
        email: email
      })
      .into("logins")
      .returning("email")
      .then(email => {
        db("users")
          .returning("*")
          .insert({
            name: name,
            email: email[0],
            joineddate: new Date()
          })
          .then(user => res.json(user[0]));
      })
      .then(trx.commit)
      .catch(trx.rollback);
  }).catch(err => {
    console.log(err);
    res.status(400).json("unable to register");
  });
});

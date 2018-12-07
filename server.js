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
 
const server = express();
server.use(bodyparser.json());
server.use(cors());
server.listen(process.env.PORT || 3000, () => {
  console.log("App is running on port 3000");
});

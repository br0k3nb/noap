const express = require("express");
const server = express();
const cors = require("cors");
const mysql = require("mysql2");
const bcryptjs = require("bcryptjs");
const jwt = require('jsonwebtoken');
const verifyOrigin = require("./middlewares.js");
require("dotenv/config");

server.use(express.json());
server.use(express.urlencoded({ extended: true }));
server.use(cors());

const db = mysql.createPool({
  host: `${process.env.MYSQL_HOST}`,
  user: `${process.env.MYSQL_USER}`,
  password: `${process.env.MYSQL_PASSWORD}`,
  database: `${process.env.MYSQL_DATABASE}`,
});

server.post("/sign-up", async (req, res) => {
  const {name, login, password} = req.body;
1
  const encryptedPassword = await bcryptjs.hash(password, 6); 

  db.query(
    "SELECT * FROM users WHERE userLogin = ?",
    [login],
    (err, result) => {
      if (err) res.status(500).json({message: 'Internal error, please try again later...'});
      else {
        result.length === 1
          ? res.status(400).json({message: 'User already exist, please sign in!'})
          : db.query(
              "INSERT INTO users (userName, userLogin, userPassword) VALUES (?,?,?)",
              [name, login, encryptedPassword],
              (err, result) => {
                if (err) res.status(500).json({message: 'Internal error, please try again later...'})
                else res.status(200).json({message: 'Registration completed!'});
              }
            );
      }
    }
  );
});

server.post("/sign-in", async (req, res) => {
  const {login, password} = req.body;

  db.query(
    "SELECT * FROM users WHERE userLogin = ?",
    [login],
    async (err, result) => {
      if (result !== null && result.length > 0) {
        const compareEncryptedP = await bcryptjs.compare(
          password,
          result[0].userPassword
        );

        const payload = {
          iss: "login-form",
          sub: {userID: result[0].id, userName: result[0].userName},
          exp: Math.floor(Date.now() / 1000 + 21600),
        };

        if (compareEncryptedP) {
           const token = jwt.sign(
            payload, 
            process.env.SECRET, 
            {algorithm: 'HS256'}
          );

          res.status(200).json({token: token, userName: result[0].userName, userID: result[0].id});
        } 
        else res.status(400).json({message: "Invalid password or email combination!"});
      }
      else res.status(400).json({message: "Invalid password or email combination!"});

      if(err) res.status(500).json({message: 'Internal error, please try again later...'});
    }
  );
});

server.post("/activities", verifyOrigin, (req, res) => {
  const {userID, userToken} = req.body;

  db.query(
    "SELECT * FROM activities WHERE userID = ? ORDER BY priority, id DESC",
    userID,
    (err, result) => {
      if (result) res.status(200).json(result);
      else res.status(400).json({message: err});
    }
  );
});

server.post("/new-ac", verifyOrigin, async (req, res) => {
  const {title, body, priority, userID, userToken} = req.body;

  const currentdate = new Date();

  const  datetime =
    currentdate.getDate() +
    "/" +
    (currentdate.getMonth() + 1) +
    "/" +
    currentdate.getFullYear() +
    " " +
    currentdate.getHours() +
    ":" +
    currentdate.getUTCMinutes();

  db.query(
    "INSERT INTO activities (title, body, priority, finalHD, userID) VALUES (?,?,?,?,?)",
    [title, body, priority, datetime, userID],
    (err, result) => {
      console.log(err);
      if (err) res.status(400).json({message: `ERORR, ${err}`});
      if (result) res.status(200).json({message: 'Saved successfuly'})
    }
  );
});

server.put("/up-ac", verifyOrigin, (req, res) => {
  const {id, title, body, priority, userToken} = req.body;

  const currentdate = new Date();

  const datetime =
    currentdate.getDate() +
    "/" +
    (currentdate.getMonth() + 1) +
    "/" +
    currentdate.getFullYear() +
    " " +
    currentdate.getHours() +
    ":" +
    currentdate.getUTCMinutes();

  console.log(id, title, body, priority);
  db.query(
    "UPDATE activities SET title = ?, body = ?, priority = ?, finalHD = ? WHERE id = ?",
    [title, body, priority, datetime, id],
    (err, result) => {
      if (err) res.status(400).json({message: `ERROR, ${err}`});
      else res.status(200).json({message: 'Node updated!'});
    }
  );
});

server.delete("/de-ac/:id", (req, res) => {
  const {id} = req.params;

  db.query("DELETE FROM activities WHERE id = ?", id, (err, result) => {
    if (err) {
      console.log(err);
      res.status(400).json({message: `ERROR, ${err}`}) 
    }
    else res.status(200).json({message: 'Note deleted!'});
  });
});

server.post("/verify-user", verifyOrigin, (req, res) => {
  try {
    const {userToken} = req.body;
    res.status(200).json({message: 'Token found'});
  } catch (err) {
    res.status(400).json({message: `Access denied! ${err}`})
  }
});

server.listen(3001, () => console.log("The server has started on port 3001!"));
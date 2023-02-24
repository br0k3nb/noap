require("dotenv/config");
const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const authToken = req.body.userToken;

  console.log(authToken);

  if(authToken === null) return res.status(400).json({message: "Access denied, sign in again!"});

  jwt.verify(authToken, process.env.SECRET, (err, decoded) => {
    if (err) return res.status(400).json({ message: "Access denied, sign in again!" });

    req.userData = decoded;

    return next();
  });
};
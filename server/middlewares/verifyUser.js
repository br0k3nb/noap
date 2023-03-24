import jwt from "jsonwebtoken";
import 'dotenv/config';

export default (req, res, next) => {
  
  const authToken = req.params.token;

  // if(!authToken) return res.status(400).json({message: "Access denied, sign in again!"});

  jwt.verify(authToken, `${process.env.SECRET}`, err => {
    if (err) return res.status(400).json({ message: "Access denied, sign in again!" });
     return next();
  });
};
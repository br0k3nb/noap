import jwt from "jsonwebtoken";
import 'dotenv/config';

export default (req, res, next) => {
  const authorization = req.headers.authorization;

  if (!authorization) return res.status(401).json({ message: "Authentication token wasn't found" });

  const parts = authorization.split(' ');

  if (!parts.length === 2) return res.status(401).json({ message: "Authentication error" });

  const [scheme, data] = parts;

  if (!/^Bearer$/i.test(scheme)) return res.status(401).json({ message: "Invalid token" });

  const { token } = JSON.parse(data);

  jwt.verify(token, `${process.env.SECRET}`, (err, decoded) => {
    if (err) return res.status(401).send({ message: "Access denied, sign in again" });
    
    return next();
  });
};
import jwt from "jsonwebtoken";
import {Response, Request, NextFunction} from 'express';
import 'dotenv/config';

export default (req: Request, res: Response, next: NextFunction) => {
  
  const authToken = req.params.token;

  if(!authToken) return res.status(400).json({message: "Access denied, sign in again!"});

  jwt.verify(authToken, `${process.env.SECRET}`, err => {
    if (err) return res.status(400).json({ message: "Access denied, sign in again!" });
    else return next();
  });
};
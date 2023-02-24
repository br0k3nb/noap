import jwt from "jsonwebtoken";
import {Response, Request, NextFunction} from 'express'

export default (req: Request, res: Response, next: NextFunction) => {
  
  const authToken = req.params.token;

  if(!authToken) return res.status(400).json({message: "Access denied, sign in again!"});

  jwt.verify(authToken, 'ZjkyNzZjMzllMjViN2YzNmFmYjc5MmMwNzYyY2E5ZmU0Yjc2ZmM0NmQ4NTc0Y2FkMWZjZTc0OWU4YWNkNzAzYg==',(err:unknown, decoded:unknown) => {
    if (err){
      return res.status(400).json({ message: "Access denied, sign in again!" });
    } 

    return next();
  });
};
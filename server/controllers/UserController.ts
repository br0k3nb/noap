import {Response, Request} from 'express'
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import 'dotenv/config';

export default {
    async login(req: Request , res: Response) {
        try {
           const {login, password} = req.body;

           const getUser = await User.find({email: login});

           if(getUser.length === 0) return res.status(400).json({message: 'Wrong email or password combination!'});

           const passwordDB = getUser[0].password;

           const comparePasswords = await bcrypt.compare(
                password,
                passwordDB
            );

            if(comparePasswords) {
                const payload = {
                    iss: "login-form",
                    sub: {_id: getUser[0]?._id, name: getUser[0]?.name},
                    exp: Math.floor(Date.now() / 1000 + 2000),
                };

                const token = jwt.sign(
                    payload, 
                    `${process.env.SECRET}`, 
                    {algorithm: 'HS256'}
                );

                res.status(200).json({message: 'Success', token, _id: getUser[0]?._id, name: getUser[0]?.name});
            }
            else res.status(404).json({message: 'Wrong email or password combination!'});

        } catch (err) {
            console.log(err);
            res.status(400).json(err);
        }
    },
    async add(req: Request, res: Response) {
        try {
            const {name, login, password} = req.body;

            const userExists = await User.find({email: login});

            if(userExists.length > 0) return res.status(400).json({message: 'User already exists, please sign in!'});

            const hashedPassword = await bcrypt.hash(password, 6);

            await User.create({
                email: login,
                password: hashedPassword,
                name
            });

            res.status(200).json({message: 'User created successfully!'});
            
        } catch (err) {
            console.log(err);
            res.status(400).json({message: err});
        }
    }
}
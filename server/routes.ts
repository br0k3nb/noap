import express from 'express'
import mongoose from 'mongoose';
import UserController from './controllers/UserController';
import ActivityController from './controllers/ActivityController';
import {Response, Request, NextFunction} from 'express'

import verifyUser from './middlewares/verifyUser';

const router = express.Router();

// mongoose.connect('mongodb://localhost:27017/myapp');

//Users
router.post("/sign-up", UserController.add);
router.post("/sign-in", UserController.login);

//Activities
router.get("/activities/:userId/:token", verifyUser, ActivityController.view);
router.post("/new-ac/:token", verifyUser, ActivityController.add);
router.put("/up-ac/:token", verifyUser, ActivityController.edit);
router.delete("/de-ac/:id/:token", verifyUser, ActivityController.delete);

// router.get("/getusers", UserController.view);

export default router;
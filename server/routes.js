import express from 'express'
import UserController from './controllers/UserController.js';
import ActivityController from './controllers/ActivityController.js';

import verifyUser from './middlewares/verifyUser.js';

const router = express.Router();

//Users
router.post("/sign-up", UserController.add);
router.post("/sign-in", UserController.login);

//Activities
router.get("/activities/:userId/:token", verifyUser, ActivityController.view);
router.get("/note/:id", verifyUser, ActivityController.getNote);
router.post("/new-ac/:token", verifyUser, ActivityController.add);
router.put("/up-ac/:token", verifyUser, ActivityController.edit);
router.delete("/de-ac/:id/:token", verifyUser, ActivityController.delete);

export default router;
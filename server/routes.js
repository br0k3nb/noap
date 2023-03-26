import express from 'express'
import UserController from './controllers/UserController.js';
import NoteController from './controllers/NoteController.js';

import verifyUser from './middlewares/verifyUser.js';

const router = express.Router();

//Users
router.post("/sign-up", UserController.add);
router.post("/sign-in", UserController.login);

//Activities
router.get("/notes/:userId/:token", verifyUser, NoteController.view);
router.get("/note/:id/:token", verifyUser, NoteController.getNote);
router.post("/add/:token", verifyUser, NoteController.add);
router.put("/update/:token", verifyUser, NoteController.edit);
router.delete("/delete/:id/:token", verifyUser, NoteController.delete);

export default router;
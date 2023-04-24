import express from 'express'
import UserController from './controllers/UserController.js';
import NoteController from './controllers/NoteController.js';

import verifyUser from './middlewares/verifyUser.js';

const router = express.Router();

//Users
router.post("/sign-up", UserController.add);
router.post("/sign-in", UserController.login);
router.post("/verify-otp", UserController.verifyOtp);
router.post("/find-user", UserController.findAndSendCode);
router.post("/sign-in/google", UserController.googleLogin);
router.patch("/change-pass", UserController.changePassword);
router.post("/verify-user/:token", verifyUser, UserController.verifyUser);
router.patch("/convert/account/email/:token", UserController.convertIntoNormalAccount);
router.patch("/convert/account/google/:token", UserController.convertIntoGoogleAccount);

//Notes
router.post("/add/:token", verifyUser, NoteController.add);
router.patch("/edit/:token", verifyUser, NoteController.edit);
router.get("/note/:id/:token", verifyUser, NoteController.getNote);
router.get("/notes/:userId/:token", verifyUser, NoteController.view);
router.delete("/delete/:id/:token", verifyUser, NoteController.delete);

export default router;
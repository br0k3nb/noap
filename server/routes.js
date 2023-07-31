import express from 'express'
import UserController from './controllers/UserController.js';
import NoteController from './controllers/NoteController.js';
import LabelController from './controllers/LabelController.js';

import verifyUser from './middlewares/verifyUser.js';

const router = express.Router();

//Users
router.post("/sign-up", UserController.add);
router.post("/sign-in", UserController.login);
router.post("/verify-otp", UserController.verifyOtp);
router.post("/2fa/remove", UserController.remove2FA);
router.post("/2fa/verify", UserController.verify2FAcode);
router.post("/find-user", UserController.findAndSendCode);
router.post("/sign-in/google", UserController.googleLogin);
router.patch("/change-pass", UserController.changePassword);
router.post("/verify-user", verifyUser, UserController.verifyUser);
router.post("/2fa/qrcode", verifyUser, UserController.generate2FAQrcode);
router.post("/verify-token", verifyUser, UserController.verifyIfTokenIsValid);
router.patch("/convert/account/email", UserController.convertIntoNormalAccount);
router.patch("/convert/account/google", UserController.convertIntoGoogleAccount);
router.post("/settings/note-text/:id", verifyUser, UserController.noteTextExpandedOrCondensed);
router.post("/settings/pin-notes-folder/:id", verifyUser, UserController.showPinnedNotesInFolder);

//Notes
router.post("/add", verifyUser, NoteController.add);
router.patch("/edit", verifyUser, NoteController.edit);
router.get("/note/:id", verifyUser, NoteController.getNote);
router.delete("/delete/:id", verifyUser, NoteController.delete);
router.get("/notes/:page/:author", verifyUser, NoteController.view);
router.post("/note/add/label", verifyUser, NoteController.addLabel);
router.post("/note/pin-note/:noteId", verifyUser, NoteController.pinNote);
router.delete("/note/delete/label/:id/:noteId", verifyUser, NoteController.deleteLabel);
router.delete("/note/delete-all/label/:noteId", verifyUser, NoteController.deleteAllLabels);

//Labels
router.get("/labels/:userId", verifyUser, LabelController.view);
router.post("/label/add/:userId", verifyUser, LabelController.add);
router.patch("/label/edit/:userId", verifyUser, LabelController.edit);
router.delete("/label/delete/:id", verifyUser, LabelController.delete);

export default router;
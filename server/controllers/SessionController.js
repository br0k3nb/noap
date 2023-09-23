import Session from "../models/Session.js";

export default {
    async view(req, res) {
        try {
            const { userId } = req.params;
            const getSessions = await Session.find({ userId });

            if(!getSessions.length) {
                return res.status(500).json({ message: 'Error, no sessions found' });
            }

            return res.status(200).json(getSessions);
        } catch (err) {
            res.status(400).json({ message: err });
        }  
    },
    async delete(req, res) {
        try {
            const { userId, sessionId } = req.params;

            if(!userId || !sessionId) {
                return res.status(401).json({ message: "Invalid request"});
            }

            await Session.remove({ _id: sessionId, userId: userId });
            return res.status(200).json({ message: "Session was terminated successfully!" });
        } catch (err) {
            res.status(400).json({ message: 'Error, please try again later!' });
        }
    },
    async deleteAllSessions(req, res) {
        try {
            const { userId } = req.params;

            if(!userId) {
                return res.status(401).json({ message: "Invalid request"});
            }

            await Session.remove({ userId });
            return res.status(200).json({ 
                message: "All sessions (including yours), were terminated, please sign in again!" 
            });
        } catch (err) {
            res.status(400).json({ message: 'Error, please try again later!' });
        }
    },
}
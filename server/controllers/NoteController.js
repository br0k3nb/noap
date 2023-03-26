import Note from '../models/Note.js';

export default {
    async view(req, res) {
        try {
            const {userId} = req.params;

            console.log(userId);

            const getActivities = await Note.find({userId}).sort({priority: 1});

            res.status(200).json(getActivities);
        } catch (err) {
            res.status(400).json({message: err});
        }
    },
    async getNote(req, res) {
        try {
            const {id} = req.params;

            const note = await Note.findById(id);

            res.status(200).json(note);
        } catch (err) {
            res.status(400).json({message: err});
        }
    },
    async add(req , res) {
        try {
            const {title, body, state, userId} = req.body;

            await Note.create({
                // title,
                body,
                state,
                userId
            });
           
            res.status(200).json({message: 'Saved susccessfuly!'});
        } catch (err) {
            console.log(err);
            res.status(400).json('Internal error, please try again or later!');
        }
    },
    async edit(req, res) {
        try {
            const {id, title, body, state} = req.body;

            await Note.findOneAndUpdate({_id: id}, {title, body, state});

            res.status(200).json('Note updated!');
           
        } catch (err) {
            res.status(400).json(err);
        }
    },
    async delete(req, res) {
        try {
            const {id} = req.params;

            await Note.findByIdAndDelete(id);
            
            res.status(200).json({message: 'Note deleted!'});
        } catch (err) {
            console.log(err);
            res.status(400).json({message: err});
        }
    }
}
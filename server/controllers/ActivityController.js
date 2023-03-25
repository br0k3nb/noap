import Activity from '../models/Activity.js';

export default {
    async view(req, res) {
        try {
            const {userId} = req.params;

            console.log(userId);

            const getActivities = await Activity.find({userId}).sort({priority: 1});

            res.status(200).json(getActivities);
        } catch (err) {
            res.status(400).json({message: err});
        }
    },
    async getNote(req, res) {
        try {
            const {id} = req.params;

            const note = await Activity.findById(id);

            res.status(200).json(note);
        } catch (err) {
            res.status(400).json({message: err});
        }
    },
    async add(req , res) {
        try {
            const {title, body, state, userId} = req.body;

            await Activity.create({
                title,
                body,
                state,
                userId
            });
           
            res.status(200).json({message: 'Saved susccessfuly!'});
        } catch (err) {
            res.status(400).json('Internal error, please try again or later!');
        }
    },
    async edit(req, res) {
        try {
            const {id, title, body, state} = req.body;

            await Activity.findOneAndUpdate({_id: id}, {title, body, state});

            res.status(200).json('Note updated!');
           
        } catch (err) {
            res.status(400).json(err);
        }
    },
    async delete(req, res) {
        try {
            const {id} = req.params;

            await Activity.findByIdAndDelete(id);
            
            res.status(200).json({message: 'Note deleted!'});
        } catch (err) {
            console.log(err);
            res.status(400).json({message: err});
        }
    }
}
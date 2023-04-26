import Note from '../models/Note.js';
import Label from '../models/Label.js';

export default {
    async view(req, res) {
        try {
            const {userId} = req.params;

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
            const {title, body, image, state, userId} = req.body;

            await Note.create({
                title,
                body,
                image,
                state,
                userId
            });
           
            res.status(200).json({message: 'Saved susccessfuly!'});
        } catch (err) {
            console.log(err);
            res.status(400).json({message: 'Error, please try again later!'});
        }
    },
    async addLabel(req , res) {
        try {
            const { labelId, noteId } = req.body;

            const label = await Label.findById(labelId);

            await Note.findOneAndUpdate({_id: noteId}, {
                labels: {
                    _id: label._id,
                    name: label.name,
                    color: label.color,
                    fontColor: label?.fontColor,
                    type: label.type
                }
            });

            res.status(200).json({message: 'Label attached!'});
        } catch (err) {
            console.log(err);
            res.status(400).json({message: 'Error, please try again later!'});
        }
    },
    async edit(req, res) {
        try {
            const {_id, title, body, image, state} = req.body;

            await Note.findOneAndUpdate({_id}, {title, body, image, state});

            res.status(200).json({message: 'Note updated!'});
        } catch (err) {
            console.log(err);
            res.status(400).json({message: 'Error, please try again later!'});
        }
    },
    async delete(req, res) {
        try {
            const {id} = req.params;

            await Note.findByIdAndDelete(id);
            
            res.status(200).json({message: 'Note deleted!'});
        } catch (err) {
            console.log(err);
            res.status(400).json({message: 'Error, please try again later!'});
        }
    }
}
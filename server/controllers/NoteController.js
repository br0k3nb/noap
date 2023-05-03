import Note from '../models/Note.js';
import NoteState from '../models/NoteState.js';
import Label from '../models/Label.js';

// import { ObjectId } from 'mongoose';

export default {
    async view(req, res) {
        try {
            const {userId} = req.params;

            const aggregate = Note.aggregate(
                [
                    {
                        $match: {
                          userId
                        }
                    }, 
                    {
                        $lookup: {
                          from: 'noteStates', 
                          localField: 'state', 
                          foreignField: '_id', 
                          as: 'state'
                        }
                    }, 
                    {
                        $unwind: {
                            path: '$state', 
                            preserveNullAndEmptyArrays: false
                        }
                    }
                ]
            );

            const notes = await Note.aggregatePaginate(aggregate);

            res.status(200).json(notes.docs);

            // const {userId} = req.params;

            // const getActivities = await Note.find({userId}).sort({priority: 1});

            // res.status(200).json(getActivities);
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

            const saveState = await NoteState.create({ state });

            const saveNote = await Note.create({
                title,
                body,
                image,
                state: saveState._id,
                userId
            });

            await NoteState.findOneAndUpdate({_id: saveState._id}, { noteId: saveNote._id });

            res.status(200).json({message: 'Saved susccessfuly!'});

            // const {title, body, image, state, userId} = req.body;

            // await Note.create({
            //     title,
            //     body,
            //     image,
            //     state,
            //     userId
            // });
           
            // res.status(200).json({message: 'Saved susccessfuly!'});
        } catch (err) {
            console.log(err);
            res.status(400).json({message: 'Error, please try again later!'});
        }
    },
    async addLabel(req , res) {
        try {
            const { labels, noteId } = req.body;

            const findLabels = await Label.find({
                '_id': { $in: labels}
            });

            if(findLabels.length === 0) return res.status(400).json({ message: "No labels found!" });

            const note = await Note.findById(noteId);

            if(note?.labels.length !== 0) {
                for(const [idx, noteLabel] of note.labels.entries()) {
                    for(const [index, label] of findLabels.entries()) {
                        if(noteLabel._id.toString() === label._id.toString()) {
                            throw ({ message: "Label already attached!" });
                        }
                    }
                }
            }
           
            console.log('i was executed');

            await Note.findOneAndUpdate({_id: noteId}, {
                labels: [
                    ...note.labels,
                    ...findLabels
                ]
            });

            res.status(200).json({message: 'Label attached!'});
        } catch (err) {
            console.log(err);
            if(err?.message) res.status(400).json(err);
            else res.status(400).json({message: 'Error, please try again later!'});
        }
    },
    async edit(req, res) {
        try {
            const { _id, title, body, image, state, stateId } = req.body;

            await Note.findOneAndUpdate({_id}, { title, body, image });
            const test = await NoteState.findByIdAndUpdate({_id: stateId}, { state });

            console.log(test);

            res.status(200).json({message: 'Note updated!'});

            // const {_id, title, body, image, state} = req.body;

            // await Note.findOneAndUpdate({_id}, {title, body, image, state});

            // res.status(200).json({message: 'Note updated!'});
        } catch (err) {
            console.log(err);
            res.status(400).json({message: 'Error, please try again later!'});
        }
    },
    async delete(req, res) {
        try {
            const {id} = req.params;
            const getStateId = await Note.findById({ _id: id });

            await NoteState.findByIdAndDelete(getStateId.state);
            await Note.findByIdAndDelete(id);
            
            res.status(200).json({message: 'Note deleted!'});
        } catch (err) {
            console.log(err);
            res.status(400).json({message: 'Error, please try again later!'});
        }
    },
    async deleteLabel(req, res) {
        try {
            const {id, noteId} = req.params;
            const note = await Note.findById({ _id: noteId });

            if(!note) res.status(400).json({ message: "Note wasn't found!"});

            const labelToDelete = note.labels.find(({_id}) => _id.toString() === id);

            if(!labelToDelete.length === 0) res.status(400).json({ message: "Label not found!"});

            note.labels.splice(note.labels.indexOf(labelToDelete), 1);

            await Note.findByIdAndUpdate({_id: noteId}, { 
                labels: note.labels
            });
            
            res.status(200).json({message: 'Label detached!'});
        } catch (err) {
            console.log(err);
            res.status(400).json({message: 'Error, please try again later!'});
        }
    },
    async deleteAllLabels(req, res) {
        try {
            const { noteId } = req.params;

            await Note.findByIdAndUpdate({_id: noteId}, { 
                labels: []
            });
            
            res.status(200).json({message: 'Labels detached!'});
        } catch (err) {
            console.log(err);
            res.status(400).json({message: 'Error, please try again later!'});
        }
    }
}
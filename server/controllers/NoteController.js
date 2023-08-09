import Note from '../models/Note.js';
import NoteState from '../models/NoteState.js';
import Label from '../models/Label.js';

export default {
    async view(req, res) {
        try {
            const { author, page } = req.params;
            if(!author || !page) return res.status(404).json({ message: "Access denied!" });

            const { search, limit, pinnedNotesPage } = req.query;

            const searchRegex = new RegExp(search, 'i');

            if(!search.length) {
                const aggregate = Note.aggregate(
                    [
                        {
                            $match: {
                                author,
                                'settings.pinned': false
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
                        },
                        {
                            $lookup: {
                                from: "labels",
                                localField: "labels",
                                foreignField: "_id",
                                as: "labels"
                            }
                        },
                        {   $unwind: {
                                path: '$labels',
                                preserveNullAndEmptyArrays: true
                            }
                        },
                        {
                            $group: {
                                _id: "$_id",
                                author: { $first: "$author" },
                                name: { $first: "$name"},
                                body: { $first: "$body"},
                                image: { $first: "$image" },
                                state: { $first: "$state" },
                                settings: { $first: "$settings" },
                                labels: { $push: "$labels" },
                                createdAt: { $first: "$createdAt" },
                                updatedAt: { $first: "$updatedAt" }
                            }
                        },
                        {
                            $sort: { createdAt: 1 }
                        }
                    ]
                );

                const aggregatePinnedNotes = Note.aggregate(
                    [
                        {
                            $match: {
                                author,
                                'settings.pinned': true
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
                        },
                        {
                            $lookup: {
                                from: "labels",
                                localField: "labels",
                                foreignField: "_id",
                                as: "labels"
                            }
                        },
                        {   $unwind: {
                                path: '$labels',
                                preserveNullAndEmptyArrays: true
                            }
                        },
                        {
                            $group: {
                                _id: "$_id",
                                author: { $first: "$author" },
                                name: { $first: "$name"},
                                body: { $first: "$body"},
                                image: { $first: "$image" },
                                state: { $first: "$state" },
                                settings: { $first: "$settings" },
                                labels: { $push: "$labels" },
                                createdAt: { $first: "$createdAt" },
                                updatedAt: { $first: "$updatedAt" }
                            }
                        },
                        {
                            $sort: { createdAt: 1 }
                        }
                    ]
                );    

                const notes = await Note.aggregatePaginate(aggregate, { page, limit });
                const pinnedNotes = await Note.aggregatePaginate(aggregatePinnedNotes, { 
                    page: pinnedNotesPage, 
                    limit: 10
                });

                return res.status(200).json({ notes, pinnedNotes });
            };

            if(search.length > 0) {
                const aggregate = Note.aggregate(
                    [
                        {
                            $match: {
                                author,
                                $or: [
                                    { name: searchRegex },
                                    { 'labels.name': searchRegex }
                                ],
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
                        },
                        {
                            $lookup: {
                                from: "labels",
                                localField: "labels",
                                foreignField: "_id",
                                as: "labels"
                            }
                        },
                        {   $unwind: {
                                path: '$labels',
                                preserveNullAndEmptyArrays: true
                            }
                        },
                        {
                            $group: {
                                _id: "$_id",
                                author: { $first: "$author" },
                                title: { $first: "$title"},
                                body: { $first: "$body"},
                                image: { $first: "$image" },
                                state: { $first: "$state" },
                                settings: { $first: "$settings" },
                                labels: { $push: "$labels" },
                                createdAt: { $first: "$createdAt" },
                                updatedAt: { $first: "$updatedAt" }
                            }
                        },
                        {
                            $sort: { createdAt: 1 }
                        }
                    ]
                );

                const notes = await Note.aggregatePaginate(aggregate, { page, limit });
                return res.status(200).json({ notes, pinnedNotes: {} });
            }

        } catch (err) {
            res.status(400).json({ message: err });
        }
    },
    async getNote(req, res) {
        try {
            const { id } = req.params;
            const note = await Note.findById(id);
            res.status(200).json(note);
        } catch (err) {
            res.status(400).json({ message: err });
        }
    },
    async add(req , res) {
        try {
            const { name, body, image, state, author, settings } = req.body;

            const { _id } = await NoteState.create({ state });
            const { _id: noteId } = await Note.create({
                name, 
                body,
                image,
                state: _id,
                author,
                settings
            });

            await NoteState.findOneAndUpdate({ _id }, { noteId });
            res.status(200).json({ message: 'Saved susccessfuly!' });
        } catch (err) {
            console.log(err);
            res.status(400).json({ message: 'Error creating a new note, please try again or later' });
        }
    },
    async addLabel(req , res) {
        try {
            const { labels, noteId } = req.body;

            const note = await Note.findById(noteId);
            
            let flag = false;
            let duplicatedLabel = "";
            
            for (const val of note.labels) {
                if(flag) break;

                for (const values of labels) {
                    if(values === val.toString()) {
                        const label = await Label.findById(val);
                        duplicatedLabel = label.name;
                        flag = true;
                    
                        break;
                    };
                };
            };

            if(duplicatedLabel.length > 0) {
                return res.status(400).json({ 
                    message: `Label ${duplicatedLabel} is already attached to note!` 
                });
            };
            
            await Note.findOneAndUpdate({ _id: noteId }, { 
                labels: [ ...note.labels, ...labels ] 
            });

            res.status(200).json({ message: 'Label attached!' });
        } catch (err) {
            console.log(err);
            res.status(400).json({ message: 'Error, please try again later!' });
        }
    },
    async edit(req, res) {
        try {
            const { _id, title, body, image, state, stateId } = req.body;

            await Note.findOneAndUpdate({ _id }, { title, body, image });
            await NoteState.findByIdAndUpdate({ _id: stateId }, { state });
            
            res.status(200).json({ message: 'Note updated!' });
        } catch (err) {
            res.status(400).json({ message: 'Error, please try again later!' });
        }
    },
    async delete(req, res) {
        try {
            const { id } = req.params;
            const { state } = await Note.findById({ _id: id });

            await NoteState.findByIdAndDelete(state);
            await Note.findByIdAndDelete(id);
            
            res.status(200).json({ message: 'Note deleted!' });
        } catch (err) {
            res.status(400).json({ message: 'Error, please try again later!' });
        }
    },
    async deleteLabel(req, res) {
        try {
            const { id, noteId } = req.params;

            const { labels } = await Note.findById({ _id: noteId });

            if(!labels) res.status(400).json({ message: "Note wasn't found!"});

            const filtredLabels = labels.filter(_id => _id.toString() !== id);
            
            await Note.findByIdAndUpdate({ _id: noteId }, { labels: filtredLabels });
            
            res.status(200).json({ message: 'Label detached!' });
        } catch (err) {
            console.log(err);
            res.status(400).json({ message: 'Error, please try again later!' });
        }
    },
    async deleteAllLabels(req, res) {
        try {
            const { noteId } = req.params;
            
            await Note.findByIdAndUpdate({ _id: noteId }, { labels: [] });  

            res.status(200).json({ message: 'Labels detached!' });
        } catch (err) {
            res.status(400).json({ message: 'Error, please try again later!' });
        }
    },
    async pinNote(req, res) {
        try {
            const { noteId } = req.params;
            const { condition } = req.body;
            
            await Note.findByIdAndUpdate({ _id: noteId }, { 
                settings: {
                    pinned: condition
                }
            });  

            res.status(200).json({ message: `${condition ? "Note pinned!" : "Note unpinned!"}` });
        } catch (err) {
            res.status(400).json({ message: 'Error, please try again later!' });
        }
    },
    async renameNote(req, res) {
        try {
            const { id } = req.params;
            const { name } = req.body;
            
            await Note.findByIdAndUpdate({ _id: id }, { name });  

            res.status(200).json({ message: "Updated!" });
        } catch (err) {
            res.status(400).json({ message: 'Error, please try again later!' });
        }
    }
}
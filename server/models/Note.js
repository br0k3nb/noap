import mongoose from 'mongoose';
import NoteSchema from '../schemas/NoteSchema.js';

import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';

NoteSchema.pre('findOneAndUpdate', function (next) {
    this.findOneAndUpdate({}, { updatedAt: new Date() });
    next();
});

NoteSchema.pre('save', function (next) {
    if (!this.isNew) this.updatedAt = new Date();
    next();
});

NoteSchema.plugin(mongooseAggregatePaginate);

const Note = mongoose.model('Note', NoteSchema, 'notes');

Note.createIndexes();

export default Note;
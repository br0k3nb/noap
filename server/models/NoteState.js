import mongoose from 'mongoose';
import NoteStateSchema from '../schemas/NoteStateSchema.js';

import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';

NoteStateSchema.pre('findOneAndUpdate', function (next) {
    this.findOneAndUpdate({}, { updatedAt: new Date() });
    next();
});

NoteStateSchema.pre('save', function (next) {
    if (!this.isNew) this.updatedAt = new Date();
    next();
});

NoteStateSchema.plugin(mongooseAggregatePaginate);

const NoteState = mongoose.model('NoteState', NoteStateSchema, 'noteStates');

NoteState.createIndexes();

export default NoteState;
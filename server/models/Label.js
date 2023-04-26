import mongoose from 'mongoose';
import LabelSchema from '../schemas/LabelSchema.js';

import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';

LabelSchema.pre('findOneAndUpdate', function (next) {
    this.findOneAndUpdate({}, {updatedAt: new Date()});

    next();
});

LabelSchema.pre('save', function (next) {
    if (!this.isNew)
        this.updatedAt = new Date();

    next();
});

LabelSchema.plugin(mongooseAggregatePaginate);

const Label = mongoose.model('Label', LabelSchema, 'labels');

Label.createIndexes();

export default Label;
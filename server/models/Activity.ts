import mongoose from 'mongoose';
import ActivitySchema from '../schemas/ActivitySchema';

const mongooseAggregatePaginate = require('mongoose-aggregate-paginate-v2');

ActivitySchema.pre('findOneAndUpdate', function (next) {
    this.findOneAndUpdate({}, {updatedAt: new Date()});

    next();
});

ActivitySchema.pre('save', function (next) {
    if (!this.isNew)
        this.updatedAt = new Date();

    next();
});

ActivitySchema.plugin(mongooseAggregatePaginate);

const Activity = mongoose.model('Activity', ActivitySchema, 'activities');

Activity.createIndexes();

export default Activity;
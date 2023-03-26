import mongoose from 'mongoose';

export default new mongoose.Schema({
    title: {
        type: String,
        required: false, //setting to false just for testing purposes
    },
    body: {
        type: String,
        required: false,
    },
    state: {
        type: String,
        required: true,
    },
    userId: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: Date
});
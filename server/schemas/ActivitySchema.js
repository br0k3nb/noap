import mongoose from 'mongoose';

export default new mongoose.Schema({
    title: {
        type: String,
        required: false, //setting to false just for testing purposes
    },
    body: {
        type: String,
        required: true,
    },
    bookmark: {
        type: Boolean,
        required: false,
    },
    bookmarkColor: {
        type: String,
        required: false,
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
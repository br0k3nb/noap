import mongoose from 'mongoose';

export default new mongoose.Schema({
    title: {
        type: String,
        required: false,
    },
    body: {
        type: String,
        required: false,
    },
    labels: {
        type: mongoose.Schema.Types.Mixed,
        required: false,
    },
    image: {
        type: String,
        required: true,
    },
    state: {
        type: mongoose.Schema.Types.Mixed,
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
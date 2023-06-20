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
    labels: [{
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: 'Label'
    }],
    image: {
        type: String,
        required: false,
    },
    state: {
        type: mongoose.Schema.Types.Mixed,
        required: true,
    },
    settings: {
        shared: {
            type: Boolean,
            required: true
        },
        permissions: {
            type: mongoose.Schema.Types.Mixed,
            required: false
        },
        pinned: {
            type: Boolean,
            required: false
        }
    },
    author: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: Date
});
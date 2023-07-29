import mongoose from 'mongoose';

export default new mongoose.Schema({
    state: {
        type: String,
        required: true,
    },
    noteId: {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: Date
});
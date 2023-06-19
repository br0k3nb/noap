import mongoose from 'mongoose';

export default new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: false
    },
    verified: {
        type: Boolean,
        required: false
    },
    googleId: {
        type: String,
        required: false
    },
    TFAStatus : {
        type: mongoose.Schema.Types.ObjectId,
        required: false
    },
    googleAccount: {
        type: Boolean,
        required: false
    },
    settings: {
        showPinnedNotesInFolder: {
            type: Boolean,
            required: false
        },
        language: {
            type: String,
            required: false
        }
    }
});
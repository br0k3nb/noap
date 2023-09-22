import mongoose from 'mongoose';

export default new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    token: {
        type: String,
        required: true
    },
    expAt: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },  
    ip: {
        type: String,
        required: true
    },
    browserData: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    deviceData: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});
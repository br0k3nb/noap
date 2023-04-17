import mongoose from 'mongoose';

export default new mongoose.Schema({
    userId: {
        type: String,
        required: true,
    },
    otp: {
        type: String,
        required: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    expiresAt: Date,
    spam: Date
});
import mongoose from 'mongoose';

export default new mongoose.Schema({
    qrcode: {
        type: String,
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    secret: {
        type: String,
        required: true
    },
    verified: {
        type: Boolean,
        required: true
    }
});
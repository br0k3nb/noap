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
    options: {
        useToResetPass: {
            type: Boolean,
            required: false
        }
    },
    verified: {
        type: Boolean,
        required: true
    }
});
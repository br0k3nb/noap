import mongoose from 'mongoose';

export default new mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    profilePicture: {
        type: String,
        required: false 
    },
    password: {
        type: String,
        required: true,
    },
});
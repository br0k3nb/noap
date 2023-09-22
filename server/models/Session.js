import mongoose from 'mongoose';
import SessionSchema from '../schemas/SessionSchema.js';

const Session = mongoose.model('Session', SessionSchema);

export default Session;
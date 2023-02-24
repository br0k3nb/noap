import mongoose from 'mongoose';
import userSchema from '../schemas/UserSchema';

const User = mongoose.model('User', userSchema);

export default User;
import mongoose from 'mongoose';
import OTPSchema from '../schemas/OTPSchema.js';

import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';

OTPSchema.plugin(mongooseAggregatePaginate);

const Otp = mongoose.model('Otp', OTPSchema, 'otps');

Otp.createIndexes();

export default Otp;
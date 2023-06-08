import mongoose from 'mongoose';
import TwoFactAuthSchema from '../schemas/TwoFactAuthSchema.js';

import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';

TwoFactAuthSchema.plugin(mongooseAggregatePaginate);

const TFA = mongoose.model('2FA', TwoFactAuthSchema, '2fa');

TFA.createIndexes();

export default TFA;